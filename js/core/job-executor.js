define(['core/job-queue'], function (Queue) {
  function JobExecutor (callback, updateCache) {
    this._callback = callback
    this._updateCache = updateCache
    this._counter = 0

    this._tasks = {}
    this._watchers = []

    this._finishedList = []
  }

  JobExecutor.prototype.registerTask = function (name, fn) {
    this._tasks[name] = fn
  }
  JobExecutor.prototype.registerWatcher = function (source, target, task) {
    this._watchers.push(state => Object.keys(state[source])
      .map(name => {
        const input = state[source][name]
        const cacheTarget = state.cache[target] || {}
        const cachedResult = cacheTarget[name] || null

        const changed = cachedResult === null || input !== cachedResult.input

        if (changed) {
          return Queue.createJob(task, {
            source: source,
            source_key: name,
            target: target,
            target_key: name
          })
        } else {
          return null
        }
      })
      .filter(task => task !== null))
  }

  JobExecutor.prototype.processWatchers = function (state, queue) {
    return this._watchers.reduce((q, watcher) => {
      const tasks = watcher(state)
      return tasks.reduce((q, task) => Queue.enqueue(q, task), q)
    }, queue)
  }

  JobExecutor.prototype.process = function (state, queue) {
    return this._startJobs(state, this._finishJobs(queue))
  }

  JobExecutor.prototype._startJobs = function (state, queue) {
    let nextQueue = queue
    let job

    do {
      const r = Queue.dequeue(nextQueue)
      nextQueue = r.nextQueue
      job = r.job

      if (job !== null) {
        nextQueue = this._startJob(state, nextQueue, job)
      }
    } while (job !== null)

    return nextQueue
  }

  JobExecutor.prototype._startJob = function (state, queue, job) {
    const id = this._counter++

    const input = state[job.params.source][job.params.source_key]
    const fn = this._tasks[job.type]

    const onFinished = (error, result) => {
      let cacheEntry
      if (error) {
        cacheEntry = {
          success: false,
          input: input,
          output: null
        }
      } else {
        cacheEntry = {
          success: true,
          input: input,
          output: result
        }
      }

      this._finishedList.push({ id, result: cacheEntry })
      this._callback()
    }

    setTimeout(() => {
      fn(input, onFinished)
    })

    return Queue.start(queue, job, id)
  }

  JobExecutor.prototype._finishJobs = function (queue) {
    const nextQueue = this._finishedList.reduce((q, finished) => {
      const {id, result} = finished
      const {nextQueue, job} = Queue.finish(q, id)

      this._updateCache(job.params.target, job.params.target_key, result)

      return nextQueue
    }, queue)

    this._finishedList = []
    return nextQueue
  }

  return JobExecutor
})
