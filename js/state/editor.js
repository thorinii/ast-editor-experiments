define(['state/state-container', 'state/transformers', 'state/keymap'], function (StateContainer, Transformers, KeyMap) {
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
    this._state = new StateContainer(initialState, Transformers.reducer)
  }

  Editor.prototype.showAst = function (ast) {
    this._state.dispatch(Transformers.setAst(ast))
  }

  Editor.prototype.dispatchKeyEvent = function (e) {
    if (KeyMap.isPassthrough(e)) return false

    const action = KeyMap.getAction(e)
    if (action !== undefined) {
      this._state.dispatch(action)
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
