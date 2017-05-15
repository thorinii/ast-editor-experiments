function StateContainer (initial, reducer) {
  this._state = initial
  this._reducer = reducer
}

StateContainer.prototype.get = function () {
  return this._state
}

StateContainer.prototype.apply = function (action) {
  this._state = this._reducer(this._state, action)
}

module.exports = StateContainer
