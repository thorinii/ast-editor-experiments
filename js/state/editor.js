define(['state/state-container', 'state/keymap'], function (StateContainer, KeyMap) {
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
    this._state = new StateContainer(initialState)
  }

  Editor.prototype.dispatch = function (patch) {
    this._state.dispatch(state => Object.freeze(Object.assign({}, state, patch)))
  }

  Editor.prototype.showAst = function (ast) {
    this.dispatch({ast: ast})
  }

  Editor.prototype.dispatchKeyEvent = function (e) {
    if (KeyMap.isPassthrough(e)) return false

    const action = KeyMap.getAction(e)
    if (typeof action === 'function') {
      action(this.getState(), patch => this.dispatch(patch))
    } else {
      console.log('unbound key:', e.string)
    }

    return true
  }

  Editor.prototype.setStateListener = function (listener) {
    this._state.setListener(listener)
  }

  Editor.prototype.getState = function () {
    return this._state.get()
  }

  Editor.prototype.getKeyMap = function () {
    return KeyMap
  }

  return Editor
})
