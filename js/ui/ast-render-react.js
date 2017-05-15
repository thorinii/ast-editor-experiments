import AstOps from '../ast/ast-operators'
import React from 'react'

const ifBlock = (test, then, otherwise) => {
  const isBlock = test => Array.isArray(test) ? !!test.find(el => isBlock(el)) : test.type === 'div'
  return isBlock(test) ? then : otherwise
}

const Array$dropFirst = array => array.slice(1)

const mapIdx = (fn, array) => array.map((i, idx) => fn(i, idx))

const nodeClass = (t, selected) => {
  const cType = ' code-ast-' + t
  const cBrace = (t === 'brace-left' || t === 'brace-right') ? ' code-ast-brace' : ''
  const cHighlightable = (t === 'identifier' || t === 'keyword' || t === 'literal') ? ' highlightable' : ''
  const cSelected = selected ? ' selected' : ''
  return {className: 'code-ast-node' + cType + cBrace + cHighlightable + cSelected}
}

function Array$intersperse (item, array) {
  let ret = []
  array.forEach((itm, idx) => {
    if (idx > 0) ret.push(item)
    ret.push(itm)
  })
  return ret
}

function htmlEscape (html) {
  return html.split('<').join('&lt;')
}

const el = (type, props, content) => {
  let tmp = []
  const go = a => {
    if (Array.isArray(a)) {
      a.forEach(el => go(el))
    } else {
      tmp.push(a)
    }
  }
  go(content)

  return React.createElement(type, props, ...tmp)
}

const node = (type, selected, content) =>
  el(
    ifBlock(content, 'div', 'span'),
    nodeClass(type, selected),
    content)

const nodeBlock = (type, selected, content) =>
  el('div', nodeClass(type, selected), content)

const newline = el('div', {}, null)

const kw = (word, selected = false) => node('keyword', selected, word)
const id = (word, selected) => node('identifier', selected, word)
const lit = (word, selected) => node('literal', selected, htmlEscape(JSON.stringify(word)))

const parenL = node('brace-left', false, '(')
const parenR = node('brace-right', false, ')')

const indent = content => ifBlock(content, nodeBlock('indent', false, content), content)

const unwrapCursor = (unwrapper, cursor) => {
  if (cursor === null || cursor.length === 0) {
    return null
  } else {
    return unwrapper === cursor[0] ? Array$dropFirst(cursor) : null
  }
}

const translate = (cursor, ast) => {
  const selected = cursor !== null && cursor.length === 0

  switch (ast.type) {
    case 'hole': return kw('???', selected)
    case 'literal': return lit(ast.value, selected)
    case 'variable': return id(ast.id, selected)

    case 'binary': {
      const all = Array$intersperse(
        kw(ast.op),
        mapIdx((a, idx) => translate(unwrapCursor(idx, cursor), a), ast.args))
      return node('binary', selected, all)
    }

    case 'let+': {
      const value = translate(unwrapCursor('value', cursor), ast.result)
      const joiner = ast.bindings.length > 1 ? newline : ''
      const bindings = mapIdx((b, idx) => [
        id(b[0], false),
        kw('='),
        indent(translate(unwrapCursor('value', unwrapCursor(idx, cursor)), b[1])),
        joiner], ast.bindings)
      return node('let', selected, [
        kw('let'),
        indent(bindings),
        kw('in'),
        indent(value)
      ])
    }

    case 'lambda': {
      const value = translate(unwrapCursor('value', cursor), ast.value)
      return node('lambda', selected, [
        kw('λ'),
        id(ast.arg, false),
        kw('→'),
        indent(value)
      ])
    }

    case 'apply': {
      const fn = translate(unwrapCursor('fn', cursor), ast.fn)
      const arg = translate(unwrapCursor('arg', cursor), ast.arg)
      const fnNeedsParens = ['binary', 'lambda', 'apply', 'let+'].indexOf(ast.fn.type) !== -1
      const argNeedsParens = ['binary', 'lambda', 'apply', 'let+'].indexOf(ast.arg.type) !== -1
      const wrappedFn = fnNeedsParens ? [parenL, fn, parenR] : [fn]
      const wrappedArg = argNeedsParens ? [parenL, arg, parenR] : [arg]
      return node('apply', selected,
        ifBlock(arg,
          [...wrappedFn, indent(arg)],
          [...wrappedFn, ...wrappedArg]))
    }

    case 'pattern': {
      const arg = translate(unwrapCursor('arg', cursor), ast.arg)
      const cases = mapIdx((c, idx) => {
        let pattern
        switch (c[0].type) {
          case 'literal':
            pattern = lit(c[0].value, false)
            break
          case 'any':
            pattern = id('_', false)
            break
          default:
            pattern = id('???', false)
            break
        }

        return [
          pattern,
          kw('→'),
          indent(translate(unwrapCursor('value', unwrapCursor(idx, cursor)), c[1])),
          newline
        ]
      }, ast.cases)

      return node('apply', selected, [
        kw('case'),
        indent(arg),
        kw('of'),
        indent(cases)
      ])
    }

    default: {
      console.warn('Unknown AST node', ast.type, ast)
      return kw('UNKNOWN')
    }
  }
}

module.exports = {
  render: (cursor, ast) => translate(cursor, AstOps.scrollLets(AstOps.sugarifyLet(ast)))
}
