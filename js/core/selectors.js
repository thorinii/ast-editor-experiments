define(['core/job-queue'], function (JobQueue) {
  const cache = (state, target) => state.cache[target] || {}
  const mapCache = (state, target, fn) => {
    const c = cache(state, target)
    return Object.keys(c).map(key => fn(key, c[key]))
  }

  const status = state => {
    const failedCompiles = mapCache(state, 'compiled', (key, value) => [key, value])
      .filter(kv => !kv[1].success)
      .map(kv => kv[0])

    const runningJobs = JobQueue.running(state.jobQueue).map(job => job.type)
    const waitingJobs = JobQueue.queued(state.jobQueue).map(job => job.type)

    let level = 0
    let message = ''

    if (runningJobs.length > 0) {
      if (message) message += '\n'
      message += runningJobs.map(type => type.charAt(0).toUpperCase() + type.slice(1)).join(', ')
      if (waitingJobs.length > 0) {
        message += ' (' + waitingJobs.map(type => type.charAt(0).toUpperCase() + type.slice(1)).join(', ') + ')'
      }
    }

    if (failedCompiles.length > 0) {
      if (message) message += '\n'
      level = Math.max(level, 2)
      message += 'Failed to compile: ' + failedCompiles.join(', ')
    }

    if (!message) {
      message = 'Idle'
    }

    return { level: (['info', 'warn', 'error'])[level], message }
  }

  return {
    status
  }
})
