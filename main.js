'use strict'

function initialiseEditor (editorEl) {
  let inJsEl = editorEl.querySelector('.editor-in-js')
  let outLiveEl = editorEl.querySelector('.editor-out-live')
  let outPrettyEl = editorEl.querySelector('.editor-out-pretty')
  let statusEl = editorEl.querySelector('.editor-status')

  statusEl.innerText = 'Initialising'

  const parseAndCompile = js => {
    statusEl.innerText = 'Parsing'
    try {
      let ast = compile(js)
      outLiveEl.innerHTML = PP.printHtml(ast)
      outPrettyEl.innerText = PP.print(ast)
      statusEl.innerText = 'Idle'
    } catch (e) {
      statusEl.innerText = 'Error: ' + e
    }
  }

  inJsEl.addEventListener('input', () => {
    parseAndCompile(inJsEl.value)
  })

  parseAndCompile(inJsEl.value)
}

function runTests (test) {
  var test1 =
    ap(
      lam('x', bin('*', 'x', l(8))),
      bin('+', l(4), l(5)))

  var test2 =
    lam('ast', lets(

      'translate', lam('ast',
        caseof('ast.type',
          l('literal'), ap('JSON.stringify', 'ast.value'),
          l('variable'), v('ast.id'),

          l('binary'), ap(ap('Array$join', bin('+', l(' '), 'ast.op', l(' '))), ap('ast.args.map', lam('a', ap('translateP', 'a')))),

          l('lambda'), bin('+', l('function('), 'ast.arg', l('){return '), ap('translate', 'ast.value'), l('}')),

          l('apply'), bin('+', ap('translateP', 'ast.fn'), l('('), ap('translate', 'ast.arg'), l(')')),

          l('let'), bin('+', l('(function(){var '), 'ast.binding', l(' = '), ap('translate', 'ast.value'), l('; return '), ap('translate', 'ast.result'), l('})()')),

          l('let+'), bin('+',
            l('(function(){'),
            ap('foldR',
              lam('acc', 'b',
                bin('+', l('var '), 'b[0]', l(' = '), ap('translate', 'b[1]'), l(';'), 'acc')),
              bin('+', l('return '), ap('translate', 'ast.result')),
              'ast.bindings'),
            l('})()')),

          l('pattern'), lets(
            'casesBlock',
              ap('foldR',
                lam('tmp', 'c', lets(
                  'condition', caseof('c[0].type',
                    l('any'), l('true'),
                    l('literal'), bin('+', l('_$m === '), ap('JSON.stringify', 'c[0].value')),
                    any(), l('UNKNOWN')),
                  caseof('condition',
                    l('true'), ap('translateP', 'c[1]'),
                    any(), bin('+', 'condition', l(' ? '), ap('translateP', 'c[1]'), l(' : '), 'tmp')))),
                l('_$throw(new Error("Unmatched case: " + JSON.stringify(_$m)))'),
                'ast.cases'),
            bin('+', l('(function(_$m){return '), 'casesBlock', l('})('), ap('translate', 'ast.arg'), l(')')))
        )),

      'translateP', lam('ast',
        caseof('ast.type',
          l('lambda'), bin('+', l('('), ap('translate', 'ast'), l(')')),
          l('binary'), bin('+', l('('), ap('translate', 'ast'), l(')')),
          any(), ap('translate', 'ast')
        )),

      ap('translate', ap('scrollLets', ap('sugarifyLet', 'ast')))))

  // TODO: accumulate nested Apply, Lets, Lambda args

  {
    console.log('TEST 1: simple lambdas and application')
    console.log(PP.print(test1))
    console.log(Bootstrap.translate(test1))
    let compiled = compile(Bootstrap.translate(test1))
    console.log(compiled)
    console.log('->  ' + (compiled === 72 ? 'SUCCESS' : 'FAILED'))
  }

  {
    console.log('TEST 2: a JS translator')
    console.log(PP.print(test2))
    console.log(Bootstrap.translate(test2))
    let testTranslateJs = Bootstrap.translate(test2)
    let testTranslate = compile(testTranslateJs)

    console.log('Can compile Test 1?')
    let resultTest1 = testTranslate(test1)
    let expectedTest1 = Bootstrap.translate(test1)
    console.log('->  ' + (resultTest1 === expectedTest1 ? 'SUCCESS' : 'FAILED'))

    console.log('Can compile itself?')
    let resultTest2 = testTranslate(test2)
    let expectedTest2 = testTranslateJs
    console.log('->  ' + (resultTest2 === expectedTest2 ? 'SUCCESS' : 'FAILED'))
  }

  {
    console.log('TEST 3: a JS translator translated five times')
    let deTranslata = Bootstrap.translate.bind(Bootstrap)
    let initialJs = deTranslata(test2)
    for (let i = 0; i < 5; i++) {
      let result = deTranslata(test2)
      deTranslata = compile(result)
    }
    let finalJs = deTranslata(test2)
    console.log('->  ' + (finalJs === initialJs ? 'SUCCESS' : 'FAILED'))
  }
}

