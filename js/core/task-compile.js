define(['ast/bootstrap-compiler', 'core/job-queue'], function (Bootstrap, JobQueue) {
  const TASK_NAME = 'compile'

  return function (executor) {
    executor.registerTask(TASK_NAME, (input, callback) => {
      try {
        const result = Bootstrap.translate(input)
        callback({
          success: true,
          input: input,
          output: result
        })
      } catch (e) {
        console.warn('Failed to compile', e)
        callback({
          success: false,
          input: input,
          output: null
        })
      }
    })

    executor.registerWatcher(state => {
      const source = 'code'
      const target = 'compiled'

      const codeNames = Object.keys(state[source])
      return codeNames
        .map(name => {
          const input = state[source][name]
          const cacheTarget = state.cache[target] || {}
          const cachedResult = cacheTarget[name] || null

          const changed = cachedResult === null || input !== cachedResult.input

          if (changed) {
            return JobQueue.createJob(TASK_NAME, {
              source: source,
              source_key: name,
              target: target,
              target_key: name
            })
          } else {
            return null
          }
        })
        .filter(task => task !== null)
    })
  }
})
