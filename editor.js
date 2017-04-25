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
  const e = React.createElement

  const keyListener = pipe(
    e => { e.preventDefault(); e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); return e },
    translateKeyEvent,
    e => this._processKeyboardEvent(e))

  const tryFn = (fn, error) => { try { return fn() } catch (e) { return error(e) } }

  let statusEl = e('div', {className: 'message'}, state.status)
  // let inJsEl = e('textarea', {className: 'code'})

  let astEl = e('div', {className: 'code-text', tabIndex: 0, onKeyPress: keyListener},
    tryFn(() => compile(Bootstrap.translate(state.ast))(state.cursor)(state.ast), e => '' + e))
  let debugOutAstEl = e('div', {className: 'code-text'},
    ...tryFn(() => PP.printHtml(state.ast), e => ['' + e]))
  let debugOutJsEl = e('div', {className: 'code-text'},
    tryFn(() => Bootstrap.translate(state.ast), e => '' + e))
  let debugOutAstJsonEl = e('div', {className: 'code-text'},
    tryFn(() => false ? JSON.stringify(state.ast, null, '  ') : '', e => '' + e))

  let editorContainer = e('div', {},
    statusEl,
    e('div', {className: 'container container-2-columns'},
      e('div', {className: 'pane'}, astEl),
      e('div', {className: 'pane'}, debugOutAstEl)),
    debugOutJsEl,
    debugOutAstJsonEl)

  ReactDOM.render(editorContainer, el)
}

Editor.prototype._processKeyboardEvent = function (e) {
  if (e.key === '<space>' && e.modifiers.length === 0) {
    this._state.ast = {
      type: 'apply',
      fn: this._state.ast,
      arg: {type: 'hole'}
    }
  } else if (e.key === '.' && e.modifiers.length === 0) {
    this._state.ast = {
      type: 'apply',
      fn: {type: 'hole'},
      arg: this._state.ast
    }
  } else if (e.key === 'l' && e.modifiers.length === 0) {
    this._state.cursor = relativeLeaf(this._state.ast, this._state.cursor, 1)
  } else if (e.key === 'h' && e.modifiers.length === 0) {
    this._state.cursor = relativeLeaf(this._state.ast, this._state.cursor, -1)
  } else {
    console.log(e)
  }

  this._scheduleRender()
}

function relativeLeaf (ast, cursor, offset) {
  const prepend = (el, arrayOfArrays) =>
    (arrayOfArrays.length === 0) ? [[el]] : arrayOfArrays.map(a => [el].concat(a))
  const findCursors = ast => {
    switch (ast.type) {
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
        return ast.cases
          .map((c, idx) => prepend(idx, prepend('value', findCursors(c[1]))))
          .reduce((acc, a) => acc.concat(a), [])
          .concat(prepend('arg', findCursors(ast.arg)))

      default:
        console.warn('Unknown AST node', ast.type, ast)
        return ['?' + ast.type]
    }
  }

  const cursors = findCursors(scrollLets(sugarifyLet(ast)))
  const currentIndex = cursors.findIndex(c => JSON.stringify(c) === JSON.stringify(cursor))

  const nextIndex = Math.max(0, Math.min(cursors.length-1, currentIndex + offset))
  console.log('now', currentIndex, 'next:', nextIndex, 'result:', JSON.stringify(cursors[nextIndex]))
  return cursors[nextIndex]
}

function pipe (...fns) {
  return function (arg) {
    return fns.reduce((acc, fn) => fn(acc), arg)
  }
}

function translateKeyEvent (ev) {
  const keyCodeToKey = code => {
    switch (code) {
      case KeyboardEvent.DOM_VK_DELETE: return '<delete>'
      case KeyboardEvent.DOM_VK_ESCAPE: return '<escape>'
      case KeyboardEvent.DOM_VK_RETURN: return '<enter>'
      case KeyboardEvent.DOM_VK_TAB: return '<tab>'
      case KeyboardEvent.DOM_VK_UP: return '<up>'
      case KeyboardEvent.DOM_VK_DOWN: return '<down>'
      case KeyboardEvent.DOM_VK_LEFT: return '<left>'
      case KeyboardEvent.DOM_VK_RIGHT: return '<right>'
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

  return {
    key: key,
    modifiers: modifiers
  }
}
