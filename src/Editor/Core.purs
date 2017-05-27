module Editor.Core (
  initialState
) where

import Editor.State
import Data.StrMap as Map
import Editor.JobQueue as JobQueue
import Model.Ast as Ast
import Data.Maybe (Maybe(..))
import Editor.KeyMap as KeyMap

initialState :: EditorState
initialState = EditorState {
  code: Map.insert "main" Ast.Hole Map.empty,
  cursor: EditorCursor "main" Nothing,
  jobQueue: JobQueue.empty,
  cache: Map.empty,
  keyMap: KeyMap.empty
}
