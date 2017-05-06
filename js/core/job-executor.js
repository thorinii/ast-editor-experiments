define(['core/job-queue'], function (Queue) {
  function JobExecutor (callback) {
    this._callback = callback
    this._counter = 0

    this._finishedList = []
  }

  JobExecutor.prototype.process = function (queue) {
    return this._startJobs(this._finishJobs(queue))
  }

  JobExecutor.prototype._startJobs = function (queue) {
    let nextQueue = queue
    let job

    do {
      const r = Queue.dequeue(nextQueue)
      nextQueue = r.nextQueue
      job = r.job

      if (job !== null) {
        nextQueue = this._startJob(nextQueue, job)
      }
    } while (job !== null)

    return nextQueue
  }

  JobExecutor.prototype._startJob = function (queue, job) {
    const id = this._counter++

    const onFinished = result => {
      this._finishedList.push({ id: id, result: result })
      this._callback()
    }

    setTimeout(() => {
      const result = {}
      onFinished(result)
    }, 1000)

    return Queue.start(queue, job, id)
  }

  JobExecutor.prototype._finishJobs = function (queue) {
    const nextQueue = this._finishedList.reduce((q, finished) => {
      const {id, result} = finished
      const {nextQueue, job} = Queue.finish(q, id)

      job.params.target // TODO: store the result
      result

      return nextQueue
    }, queue)

    this._finishedList = []
    return nextQueue
  }

  return JobExecutor
})
