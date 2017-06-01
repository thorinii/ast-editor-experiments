exports._call = function (listener) {
  return function (state) {
    return function () {
      try {
        return listener(state)
      } catch (e) {
        console.error('Crashed in listener', e)
      }
    }
  }
}
