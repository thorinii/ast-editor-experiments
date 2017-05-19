module Editor.State (
  EditorState(..), EditorCursor(..)
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
  cache :: StrMap (StrMap {})
}
