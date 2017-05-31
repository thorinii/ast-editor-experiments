module Editor.State (
  EditorState(..), EditorCursor(..),
  Action(..), AstAction(..),
  JobResult(..),
  code, cursor, cache, keyMap,
  lookupEvalExpr
) where

import Data.Maybe (Maybe)
import Data.StrMap as StrMap
import Data.StrMap (StrMap)
import Editor.KeyMap (KeyMap)
import Model.Ast (Expr)
import Model.Cursor (Cursor)

data EditorCursor = EditorCursor String (Maybe Cursor)

newtype EditorState = EditorState {
  code :: StrMap Expr,
  cursor :: EditorCursor,
  evalResults :: StrMap (Maybe String),
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
            | UpdateEvalResult String (Maybe String)

data AstAction = ApplySelected
               | ApplyWithSelected
               | WrapInLet
               | ReplaceWithLambda


code :: EditorState -> StrMap Expr
code (EditorState c) = c.code

cursor :: EditorState -> EditorCursor
cursor (EditorState c) = c.cursor

cache :: EditorState -> StrMap (StrMap JobResult)
cache (EditorState c) = c.cache

keyMap :: EditorState -> KeyMap Action
keyMap (EditorState c) = c.keyMap

lookupEvalExpr :: String -> EditorState -> Maybe Expr
lookupEvalExpr name (EditorState { code }) = StrMap.lookup name code
