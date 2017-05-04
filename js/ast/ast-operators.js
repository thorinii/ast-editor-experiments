define(['ast/ast-builder'], function (A) {
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
          console.warn('UNKNOWN AST node', ast.type, ast)
          return A.l('UNKNOWN')
      }
    }
  }

  return {
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

    relativeLeaf: function (ast, cursor, offset) {
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

      const cursors = findCursors(this.scrollLets(this.sugarifyLet(ast)))
      const currentIndex = cursors.findIndex(c => JSON.stringify(c) === JSON.stringify(cursor))

      const nextIndex = Math.max(0, Math.min(cursors.length - 1, currentIndex + offset))
      return cursors[nextIndex]
    }
  }
})
