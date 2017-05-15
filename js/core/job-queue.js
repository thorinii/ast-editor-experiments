const createQueue = () => {
  return {
    queued: [],
    running: {}
  }
}

const createJob = (type, params) => {
  return { type: type, params: params }
}

const isIdle = queue => Object.keys(queue.running).length === 0
const isEmpty = queue => queue.queued.length === 0

const isSameJob = (a, b) => {
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
  return same(Object.keys(a.params).sort(), Object.keys(b.params).sort()) &&
         same(Object.keys(a.params).sort().map(key => a[key]), Object.keys(b.params).sort().map(key => b[key]))
}
const enqueue = (queue, job) => {
  if (queue.queued.find(j => {
    return isSameJob(j, job)
  })) return queue

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

const running = queue => {
  return Object.keys(queue.running).map(key => queue.running[key])
}
const queued = queue => {
  return queue.queued
}

module.exports = {
  createQueue,
  createJob,

  isIdle,
  isEmpty,

  enqueue,
  dequeue,

  start,
  finish,

  running,
  queued
}
