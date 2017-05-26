module Editor.State (
  EditorState(..), EditorCursor(..),
  JobResult(..),
  code, cursor, jobQueue, cache
) where

import Data.Maybe (Maybe)
import Data.StrMap (StrMap)
import Editor.JobQueue
import Model.Ast (Expr)
import Model.Cursor (Cursor)

data EditorCursor = EditorCursor String (Maybe Cursor)

newtype EditorState = EditorState {
  code :: StrMap Expr,
  cursor :: EditorCursor,
  jobQueue :: JobQueue,
  cache :: StrMap (StrMap JobResult)
}

newtype JobResult = JobResult {
  success :: Boolean,
  input :: {},
  output :: {}
}

code :: EditorState -> StrMap Expr
code (EditorState c) = c.code

cursor :: EditorState -> EditorCursor
cursor (EditorState c) = c.cursor

jobQueue :: EditorState -> JobQueue
jobQueue (EditorState c) = c.jobQueue

cache :: EditorState -> StrMap (StrMap JobResult)
cache (EditorState c) = c.cache
