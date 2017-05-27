module Editor.KeyMap (
  KeyMap, KeyBinding, KeyAction, KeyBindingAction,
  empty,
  isPassthrough,
  addBinding, addMappedBinding,
  getAction,
  getBindings
) where

import Data.StrMap as StrMap
import Data.Array (elem, snoc)
import Data.Either (Either(..))
import Data.Generic (class Generic, gEq)
import Data.Maybe (Maybe(..))
import Data.StrMap (StrMap)
import Editor.Transformers (Action)
import Prelude (class Eq, map)

newtype KeyBinding = KeyBinding String
newtype KeyAction = KeyAction { action :: Action, description :: String }
newtype KeyBindingAction = KeyBindingAction { key :: KeyBinding, action :: Either KeyAction KeyBinding }
newtype KeyMap = KeyMap { bindings :: Array KeyBindingAction, actions :: StrMap (Either KeyAction KeyBinding)}

derive instance genericKeyBinding :: Generic KeyBinding
instance eqKeyBinding :: Eq KeyBinding where
  eq = gEq

passthrough :: Array KeyBinding
passthrough = map KeyBinding [
  "ctrl + r", "ctrl + shift + r",
  "f5", "ctrl + f5",
  "ctrl + shift + i",
  "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12"]

isPassthrough :: KeyBinding -> Boolean
isPassthrough key = elem key passthrough

empty :: KeyMap
empty = KeyMap { bindings: [], actions: StrMap.empty }

addBinding :: KeyBinding -> KeyAction -> KeyMap -> KeyMap
addBinding key action map = addBinding_ key (Left action) map

addMappedBinding :: KeyBinding -> KeyBinding -> KeyMap -> KeyMap
addMappedBinding key ref map = addBinding_ key (Right ref) map

addBinding_ :: KeyBinding -> Either KeyAction KeyBinding -> KeyMap -> KeyMap
addBinding_ key@(KeyBinding keyS) action (KeyMap { bindings, actions }) =
  let bindings' = bindings `snoc` (KeyBindingAction { key, action })
      actions' = StrMap.insert keyS action actions
  in KeyMap { bindings: bindings', actions: actions' }

getAction :: KeyBinding -> KeyMap -> Maybe KeyAction
getAction key@(KeyBinding keyS) km@(KeyMap { actions }) =
  let lookup = StrMap.lookup keyS actions
  in case lookup of
    Just (Left action) -> Just action
    Just (Right ref) -> getAction ref km
    _ -> Nothing

getBindings :: KeyMap -> Array KeyBindingAction
getBindings (KeyMap { bindings }) = bindings
