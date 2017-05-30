module Editor.Core (
  initialState,
  Diff(..),
  class MonadEditor,
  reducer
) where

import Editor.State
import Data.StrMap as Map
import Editor.DefaultKeyBindings as DKB
import Editor.KeyMap as KeyMap
import Model.Ast as Ast
import Model.Ast.Operators as Ops
import Model.Cursor as Cursor
import Control.Monad.Writer (class MonadTell, tell)
import Data.Foldable (foldl)
import Data.Maybe (Maybe(..), maybe)
import Model.Cursor (Cursor)
import Prelude (class Show, Unit, bind, discard, flip, id, pure, ($), (<<<))


data Diff = Diff String
instance showDiff :: Show Diff where
  show (Diff s) = s

class (MonadTell (Array Diff) m) <= MonadEditor m
instance monadEditor :: (MonadTell (Array Diff) m) => MonadEditor m


initialState :: EditorState
initialState = EditorState {
  code: Map.insert "main" Ast.Hole Map.empty,
  cursor: EditorCursor "main" Nothing,
  cache: Map.empty,
  keyMap: foldl (flip KeyMap.addKeyBindingAction) KeyMap.empty DKB.bindings
}

pushTopLevelDiff :: forall m. MonadEditor m => String -> m Unit
pushTopLevelDiff name = tell $ [Diff name]


reducer :: forall m. MonadEditor m => Action -> EditorState -> m EditorState
reducer action (EditorState state) = case action of
  ImportAstAction name e -> do
    pushTopLevelDiff name
    pure $ EditorState $ state { code = Map.insert name e state.code }

  AstAction a -> do
    let (EditorCursor name path) = state.cursor
        updater = maybe Just (\path' -> Just <<< astReducer a path') path
    pushTopLevelDiff name
    pure $ EditorState $ state { code = Map.update updater name state.code}

  CursorAction direction ->
    let (EditorCursor name path) = state.cursor
        ast = Map.lookup name state.code
        path' = ast `bind` (\ast' -> Cursor.nextAdjacentLeaf ast' path direction)
    in pure $ EditorState $ state { cursor = EditorCursor name path' }

  UpdateCache target key value ->
    let cacheTarget = maybe Map.empty id $ Map.lookup target state.cache
        cacheTarget' = Map.insert key value cacheTarget
    in pure $ EditorState $ state { cache = Map.insert target cacheTarget' state.cache}

astReducer :: AstAction -> Cursor -> Ast.Expr -> Ast.Expr
astReducer action cursor expr = case action of
  ApplySelected -> Ops.wrapApplyFn cursor expr
  ApplyWithSelected -> Ops.wrapApplyTo cursor expr
  WrapInLet -> Ops.wrapInLet cursor expr
  ReplaceWithLambda -> Ops.replaceWithLambda cursor expr
