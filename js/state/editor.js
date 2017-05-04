define(['state/keymap'], function (KeyMap) {
  'use strict'

  const initialState = Object.freeze({
    status: 'Idle',
    ast: {type: 'hole'},
    cursor: null
  })

  function compile (js) {
    return eval('(' + js + ')') // eslint-disable-line
  }

  function Editor () {
    this._state = {}
    this._stateListener = function () {}

    this.dispatch(initialState)
  }

  Editor.prototype.dispatch = function (patch) {
    window.setTimeout(() => {
      this._state = Object.freeze(Object.assign({}, this._state, patch))
      this._stateListener(this._state)
    })
  }

  Editor.prototype.showAst = function (ast) {
    this.dispatch({ast: ast})
  }

  Editor.prototype.dispatchKeyEvent = function (e) {
    if (KeyMap.isPassthrough(e)) return false

    const action = KeyMap.getAction(e)
    if (typeof action === 'function') {
      action(this._state, patch => this.dispatch(patch))
    } else {
      console.log('unbound key:', e.string)
    }

    return true
  }

  Editor.prototype.setStateListener = function (listener) {
    this._stateListener = listener
  }

  Editor.prototype.getState = function () {
    return this._state
  }

  Editor.prototype.getKeyMap = function () {
    return KeyMap
  }

  return Editor
})
