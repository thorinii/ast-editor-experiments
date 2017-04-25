'use strict'

function Editor (el) {
  this._el = el

  this._state = {
    status: 'Idle',
    ast: {type: 'hole'},
    cursor: []
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
    e => { e.preventDefault(); return e },
    translateKeyEvent,
    e => this._processKeyboardEvent(e))

  const tryFn = (fn, error) => { try { return fn() } catch (e) { return error(e) } }

  let statusEl = e('div', {className: 'message'}, state.status)
  // let inJsEl = e('textarea', {className: 'code'})

  let astEl = e('div', {className: 'code-text', tabIndex: 0, onKeyPress: keyListener},
    tryFn(() => compile(Bootstrap.translate(state.ast))(state.ast), e => '' + e))
  let debugOutAstEl = e('div', {className: 'code-text'},
    ...tryFn(() => PP.printHtml(state.ast), e => ['' + e]))
  let debugOutJsEl = e('div', {className: 'code-text'},
    tryFn(() => Bootstrap.translate(state.ast), e => '' + e))

  let editorContainer = e('div', {},
    statusEl,
    e('div', {className: 'container container-2-columns'},
      e('div', {className: 'pane'}, astEl),
      e('div', {className: 'pane'}, debugOutAstEl)),
    debugOutJsEl)

  ReactDOM.render(editorContainer, el)

  // this._renderAst(state.ast)
}

Editor.prototype._renderAst = function (ast) {
  this._state.status = 'Parsing'

  try {
    let astJs = Bootstrap.translate(ast)

    this._debugOutAstEl.innerHTML = PP.printHtml(ast)
    this._debugOutJsEl.innerText = astJs

    try {
      let compiledAst = compile(astJs)
      let astRenderedItself = compiledAst(ast)
      this._astEl.innerHTML = astRenderedItself
      this._status('Idle')
    } catch (e) {
      this._status('AST Compile Error: ' + e)
    }
  } catch (e) {
    this._status('JS Compile Error: ' + e)
  }

  this._scheduleRender()
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
  } else {
    console.log(e)
  }

  this._scheduleRender()
}

function createElement (type, attributes = {}, contents = []) {
  let el = document.createElement(type)

  for (let key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      el.setAttribute(key, attributes[key])
    }
  }

  contents.forEach(c => {
    if (typeof c === 'string') {
      el.appendChild(document.createTextNode(c))
    } else if (c instanceof Element) {
      el.appendChild(c)
    } else {
      throw new TypeError('Cannot attach content that is not a String or Element: ' + c)
    }
  })

  return el
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
