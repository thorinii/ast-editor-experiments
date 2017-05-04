define([], function () {
  function StateContainer (initial, reducer) {
    this._state = initial
    this._reducer = reducer
    this._listener = null
    this._actionQueue = []
  }

  StateContainer.prototype.setListener = function (listener) {
    if (this._listener !== null) throw new Error('Can only set one listener on the StateContainer')
    this._listener = listener
  }

  StateContainer.prototype.get = function () {
    return this._state
  }

  StateContainer.prototype.dispatch = function (action) {
    this._actionQueue.push(action)
    this._schedule()
  }

  StateContainer.prototype._schedule = function () {
    if (this._scheduled === true) return
    this._scheduled = true
    window.setTimeout(() => {
      this._scheduled = false
      this._execute()
    })
  }

  StateContainer.prototype._execute = function () {
    this._state = this._actionQueue.reduce((state, action) => this._reducer(state, action), this._state)
    this._actionQueue = []
    this._listener(this._state)
  }

  return StateContainer
})
