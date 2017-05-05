define(['state/state-container', 'state/transformers', 'state/keymap', 'state/default-keymap-config'], function (StateContainer, Transformers, KeyMap, DefaultKeyMapConfig) {
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
    this._keyMap = new KeyMap()

    this._keyMap.addBindings(DefaultKeyMapConfig.bindings)
  }

  Editor.prototype.showAst = function (ast) {
    this._state.dispatch(Transformers.setAst(ast))
  }

  Editor.prototype.dispatchKeyEvent = function (e) {
    if (this._keyMap.isPassthrough(e)) return false

    const action = this._keyMap.getAction(e.string)
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

  Editor.prototype.getState = function () { return this._state.get() }
  Editor.prototype.getKeyMap = function () { return this._keyMap }

  return Editor
})
