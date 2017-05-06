define(['ast/ast-operators', 'core/cursor', 'core/job-queue'], function (AstOps, Cursor, JobQueue) {
  'use strict'

  const T_IMPORT_AST = 'import-ast'
  const T_AST = 'ast'
  const T_CURSOR_MOTION = 'cursor-motion'
  const T_ENQUEUE_JOB = 'enqueue-job'
  const T_UPDATE_JOB_QUEUE = 'update-job-queue'

  const AST_APPLY_SELECTED = 'apply-selected'
  const AST_APPLY_WITH_SELECTED = 'apply-with-selected'

  const update = (original, patch) =>
    Object.freeze(Object.assign({}, original, patch))
  const updateKey = (original, key, value) => {
    const patch = {}
    patch[key] = value
    return update(original, patch)
  }

  const astReducer = (ast, action) => {
    switch (action.type) {
      case AST_APPLY_SELECTED:
        return AstOps.wrapApplyFn(ast)

      case AST_APPLY_WITH_SELECTED:
        return AstOps.wrapApplyTo(ast)

      default:
        throw new TypeError('Unknown AST action: ' + action.type)
    }
  }

  const reducer = (state, action) => {
    switch (action.type) {
      case T_IMPORT_AST:
        return updateKey(state, 'code',
          updateKey(state.code, action.name, action.ast))

      case T_AST:
        return updateKey(state, 'code',
          updateKey(state.code, action.name,
            astReducer(state.code[action.name], action.action)))

      case T_CURSOR_MOTION:
        return updateKey(state, 'cursor',
          updateKey(state.cursor, 'path',
            Cursor.moveToAdjacentLeaf(state.code[state.cursor.name], state.cursor.path, action.direction)))

      case T_ENQUEUE_JOB:
        return updateKey(state, 'jobQueue',
          JobQueue.enqueue(state.jobQueue, action.job))

      case T_UPDATE_JOB_QUEUE:
        return updateKey(state, 'jobQueue', action.queue)

      default:
        throw new TypeError('Unknown action: ' + action.type)
    }
  }

  (state, dispatch) => dispatch({ast: {type: 'apply', fn: state.ast, arg: {type: 'hole'}}})

  return {
    /* Top-level actions */
    importAst: ast => {
      return { type: T_IMPORT_AST, name: 'main', ast: ast }
    },

    ast: action => {
      return { type: T_AST, name: 'main', action: action }
    },

    cursorMotion: direction => {
      return { type: T_CURSOR_MOTION, direction: direction }
    },

    enqueueJob: job => {
      return { type: T_ENQUEUE_JOB, job: job }
    },

    updateJobQueue: queue => {
      return { type: T_UPDATE_JOB_QUEUE, queue: queue }
    },

    /* AST actions */
    applySelected: { type: AST_APPLY_SELECTED },
    applyWithSelected: { type: AST_APPLY_WITH_SELECTED },

    /* Reducer */
    reducer: reducer
  }
})
