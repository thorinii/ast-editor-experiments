'use strict'

var AstOps = require('ast-operators')

var PP = {
  print: function (ast) {
    let layout = this._layout(AstOps.scrollLets(AstOps.sugarifyLet(ast)))
    let rows = this._flatten(layout)
    return this._render(rows)
  },

  printHtml: function (ast) {
    let layout = this._layout(AstOps.scrollLets(AstOps.sugarifyLet(ast)))
    return this._renderHtml(layout)
  },

  _layout: function (ast) {
    switch (ast.type) {
      case 'hole': return [kw('???')]

      case 'literal': return [lit(ast.value)]
      case 'variable': return [id(ast.id)]

      case 'binary': {
        let items = ast.args.map(a => this._layout(a))
        if (ast.args.length > 8 || isMultiline(items)) {
          let row = []
          items.forEach(i => {
            if (row.length > 0) row.push(kw(ast.op), newline())
            row.push(i)
          })
          return row
        } else {
          let row = []
          items.forEach(i => {
            if (row.length > 0) row.push(kw(ast.op))
            row.push(i)
          })
          return row
        }
      }

      case 'let+': {
        if (ast.bindings.length === 1) {
          let binding = ast.bindings[0]
          let bindingL = this._layout(binding[1])
          let resultL = this._layout(ast.result)
          if (isMultiline(bindingL)) {
            return [kw('let'), newline(), indent(id(binding[0]), kw('='), bindingL), newline(), kw('in'), newline(), indent(resultL)]
          } else {
            if (isMultiline(resultL)) {
              return [kw('let'), id(binding[0]), kw('='), bindingL, kw('in'), newline(), indent(resultL)]
            } else {
              return [kw('let'), id(binding[0]), kw('='), bindingL, kw('in'), resultL]
            }
          }
        } else {
          let bindings = []
          ast.bindings.forEach(b => {
            bindings.push(indent([id(b[0]), kw('='), this._layout(b[1])]))
            bindings.push(newline())
          })
          return [kw('let'), newline(), ...bindings, kw('in'), newline(), indent(this._layout(ast.result))]
        }
      }

      case 'lambda': {
        let value = this._layout(ast.value)
        if (isMultiline(value)) {
          return [kw('λ'), id(ast.arg), kw('→'), newline(), indent(value)]
        } else {
          return [kw('λ'), id(ast.arg), kw('→'), ...value]
        }
      }

      case 'apply': {
        let fn = this._layout(ast.fn)
        let arg = this._layout(ast.arg)
        if (isMultiline(fn) || isMultiline(arg)) {
          return [fn, newline(), indent(arg)]
        } else {
          arg = parensIf(arg, ast.arg, 'apply', 'binary', 'lambda')
          return [fn, arg]
        }
      }

      case 'pattern': {
        let arg = this._layout(ast.arg)
        let cases = ast.cases.map(c => {
          let result = this._layout(c[1])
          if (isMultiline(result)) result = [newline(), indent(result)]
          result = [result, newline()]
          switch (c[0].type) {
            case 'any': return [id('_'), kw('→'), result]
            case 'literal': return [lit(c[0].value), kw('→'), result]
            default: return [kw('UNKNOWN_CASE'), kw('→'), result]
          }
        })
        if (isMultiline(arg)) {
          return [kw('case'), newline(), indent(arg), newline(), kw('of'), newline(), indent(cases)]
        } else {
          return [kw('case'), ...arg, kw('of'), newline(), indent(cases)]
        }
      }

      default:
        console.error('Unknown AST type:', ast.type, ast)
        return [kw('UNKNOWN')]
    }

    function newline () { return {type: 'newline'} }
    function indent (...layout) { return {type: 'indent', value: layout} }
    function kw (word) { return {type: 'keyword', value: word} }
    function id (identifier) { return {type: 'identifier', value: identifier} }
    function lit (value) { return {type: 'literal', value: value} }
    function isMultiline (layout) {
      if (Array.isArray(layout)) return !!layout.find(l => isMultiline(l))
      switch (layout.type) {
        case 'newline': return true
        case 'indent': return !!layout.value.find(l => isMultiline(l))
        default: return false
      }
    }
    function parensIf (layout, ast, ...types) {
      if (types.indexOf(ast.type) >= 0) return [{type: 'paren_left'}, layout, {type: 'paren_right'}]
      else return layout
    }
  },

  _flatten: function (layout) {
    let rows = []
    let row = []

    const process = l => {
      if (Array.isArray(l)) {
        l.forEach(l => process(l))
      } else if (l.type === 'newline') {
        if (row.length > 0) rows.push(row)
        row = []
      } else if (l.type === 'indent') {
        let subRows = this._flatten(l.value)

        if (row.length > 0) {
          row.push(...subRows[0])
          subRows = subRows.slice(1)
        }

        if (subRows.length > 0) {
          let last = subRows[subRows.length - 1]
          subRows = subRows.slice(0, subRows.length - 1)

          if (row.length > 0) {
            rows.push(row)
            row = []
          }

          rows = rows.concat(subRows.map(r => {
            let r2 = r.slice()
            r2.unshift({type: 'indent'})
            return r2
          }))

          let l2 = last.slice()
          l2.unshift({type: 'indent'})
          row = l2
        }
      } else {
        row.push(l)
      }
    }
    process(layout)

    if (row.length > 0) rows.push(row)
    return rows
  },

  _renderHtml: function (layout) {
    if (Array.isArray(layout)) return this._flattenArray(layout.map(l => this._renderHtml(l)))

    const React = require('react')
    const el = React.createElement

    switch (layout.type) {
      case 'newline': return el('div')
      case 'keyword': return el('span', {className: 'code-ast code-ast-keyword'}, layout.value)
      case 'identifier': return el('span', {className: 'code-ast code-ast-identifier'}, layout.value)
      case 'literal': return el('span', {className: 'code-ast code-ast-literal'}, JSON.stringify(layout.value))

      case 'paren_left': return el('span', {className: 'code-ast code-ast-brace code-ast-brace-left'}, '(')
      case 'paren_right': return el('span', {className: 'code-ast code-ast-brace code-ast-brace-right'}, ')')

      case 'indent': {
        let inner = this._renderHtml(layout.value)
        return el('div', {className: 'code-ast-indent'}, ...inner)
      }

      default:
        console.warn('Unknown layout type', layout.type, layout)
        return '<div>' + JSON.stringify(layout).split('<').join('&lt;') + '</div>'
    }
  },

  _flattenArray: function (array) {
    let tmp = []

    const go = a => {
      if (Array.isArray(a)) {
        a.forEach(el => go(el))
      } else {
        tmp.push(a)
      }
    }

    go(array)
    return tmp
  }
}

function compile (js) {
  return eval('(' + js + ')') // eslint-disable-line
}

function _$throw (e) {
  throw e
}
