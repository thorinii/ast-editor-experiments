define(['core/job-queue'], function (JobQueue) {
  const TASK_NAME = 'test'

  const compile = js => eval('(' + js + ')') // eslint-disable-line

  return function (executor) {
    executor.registerWatcher('compiled', 'tested', TASK_NAME)

    executor.registerTask(TASK_NAME, (input, callback) => {
      try {
        const compiled = compile(input)

        if (typeof compiled === 'function') {
          callback(null, 'test succeeded')
        } else {
          callback(null, JSON.stringify(compiled))
        }
      } catch (e) {
        console.warn('Failed to test', e)
        callback(e, null)
      }
    })
  }
})
