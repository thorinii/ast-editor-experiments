define(['react', 'react-dom', 'ui/editor-render'], function (React, ReactDOM, EditorRender) {
  'use strict'

  const translateKeyEvent = ev => {
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

  function EditorUI (editor, el) {
    this._editor = editor
    this._el = el

    this._editor.setListener(() => this._render())
    this._render()
  }

  EditorUI.prototype._render = function () {
    const el = this._el
    const state = this._editor.getState()
    const keyMap = this._editor.getKeyMap()

    ReactDOM.render(
      React.createElement(EditorRender.editor, {
        state: state,
        keyMap: keyMap
      }),
      el)

    const keyListener = ev => {
      try {
        const translatedEvent = translateKeyEvent(ev)
        const key = translatedEvent.string

        if (!this._editor.getKeyMap().isPassthrough(key)) {
          this._editor.dispatchKey(key)
          ev.preventDefault()
        }
      } catch (e) {
        console.error(e)
        ev.preventDefault()
      }
    }
    const bodyEl = document.querySelector('body')
    if (!bodyEl.classList.contains('key-listener')) {
      bodyEl.addEventListener('keypress', keyListener, false)
      bodyEl.classList.add('key-listener')
    }
  }

  return EditorUI
})
