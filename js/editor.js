define(['react', 'react-dom', 'editor-render', 'ast-operators'], function (React, ReactDOM, EditorRender, AstOps) {
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
    let editorContainer = React.createElement(EditorRender.editor, {state: state})
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
    switch (e.string) {
      case 'ctrl + r':
      case 'ctrl + shift + r':
      case 'f5':
      case 'ctrl + f5':
        return false

      case '<space>':
        this._state.ast = {
          type: 'apply',
          fn: this._state.ast,
          arg: {type: 'hole'}
        }
        break

      case '.':
        this._state.ast = {
          type: 'apply',
          fn: {type: 'hole'},
          arg: this._state.ast
        }
        break

      case 'l':
      case '<right>':
        this._state.cursor = relativeLeaf(this._state.ast, this._state.cursor, 1)
        break

      case 'h':
      case '<left>':
        this._state.cursor = relativeLeaf(this._state.ast, this._state.cursor, -1)
        break

      default:
        console.log(e)
        break
    }

    this._scheduleRender()

    return true
  }

  function relativeLeaf (ast, cursor, offset) {
    const prepend = (el, arrayOfArrays) =>
      (arrayOfArrays.length === 0) ? [[el]] : arrayOfArrays.map(a => [el].concat(a))
    const findCursors = ast => {
      switch (ast.type) {
        case 'hole': return []
        case 'literal': return []
        case 'variable': return []

        case 'binary':
          return ast.args
            .map((b, idx) => prepend(idx, findCursors(b)))
            .reduce((acc, a) => acc.concat(a), [])

        case 'let+':
          return ast.bindings
            .map((b, idx) => prepend(idx, prepend('value', findCursors(b[1]))))
            .reduce((acc, a) => acc.concat(a), [])
            .concat(prepend('value', findCursors(ast.result)))

        case 'lambda':
          return prepend('value', findCursors(ast.value))

        case 'apply':
          return prepend('fn', findCursors(ast.fn))
            .concat(prepend('arg', findCursors(ast.arg)))

        case 'pattern':
          return prepend('arg', findCursors(ast.arg))
            .concat(ast.cases
              .map((c, idx) => prepend(idx, prepend('value', findCursors(c[1]))))
              .reduce((acc, a) => acc.concat(a), []))

        default:
          console.warn('Unknown AST node', ast.type, ast)
          return ['?' + ast.type]
      }
    }

    const cursors = findCursors(AstOps.scrollLets(AstOps.sugarifyLet(ast)))
    const currentIndex = cursors.findIndex(c => JSON.stringify(c) === JSON.stringify(cursor))

    const nextIndex = Math.max(0, Math.min(cursors.length - 1, currentIndex + offset))
    return cursors[nextIndex]
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
