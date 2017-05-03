define(['react', 'react-dom', 'editor-render', 'keymap'], function (React, ReactDOM, EditorRender, KeyMap) {
  'use strict'

  function Editor (el) {
    this._el = el

    this._state = {
      status: 'Idle',
      ast: {type: 'hole'},
      cursor: ['value', 'value', 0, 'value', 'value', 'value', 0, 'value', 'fn']
    }

    this._render(el, this._state)
  }

  Editor.prototype.showAst = function (ast) {
    this._state.ast = ast
    this._scheduleRender()
  }

  Editor.prototype._scheduleRender = function () {
    window.setTimeout(() => this._render(this._el, this._state))
  }

  Editor.prototype._render = function (el, state) {
    let editorContainer = React.createElement(EditorRender.editor, {
      state: state,
      keyMap: KeyMap
    })
    ReactDOM.render(editorContainer, el)

    const keyListener = e => {
      try {
        const key = translateKeyEvent(e)
        const prevent = this._processKeyboardEvent(key)
        if (prevent) e.preventDefault()
      } catch (e) {
        console.error(e)
        e.preventDefault()
      }
    }
    if (!el.classList.contains('key-listener')) {
      el.addEventListener('keypress', keyListener, false)
      el.classList.add('key-listener')
    }
  }

  Editor.prototype._processKeyboardEvent = function (e) {
    if (KeyMap.isPassthrough(e)) return false

    const action = KeyMap.getAction(e)
    if (typeof action === 'function') {
      action(this._state)
      this._scheduleRender()
    } else {
      console.log('unbound key:', e.string)
    }

    return true
  }

  function translateKeyEvent (ev) {
    const KE = window.KeyboardEvent
    const keyCodeToKey = code => {
      switch (code) {
        case KE.DOM_VK_DELETE: return '<delete>'
        case KE.DOM_VK_ESCAPE: return '<escape>'
        case KE.DOM_VK_RETURN: return '<enter>'
        case KE.DOM_VK_TAB: return '<tab>'
        case KE.DOM_VK_UP: return '<up>'
        case KE.DOM_VK_DOWN: return '<down>'
        case KE.DOM_VK_LEFT: return '<left>'
        case KE.DOM_VK_RIGHT: return '<right>'
        default: return null
      }
    }
    const charToKey = char => {
      switch (char) {
        case 'backspace': return '<backspace>'
        case ' ': return '<space>'
        default: return char
      }
    }

    const key = keyCodeToKey(ev.keyCode) || charToKey(ev.key.toLowerCase())

    const modifiers = []
    if (ev.ctrlKey) modifiers.push('ctrl')
    if (ev.shiftKey) modifiers.push('shift')
    if (ev.altKey) modifiers.push('alt')

    const string = modifiers.join(' + ') + (modifiers.length ? ' + ' : '') + key

    return {
      key: key,
      modifiers: modifiers,
      string: string
    }
  }

  function compile (js) {
    return eval('(' + js + ')') // eslint-disable-line
  }

  return Editor
})
