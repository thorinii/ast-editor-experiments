module Editor.Core (
  EditorState(..), EditorCursor(..), JobQueue,
  initialState
) where

import Data.StrMap as Map
import Data.Maybe (Maybe(..))
import Data.StrMap (StrMap)
import Model.Ast (Expr)
import Model.Ast as Ast
import Model.Cursor (Cursor)

newtype EditorCursor = EditorCursor {
  name :: String,
  path :: Maybe Cursor
}

newtype EditorState = EditorState {
  code :: StrMap Expr,
  cursor :: EditorCursor,
  jobQueue :: JobQueue,
  cache :: StrMap {}
}

type JobQueue = {}

initialState :: JobQueue -> EditorState
initialState jobQueue = EditorState {
  code: Map.insert "main" Ast.Hole Map.empty,
  cursor: EditorCursor { name: "main", path: Nothing },
  jobQueue: jobQueue,
  cache: Map.empty
}