var Bootstrap = {
  translate: function (ast) {
    ast = scrollLets(sugarifyLet(ast))
    switch (ast.type) {
      case 'literal': return JSON.stringify(ast.value)
      case 'variable': return ast.id
      case 'binary': return ast.args.map(a => this.translateP(a)).join(' ' + ast.op + ' ')
      case 'lambda': return 'function(' + ast.arg + '){return ' + this.translate(ast.value) + '}'
      case 'apply':
        return this.translateP(ast.fn) + '(' + this.translate(ast.arg) + ')'

      case 'let':
        return '(function(){var ' + ast.binding + ' = ' + this.translate(ast.value) + ';return ' + this.translate(ast.result) + '})()'

      case 'let+':
        return '(function(){' +
          ast.bindings.reduceRight((acc, b) => {
            return 'var ' + b[0] + ' = ' + this.translate(b[1]) + ';' + acc
          }, 'return ' + this.translate(ast.result)) +
          '})()'

      case 'pattern':
        let casesBlock = ast.cases.reduceRight((tmp, c) => {
          let condition
          switch (c[0].type) {
            case 'any': condition = 'true'; break
            case 'literal': condition = '_$m === ' + JSON.stringify(c[0].value); break
            default: condition = 'UNKNOWN'; break
          }
          if (condition === 'true') return this.translateP(c[1])
          else return condition + ' ? ' + this.translateP(c[1]) + ' : ' + tmp
        }, '_$throw(new Error("Unmatched case: " + JSON.stringify(_$m)))')
        return '(function(_$m){return ' + casesBlock + '})(' + this.translate(ast.arg) + ')'

      default:
        console.warn('UNKNOWN AST node', ast.type, ast)
        return 'UNKNOWN'
    }
  },

  translateP: function (ast) {
    switch (ast.type) {
      case 'lambda':
      case 'binary':
        return '(' + this.translate(ast) + ')'
      default:
        return this.translate(ast)
    }
  }
}

function rewriteAstTopFirst (fn) {
  return function (ast) {
    let _thisFn = rewriteAstTopFirst(fn)
    ast = fn(ast)

    switch (ast.type) {
      case 'literal':
      case 'variable':
        return ast

      case 'binary':
        return {
          type: 'binary',
          op: ast.op,
          args: ast.args.map(_thisFn)
        }

      case 'lambda':
        return {
          type: 'lambda',
          arg: ast.arg,
          value: _thisFn(ast.value)
        }

      case 'apply':
        return {
          type: 'apply',
          fn: _thisFn(ast.fn),
          arg: _thisFn(ast.arg)
        }

      case 'let':
        return {
          type: 'let',
          binding: ast.binding,
          value: _thisFn(ast.value),
          result: _thisFn(ast.result)
        }

      case 'let+':
        return {
          type: 'let+',
          bindings: ast.bindings.map(b => [
            b[0],
            _thisFn(b[1])
          ]),
          result: _thisFn(ast.result)
        }

      case 'pattern':
        return {
          type: 'pattern',
          arg: _thisFn(ast.arg),
          cases: ast.cases.map(c => [
            c[0],
            _thisFn(c[1])
          ])
        }

      default:
        console.warn('UNKNOWN AST node', ast.type, ast)
        return l('UNKNOWN')
    }
  }
}

var sugarifyLet = rewriteAstTopFirst(function (ast) {
  if (ast.type === 'apply' && ast.fn.type === 'lambda') {
    return {
      type: 'let',
      binding: ast.fn.arg,
      value: ast.arg,
      result: ast.fn.value
    }
  } else {
    return ast
  }
})

var unsugarifyLet = rewriteAstTopFirst(function (ast) {
  if (ast.type === 'let') {
    return ap(lam(ast.binding, ast.result), ast.value)
  } else {
    return ast
  }
})
unsugarifyLet

var scrollLets = rewriteAstTopFirst(ast => {
  if (ast.type === 'let') {
    let tmp = ast
    let bindings = []
    do {
      bindings.push([tmp.binding, tmp.value])
      tmp = tmp.result
    } while (tmp.type === 'let')
    return {
      type: 'let+',
      bindings: bindings,
      result: tmp
    }
  } else {
    return ast
  }
})

