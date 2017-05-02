define(['ast-operators'], function (AstOps) {
  'use strict'

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

  return {
    isPassthrough: function (e) { return this.passthrough.indexOf(e.string) !== -1 },
    getAction: function (e) {
      if (typeof e === 'string') {
        const action = this.actions[e]
        return (typeof action === 'string') ? this.getAction(action) : action
      } else {
        return this.getAction(e.string)
      }
    },

    passthrough: [
      'ctrl + r', 'ctrl + shift + r',
      'f5', 'ctrl + f5'
    ],

    actions: {
      '<space>': state => state.ast = {type: 'apply', fn: state.ast, arg: {type: 'hole'}},
      '.': state => state.ast = {type: 'apply', fn: {type: 'hole'}, arg: state.ast},

      'l': state => state.cursor = relativeLeaf(state.ast, state.cursor, 1),
      '<right>': 'l',

      'h': state => state.cursor = relativeLeaf(state.ast, state.cursor, -1),
      '<left>': 'h'
    }
  }
})
