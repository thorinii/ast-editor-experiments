import React from 'react'
import ReactDOM from 'react-dom'
import EditorRender from './editor-render'
import KeyMap from '../Editor/KeyMap'

const uppercaseSymbols = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '<', '>', '?', ':', '"', '{', '}', '|']

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

  let string = modifiers.join(' + ') + (modifiers.length ? ' + ' : '') + key
  if (uppercaseSymbols.indexOf(key) >= 0) {
    string = string.replace('shift + ', '')
  }

  return {
    key: key,
    modifiers: modifiers,
    string: string
  }
}

function EditorUI (editor, el) {
  this._editor = editor
  this._el = el

  this._editor.setListener(state => this._render(state))

  this._captureKeys = true
  this._keyListener = ev => {
    try {
      const translatedEvent = translateKeyEvent(ev)
      const key = translatedEvent.string

      if (!KeyMap.isPassthrough(key)) {
        this._editor.dispatchKey(key)
        if (this._captureKeys) ev.preventDefault()
      }
    } catch (e) {
      console.error(e)
      if (this._captureKeys) ev.preventDefault()
    }
  }
}

EditorUI.prototype._render = function (state) {
  const el = this._el
  const keyMap = state.keyMap
  this._captureKeys = !state.autocomplete.value0

  ReactDOM.render(
    React.createElement(EditorRender.editor, {
      state: state,
      keyMap: keyMap,
      editor: this._editor
    }),
    el)

  const bodyEl = document.querySelector('body')
  if (!bodyEl.classList.contains('key-listener')) {
    bodyEl.addEventListener('keypress', this._keyListener, false)
    bodyEl.classList.add('key-listener')
  }
}

module.exports = EditorUI
