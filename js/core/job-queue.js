define([], function () {
  const createQueue = () => {
    return {
      queued: [],
      running: {}
    }
  }

  const createJob = (type, params) => {
    return { type: type, params: params }
  }

  const enqueue = (queue, job) => {
    return Object.assign({}, queue, {
      queued: queue.queued.concat([job])
    })
  }

  const dequeue = queue => {
    if (Object.keys(queue.running).length > 0) return { nextQueue: queue, job: null }
    if (queue.queued.length === 0) return { nextQueue: queue, job: null }

    const job = queue.queued[0]
    return {
      nextQueue: Object.assign({}, queue, {
        queued: queue.queued.slice(1)
      }),
      job: job
    }
  }

  const start = (queue, job, id) => {
    const patch = {}
    patch[id] = job
    return Object.assign({}, queue, {
      running: Object.assign({}, queue.running, patch)
    })
  }

  const finish = (queue, id) => {
    const job = queue.running[id]

    const nextRunning = Object.assign({}, queue.running)
    delete nextRunning[id]

    return {
      nextQueue: Object.assign({}, queue, {
        running: nextRunning
      }),
      job: job
    }
  }

  return {
    createQueue: createQueue,
    createJob: createJob,

    enqueue: enqueue,
    dequeue: dequeue,

    start: start,
    finish: finish
  }
})
