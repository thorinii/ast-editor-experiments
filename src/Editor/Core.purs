module Editor.Core (
  initialState
) where

import Editor.State
import Data.StrMap as Map
import Editor.DefaultKeyBindings as DKB
import Editor.JobQueue as JobQueue
import Editor.KeyMap as KeyMap
import Model.Ast as Ast
import Data.Foldable (foldl)
import Data.Maybe (Maybe(..))
import Prelude (flip)

initialState :: EditorState
initialState = EditorState {
  code: Map.insert "main" Ast.Hole Map.empty,
  cursor: EditorCursor "main" Nothing,
  jobQueue: JobQueue.empty,
  cache: Map.empty,
  keyMap: foldl (flip KeyMap.addKeyBindingAction) KeyMap.empty DKB.bindings
}
