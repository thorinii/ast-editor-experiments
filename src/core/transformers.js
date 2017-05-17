import AstOperators from '../Model/Ast/Operators'
import Cursor from './cursor'
import JobQueue from './job-queue'

const T_IMPORT_AST = 'import-ast'
const T_AST = 'ast'
const T_CURSOR_MOTION = 'cursor-motion'
const T_ENQUEUE_JOB = 'enqueue-job'
const T_UPDATE_JOB_QUEUE = 'update-job-queue'
const T_UPDATE_CACHE = 'update-cache'

const AST_APPLY_SELECTED = 'apply-selected'
const AST_APPLY_WITH_SELECTED = 'apply-with-selected'
const AST_WRAP_IN_LET = 'wrap-in-let'
const AST_REPLACE_WITH_LAMBDA = 'replace-with-lambda'

const update = (original, patch) =>
  Object.freeze(Object.assign({}, original, patch))
const updateKey = (original, key, value) => {
  const patch = {}
  patch[key] = value
  return update(original, patch)
}

const astReducer = (ast, cursor, action) => {
  switch (action.type) {
    case AST_APPLY_SELECTED:
      return AstOperators.wrapApplyFn(cursor.path)(ast)

    case AST_APPLY_WITH_SELECTED:
      return AstOperators.wrapApplyTo(cursor.path)(ast)

    case AST_WRAP_IN_LET:
      return AstOperators.wrapInLet(cursor.path)(ast)

    case AST_REPLACE_WITH_LAMBDA:
      return AstOperators.replaceWithLambda(cursor.path)(ast)

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
          astReducer(state.code[action.name], state.cursor, action.action)))

    case T_CURSOR_MOTION:
      return updateKey(state, 'cursor',
        updateKey(state.cursor, 'path',
          Cursor.moveToAdjacentLeaf(state.code[state.cursor.name], state.cursor.path, action.direction)))

    case T_ENQUEUE_JOB:
      return updateKey(state, 'jobQueue',
        JobQueue.enqueue(state.jobQueue, action.job))

    case T_UPDATE_JOB_QUEUE:
      return updateKey(state, 'jobQueue', action.queue)

    case T_UPDATE_CACHE: {
      return updateKey(state, 'cache',
        updateKey(state.cache, action.target,
          updateKey(state.cache[action.target], action.key, action.value)))
    }

    default:
      throw new TypeError('Unknown action: ' + action.type)
  }
}

(state, dispatch) => dispatch({ast: {type: 'apply', fn: state.ast, arg: {type: 'hole'}}})

module.exports = {
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

  updateCache: (target, key, value) => {
    return { type: T_UPDATE_CACHE, target, key, value }
  },

  /* AST actions */
  applySelected: { type: AST_APPLY_SELECTED },
  applyWithSelected: { type: AST_APPLY_WITH_SELECTED },
  wrapInLet: { type: AST_WRAP_IN_LET },
  replaceWithLambda: { type: AST_REPLACE_WITH_LAMBDA },

  /* Reducer */
  reducer: reducer
}
