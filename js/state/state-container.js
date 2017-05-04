define([], function () {
  function StateContainer (initial) {
    this._listener = null
    this._state = initial
    this._queue = []
  }

  StateContainer.prototype.setListener = function (listener) {
    if (this._listener !== null) throw new Error('Can only set one listener on the StateContainer')
    this._listener = listener
  }

  StateContainer.prototype.get = function () {
    return this._state
  }

  StateContainer.prototype.dispatch = function (transformer) {
    this._queue.push(transformer)
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
    this._state = this._queue.reduce((acc, t) => t(acc), this._state)
    this._queue = []
    this._listener(this._state)
  }

  return StateContainer
})