var PP = {
  print: function (ast) {
    let layout = this._layout(scrollLets(sugarifyLet(ast)))
    let rows = this._flatten(layout)
    return this._render(rows)
  },

  printHtml: function (ast) {
    let layout = this._layout(scrollLets(sugarifyLet(ast)))
    return this._renderHtml(layout)
  },

  _layout: function (ast) {
    switch (ast.type) {
      case 'literal': return [lit(ast.value)]
      case 'variable': return [id(ast.id)]

      case 'binary': {
        let items = ast.args.map(a => this._layout(a))
        if (ast.args.length > 5 || isMultiline(items)) {
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
          if (isMultiline(bindingL)) {
            return [kw('let'), newline(), indent(id(binding[0]), kw('='), bindingL), newline(), kw('in'), newline(), indent(this._layout(ast.result))]
          } else {
            return [kw('let'), id(binding[0]), kw('='), bindingL, kw('in'), indent(this._layout(ast.result))]
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
            case 'any': return [kw('_'), kw('→'), result]
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

  _render: function (rows) {
    const renderItem = item => {
      switch (item.type) {
        case 'keyword':
          return item.value + ' '
        case 'identifier':
          return item.value + ' '
        case 'literal':
          return JSON.stringify(item.value) + ' '
        case 'paren_left':
          return '( '
        case 'paren_right':
          return ') '
        case 'indent':
          return '  '
        default:
          console.warn('UNKNOWN layout type:', item.type, item)
          return '???'
      }
    }
    const renderRow = row => {
      return row.map(i => renderItem(i)).join('')
    }

    return rows.reduce((acc, row) => {
      if (acc.length > 0) acc += '\n'
      return acc + renderRow(row)
    }, '')
  },

  _renderHtml: function (layout) {
    if (Array.isArray(layout)) return layout.map(l => this._renderHtml(l)).join('')
    switch (layout.type) {
      case 'newline': return '<div></div>'
      case 'keyword': return '<span class="code-ast code-ast-keyword">' + layout.value + '</span>'
      case 'identifier': return '<span class="code-ast code-ast-identifier">' + layout.value + '</span>'
      case 'literal': return '<span class="code-ast code-ast-literal">' + JSON.stringify(layout.value) + '</span>'

      case 'paren_left': return '<span class="code-ast code-ast-brace code-ast-brace-left">(</span>'
      case 'paren_right': return '<span class="code-ast code-ast-brace code-ast-brace-right">)</span>'

      case 'indent': {
        let inner = this._renderHtml(layout.value)
        return '<div class="code-ast-indent">' + inner + '</div>'
      }

      default:
        console.warn('Unknown layout type', layout.type, layout)
        return '<div>' + JSON.stringify(layout).split('<').join('&lt;') + '</div>'
    }
  }
}

function compile (js) {
  return eval('(' + js + ')') // eslint-disable-line
}

function ap (fn, ...args) {
  return args.reduce((acc, a) => {
    return {
      type: 'apply',
      fn: acc,
      arg: typeof a === 'string' ? v(a) : a
    }
  }, typeof fn === 'string' ? v(fn) : fn)
}

function lam (...stuff) {
  let args = stuff.slice(0, stuff.length - 1)
  let value = stuff[stuff.length - 1]
  return args.reduceRight((acc, a) => {
    return {
      type: 'lambda',
      arg: a,
      value: acc
    }
  }, typeof value === 'string' ? v(value) : value)
}

function bin (op, ...args) {
  return {type: 'binary', op: op, args: args.map(a => typeof a === 'string' ? v(a) : a)}
}

function v (id) {
  return {type: 'variable', id: id}
}

function l (value) {
  return {type: 'literal', value: value}
}

function lets (...stuff) {
  var bindingPairs = stuff.slice(0, stuff.length - 1)
  var inE = stuff[stuff.length - 1]

  var bindings = []
  for (let i = 0; i < bindingPairs.length - 1; i += 2) {
    bindings.push([bindingPairs[i], bindingPairs[i + 1]])
  }

  return bindings.reduceRight(function (e, bp) {
    var name = bp[0]
    var value = bp[1]
    return ap(lam(name, e), value)
  }, inE)
}

function caseof (arg, ...caseValuePairs) {
  var caseValues = []
  for (let i = 0; i < caseValuePairs.length - 1; i += 2) {
    caseValues.push([caseValuePairs[i], caseValuePairs[i + 1]])
  }

  return {
    type: 'pattern',
    arg: typeof arg === 'string' ? v(arg) : arg,
    cases: caseValues
  }
}

function any () {
  return {type: 'any'}
}

function _$throw (e) {
  throw e
}

function Fn$bind1 (fn) {
  return function (_this) {
    return function (a) {
      return fn.call(_this, a)
    }
  }
}

function Array$join (joiner) {
  return function (array) {
    return array.join(joiner)
  }
}

function foldR (fn) {
  return function (zero) {
    return function (array) {
      return array.reduceRight((acc, i) => fn(acc)(i), zero)
    }
  }
}

window.addEventListener('load', () => {
  runTests()
  initialiseEditor(document.querySelector('.editor'))
})

foldR; Array$join; Fn$bind1; _$throw
