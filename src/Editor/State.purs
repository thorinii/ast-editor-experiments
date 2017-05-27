module Editor.State (
  EditorState(..), EditorCursor(..),
  Action(..), AstAction(..),
  JobResult(..),
  code, cursor, jobQueue, cache, keyMap
) where

import Editor.JobQueue
import Data.Maybe (Maybe)
import Data.StrMap (StrMap)
import Editor.KeyMap (KeyMap)
import Model.Ast (Expr)
import Model.Cursor (Cursor)

data EditorCursor = EditorCursor String (Maybe Cursor)

newtype EditorState = EditorState {
  code :: StrMap Expr,
  cursor :: EditorCursor,
  jobQueue :: JobQueue,
  cache :: StrMap (StrMap JobResult),
  keyMap :: KeyMap Action
}

newtype JobResult = JobResult {
  success :: Boolean,
  input :: {},
  output :: {}
}

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


code :: EditorState -> StrMap Expr
code (EditorState c) = c.code

cursor :: EditorState -> EditorCursor
cursor (EditorState c) = c.cursor

jobQueue :: EditorState -> JobQueue
jobQueue (EditorState c) = c.jobQueue

cache :: EditorState -> StrMap (StrMap JobResult)
cache (EditorState c) = c.cache

keyMap :: EditorState -> KeyMap Action
keyMap (EditorState c) = c.keyMap
