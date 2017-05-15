import A from './ast-builder'

function rewriteAstTopFirst (fn) {
  return function (ast) {
    let _thisFn = rewriteAstTopFirst(fn)
    ast = fn(ast)

    switch (ast.type) {
      case 'hole':
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
        throw new TypeError('Unknown AST node: ' + ast.type)
    }
  }
}

module.exports = {
  sugarifyLet: rewriteAstTopFirst(function (ast) {
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
  }),

  unsugarifyLet: rewriteAstTopFirst(function (ast) {
    if (ast.type === 'let') {
      return A.ap(A.lam(ast.binding, ast.result), ast.value)
    } else {
      return ast
    }
  }),

  scrollLets: rewriteAstTopFirst(ast => {
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
  }),

  wrapApplyFn: ast => Object.freeze({ type: 'apply', fn: ast, arg: {type: 'hole'} }),
  wrapApplyTo: ast => Object.freeze({ type: 'apply', fn: {type: 'hole'}, arg: ast })
}
