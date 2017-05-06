define(['ast/bootstrap-compiler'], function (Bootstrap) {
  return function (executor) {
    executor.registerTask('compile', (input, callback) => {
      try {
        const result = Bootstrap.translate(input)
        callback(result)
      } catch (e) {
        console.warn('Failed to compile', e)
        callback(null)
      }
    })
  }
})
