module Editor.Transformers (
  Action(..), AstAction(..),
  reducer
) where

import Data.StrMap as Map
import Editor.JobQueue as JobQueue
import Model.Ast.Operators as Ops
import Model.Cursor as Cursor
import Data.Maybe (Maybe(..), maybe)
import Editor.JobQueue (JobQueue, Job)
import Editor.State (EditorState(..), EditorCursor(..), JobResult)
import Model.Ast (Expr)
import Model.Cursor (Cursor)
import Prelude (id, ($), (<<<), (>>=))

reducer :: Action -> EditorState -> EditorState
reducer action (EditorState state) = EditorState $ case action of
  ImportAstAction name e -> state { code = Map.insert name e state.code }

  AstAction a ->
    let (EditorCursor name path) = state.cursor
        updater = maybe Just (\path' -> Just <<< astReducer a path') path
    in state { code = Map.update updater name state.code}

  CursorAction direction ->
    let (EditorCursor name path) = state.cursor
        ast = Map.lookup name state.code
        path' = ast >>= (\ast' -> Cursor.nextAdjacentLeaf ast' path direction)
    in state { cursor = EditorCursor name path' }

  EnqueueJobAction job -> state { jobQueue = JobQueue.enqueue job state.jobQueue }
  UpdateJobQueue queue -> state { jobQueue = queue }

  UpdateCache target key value ->
    let cacheTarget = maybe Map.empty id $ Map.lookup target state.cache
        cacheTarget' = Map.insert key value cacheTarget
    in state { cache = Map.insert target cacheTarget' state.cache}


astReducer :: AstAction -> Cursor -> Expr -> Expr
astReducer action cursor expr = case action of
  ApplySelected -> Ops.wrapApplyFn cursor expr
  ApplyWithSelected -> Ops.wrapApplyTo cursor expr
  WrapInLet -> Ops.wrapInLet cursor expr
  ReplaceWithLambda -> Ops.replaceWithLambda cursor expr

data Action = ImportAstAction String Expr
            | AstAction AstAction
            | CursorAction Int
            | EnqueueJobAction Job
            | UpdateJobQueue JobQueue
            | UpdateCache String String JobResult

data AstAction = ApplySelected
               | ApplyWithSelected
               | WrapInLet
               | ReplaceWithLambda
