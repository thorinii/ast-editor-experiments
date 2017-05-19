import JobQueue from '../Editor/JobQueue'

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
  this._watchers.push(state => {
    const sourceMap = (source === 'code' ? state.code : state.cache[source]) || {}
    const targetMap = state.cache[target] || {}

    return Object.keys(sourceMap)
      .map(key => {
        let input = sourceMap[key]
        if (source !== 'code') {
          if (input.success) {
            input = input.output
          } else {
            return null
          }
        }

        const cachedResult = targetMap[key] || null

        const changed = cachedResult === null || input !== cachedResult.input
        if (changed) {
          return {
            type: task,
            params: {
              source: source,
              source_key: key,
              target: target,
              target_key: key
            }
          }
        } else {
          return null
        }
      })
      .filter(task => task !== null)
  })
}

JobExecutor.prototype.processWatchers = function (state, queue) {
  return this._watchers.reduce((q, watcher) => {
    const tasks = watcher(state)
    return tasks.reduce((q, task) => JobQueue.enqueue(task)(q), q)
  }, queue)
}

JobExecutor.prototype.process = function (state, queue) {
  return this._startJobs(state, this._finishJobs(queue))
}

JobExecutor.prototype._startJobs = function (state, queue) {
  let nextQueue = queue
  let job

  do {
    const qj = JobQueue.dequeue(nextQueue)
    nextQueue = qj.value0
    job = qj.value1.value0 ? qj.value1.value0 : null

    if (job !== null) {
      nextQueue = this._startJob(state, nextQueue, job)
    }
  } while (job !== null)

  return nextQueue
}

JobExecutor.prototype._startJob = function (state, queue, job) {
  const id = this._counter++

  let input
  if (job.params.source === 'code') {
    input = state.code[job.params.source_key]
  } else {
    const sourceMap = state.cache[job.params.source] || {}
    const inputWrapped = sourceMap[job.params.source_key]

    if (inputWrapped.success) {
      input = inputWrapped.output
    } else {
      console.log('Skipping job because input is not success', job)
      return queue
    }
  }
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

  return JobQueue.start(id)(job)(queue)
}

JobExecutor.prototype._finishJobs = function (queue) {
  const nextQueue = this._finishedList.reduce((q, finished) => {
    const {id, result} = finished

    const qj = JobQueue.finish(id)(q)
    const nextQueue = qj.value0
    const job = qj.value1.value0 ? qj.value1.value0 : null

    this._updateCache(job.params.target, job.params.target_key, result)

    return nextQueue
  }, queue)

  this._finishedList = []
  return nextQueue
}

module.exports = JobExecutor
