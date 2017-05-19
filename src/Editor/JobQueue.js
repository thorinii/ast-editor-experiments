var JobQueue = require('../core/job-queue.js')

exports.empty = JobQueue.createQueue()

exports.enqueue = function (job) { return function (queue) {
  return JobQueue.enqueue(queue, job)
}}
