define(['../ast/bootstrap-compiler', './job-queue'], function (Bootstrap, JobQueue) {
  const TASK_NAME = 'compile'

  return function (executor) {
    executor.registerWatcher('code', 'compiled', TASK_NAME)

    executor.registerTask(TASK_NAME, (input, callback) => {
      try {
        const result = Bootstrap.translate(input)
        callback(null, result)
      } catch (e) {
        console.warn('Failed to compile', e)
        callback(e, null)
      }
    })
  }
})
