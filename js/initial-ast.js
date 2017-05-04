'use strict'

const ifBlock = test => then => otherwise => {
  const isBlock = test => Array.isArray(test) ? !!test.find(el => isBlock(el)) : test.type === 'div'
  return isBlock(test) ? then : otherwise
}

const Array$dropFirst = array => array.slice(1)

const mapIdx = fn => array => array.mA.ap((i, idx) => fn(i)(idx))

const reactElement = type => props => content => {
  let tmp = []
  const go = a => {
    if (Array.isArray(a)) {
      a.forEach(el => go(el))
    } else {
      tmp.push(a)
    }
  }
  go(content)

  const React = require('react')
  return React.createElement(type, props, ...tmp)
}

const nodeClass = t => selected => {
  const cType = ' code-ast-' + t
  const cBrace = (t === 'brace-left' || t === 'brace-right') ? ' code-ast-brace' : ''
  const cHighlightable = (t === 'identifier' || t === 'keyword' || t === 'literal') ? ' highlightable' : ''
  const cSelected = selected ? ' selected' : ''
  return {className: 'code-ast-node' + cType + cBrace + cHighlightable + cSelected}
}

function Fn$bind1 (fn) {
  return function (_this) {
    return function (a) {
      return fn.call(_this, a)
    }
  }
}

function Fn$apply3 (fn) {
  return a => b => c => fn(a, b, c)
}

function Array$join (joiner) {
  return function (array) {
    return array.join(joiner)
  }
}

function Array$push (array) {
  return function (item) {
    return array.concat([item])
  }
}

function Array$intersperse (item) {
  return function (array) {
    let ret = []
    array.forEach((itm, idx) => {
      if (idx > 0) ret.push(item)
      ret.push(itm)
    })
    return ret
  }
}

function map (fn) {
  return function (array) {
    return array.map((i) => fn(i))
  }
}

function foldL (fn) {
  return function (zero) {
    return function (array) {
      return array.reduce((acc, i) => fn(acc)(i), zero)
    }
  }
}

function foldR (fn) {
  return function (zero) {
    return function (array) {
      return array.reduceRight((acc, i) => fn(acc)(i), zero)
    }
  }
}

function htmlEscape (html) {
  return html.split('<').join('&lt;')
}

function _$throw (e) {
  throw e
}

