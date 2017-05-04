define(['ast/ast-operators'], function (AstOps) {
  'use strict'

  const T_SET_AST = 'set-ast'
  const T_AST = 'ast'
  const T_CURSOR_MOTION = 'cursor-motion'

  const AST_APPLY_SELECTED = 'apply-selected'
  const AST_APPLY_WITH_SELECTED = 'apply-with-selected'

  const astReducer = (ast, action) => {
    switch (action.type) {
      case AST_APPLY_SELECTED:
        return Object.freeze({ type: 'apply', fn: ast, arg: {type: 'hole'} })

      case AST_APPLY_WITH_SELECTED:
        return Object.freeze({ type: 'apply', fn: {type: 'hole'}, arg: ast })

      default:
        throw new TypeError('Unknown AST action: ' + action.type)
    }
  }

  const reducer = (state, action) => {
    switch (action.type) {
      case T_SET_AST:
        return Object.freeze(Object.assign({}, state,
          { ast: action.ast }))

      case T_AST:
        return Object.freeze(Object.assign({}, state,
          { ast: astReducer(state.ast, action.action) }))

      case T_CURSOR_MOTION:
        return Object.freeze(Object.assign({}, state,
          { cursor: AstOps.relativeLeaf(state.ast, state.cursor, action.direction) }))

      default:
        throw new TypeError('Unknown action: ' + action.type)
    }
  }

  (state, dispatch) => dispatch({ast: {type: 'apply', fn: state.ast, arg: {type: 'hole'}}})

  return {
    /* Top-level actions */
    setAst: ast => {
      return { type: T_SET_AST, ast: ast }
    },

    ast: action => {
      return { type: T_AST, action: action }
    },

    cursorMotion: direction => {
      return { type: T_CURSOR_MOTION, direction: direction }
    },

    /* AST actions */
    applySelected: { type: AST_APPLY_SELECTED },
    applyWithSelected: { type: AST_APPLY_WITH_SELECTED },

    /* Reducer */
    reducer: reducer
  }
})
