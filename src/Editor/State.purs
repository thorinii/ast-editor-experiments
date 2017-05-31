module Editor.State (
  State(..), EditorCursor(..),
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

newtype State = State {
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


code :: State -> StrMap Expr
code (State c) = c.code

cursor :: State -> EditorCursor
cursor (State c) = c.cursor

cache :: State -> StrMap (StrMap JobResult)
cache (State c) = c.cache

keyMap :: State -> KeyMap Action
keyMap (State c) = c.keyMap

lookupEvalExpr :: String -> State -> Maybe Expr
lookupEvalExpr name (State { code }) = StrMap.lookup name code