define(['ast/ast-builder'], function (A) {
  'use strict'

  const arrayOf = (...items) => items.reduce((acc, el) => A.ap('Array$push', acc, el), A.l([]))
  const ifEq = (test, check, then, otherwise) => if_(A.bin('===', test, check), then, otherwise)
  const if_ = (test, then, otherwise) => A.caseof(test, A.l(true), then, A.any(), otherwise)
  const debugSeq_ = (value) => A.lets('tmp', value, A.ap('debugSeq', 'tmp', 'tmp'))

  return A.lam('cursor', 'ast', A.lets(

    'debugSeq', A.lam('print', 'ret', A.lets(
      'ignored', A.ap('console.log', 'print'),
      'ret'
    )),

    'el', 'reactElement',

    'node', A.lam('type', 'selected', 'content',
      A.ap('el', A.ap('ifBlock', 'content', A.l('div'), A.l('span')), A.ap('nodeClass', 'type', 'selected'), 'content')),
    'nodeBlock', A.lam('type', 'selected', 'content',
      A.ap('el', A.l('div'), A.ap('nodeClass', 'type', 'selected'), 'content')),

    'newline', A.ap('el', A.l('div'), A.l({}), A.l(null)),

    'kw', A.lam('word', A.ap('node', A.l('keyword'), A.l(false), 'word')),
    'id', A.lam('word', 'selected', A.ap('node', A.l('identifier'), 'selected', 'word')),
    'lit', A.lam('word', 'selected', A.ap('node', A.l('literal'), 'selected', A.ap('htmlEscape', A.ap('JSON.stringify', 'word')))),

    'parenL', A.ap('node', A.l('brace-left'), A.l(false), A.l('(')),
    'parenR', A.ap('node', A.l('brace-right'), A.l(false), A.l(')')),

    'indent', A.lam('content', A.ap('ifBlock', 'content', A.ap('nodeBlock', A.l('indent'), A.l(false), 'content'), 'content')),

    'unwrapCursor', A.lam('unwrapper', 'cursor',
      if_(A.bin('||', A.bin('===', 'cursor', A.l(null)), A.bin('===', 'cursor.length', A.l(0))), A.l(null),
        ifEq('unwrapper', 'cursor[0]', A.ap('Array$dropFirst', 'cursor'), A.l(null))
      )
    ),

    'translate', A.lam('cursor', 'ast',
      A.lets(
        'selected', A.bin('&&', A.bin('!==', 'cursor', A.l(null)), A.bin('===', 'cursor.length', A.l(0))),

        A.caseof('ast.type',

          A.l('literal'), A.ap('lit', 'ast.value', 'selected'),
          A.l('variable'), A.ap('id', 'ast.id', 'selected'),

          A.l('binary'), A.lets(
            'all', A.ap('Array$intersperse', A.ap('kw', 'ast.op'), A.ap('mapIdx', A.lam('a', 'idx', A.ap('translate', A.ap('unwrapCursor', 'idx', 'cursor'), 'a')), 'ast.args')),
            A.ap('node', A.l('binary'), 'selected', 'all')
          ),

          A.l('let+'), A.lets(
            'value', A.ap('translate', A.ap('unwrapCursor', A.l('value'), 'cursor'), 'ast.result'),
            'joiner', ifEq('ast.bindings.length', A.l(1), A.l(''), A.ap('newline')),
            'bindings', A.ap('mapIdx', A.lam('b', 'idx',
              arrayOf(A.ap('id', 'b[0]', A.l(false)), A.ap('kw', A.l('=')), A.ap('indent', A.ap('translate', A.ap('unwrapCursor', A.l('value'), A.ap('unwrapCursor', 'idx', 'cursor')), 'b[1]')), 'joiner')
            ), 'ast.bindings'),
            A.ap('node', A.l('let'), 'selected', arrayOf(
              A.ap('kw', A.l('let')),
              A.ap('indent', 'bindings'),
              A.ap('kw', A.l('in')),
              A.ap('indent', 'value')
            ))
          ),

          A.l('lambda'), A.lets(
            'value', A.ap('translate', A.ap('unwrapCursor', A.l('value'), 'cursor'), 'ast.value'),
            A.ap('node', A.l('lambda'), 'selected', arrayOf(
              A.ap('kw', A.l('λ')),
              A.ap('id', 'ast.arg', A.l(false)),
              A.ap('kw', A.l('→')),
              A.ap('indent', 'value')
            ))
          ),

          A.l('apply'), A.lets(
            'fn', A.ap('translate', A.ap('unwrapCursor', A.l('fn'), 'cursor'), 'ast.fn'),
            'arg', A.ap('translate', A.ap('unwrapCursor', A.l('arg'), 'cursor'), 'ast.arg'),
            A.ap('node', A.l('apply'), 'selected', arrayOf(
              'fn', 'parenL', 'arg', 'parenR'
            ))
          ),

          A.l('pattern'), A.lets(
            'arg', A.ap('translate', A.ap('unwrapCursor', A.l('arg'), 'cursor'), 'ast.arg'),
            'cases', A.ap('mapIdx', A.lam('b', 'idx', A.lets(
              'pattern', A.caseof('b[0].type',
                A.l('literal'), A.ap('lit', 'b[0].value', A.l(false)),
                A.l('any'), A.ap('id', A.l('_'), A.l(false)),
                A.any(), A.ap('debugSeq', 'b[0]', A.ap('id', 'b[0]', A.l(false)))
              ),
              arrayOf('pattern', A.ap('kw', A.l('→')), A.ap('indent', A.ap('translate', A.ap('unwrapCursor', A.l('value'), A.ap('unwrapCursor', 'idx', 'cursor')), 'b[1]')), 'newline'))
            ), 'ast.cases'),
            A.ap('node', A.l('apply'), 'selected', arrayOf(
              A.ap('kw', A.l('case')),
              'arg',
              A.ap('kw', A.l('of')),
              A.ap('indent', 'cases')
            ))
          ),

          A.any(), A.ap('debugSeq', 'ast', A.ap('node', A.l('unknown'), 'selected', A.l('UNKNOWN')))
        )
      )
    ),

    A.ap('translate', 'cursor', A.ap('scrollLets', A.ap('sugarifyLet', 'ast')))
  ))
})
