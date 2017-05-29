exports._call = function (listener) {
  return function (state) {
    return function () {
      return listener(state)
    }
  }
}
