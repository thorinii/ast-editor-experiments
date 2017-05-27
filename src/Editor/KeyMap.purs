module Editor.KeyMap (
  KeyMap, KeyBinding, KeyAction(..), KeyBindingAction,
  empty,
  isPassthrough,
  addBinding, addKeyBindingAction,
  getAction,
  getBindings,
  makeAction, bindToAction
) where

import Data.StrMap as StrMap
import Data.Array (elem, snoc)
import Data.Generic (class Generic, gEq)
import Data.Maybe (Maybe)
import Data.StrMap (StrMap)
import Prelude (class Eq, map)

newtype KeyBinding = KeyBinding String
newtype KeyAction a = KeyAction { action :: a, description :: String }
newtype KeyBindingAction a = KeyBindingAction { key :: KeyBinding, action :: KeyAction a }
newtype KeyMap a = KeyMap { bindings :: Array (KeyBindingAction a), actions :: StrMap (KeyAction a) }

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

empty :: forall a. KeyMap a
empty = KeyMap { bindings: [], actions: StrMap.empty }

addBinding :: forall a. KeyBinding -> KeyAction a -> KeyMap a -> KeyMap a
addBinding key action map = addBinding_ key action map

addKeyBindingAction :: forall a. KeyBindingAction a -> KeyMap a -> KeyMap a
addKeyBindingAction (KeyBindingAction { key, action }) map = addBinding_ key action map

addBinding_ :: forall a. KeyBinding -> KeyAction a -> KeyMap a -> KeyMap a
addBinding_ key@(KeyBinding keyS) action (KeyMap { bindings, actions }) =
  let bindings' = bindings `snoc` (KeyBindingAction { key, action })
      actions' = StrMap.insert keyS action actions
  in KeyMap { bindings: bindings', actions: actions' }

getAction :: forall a. KeyBinding -> KeyMap a -> Maybe (KeyAction a)
getAction key@(KeyBinding keyS) km@(KeyMap { actions }) =
  let lookup = StrMap.lookup keyS actions
  in lookup

getBindings :: forall a. KeyMap a -> Array (KeyBindingAction a)
getBindings (KeyMap { bindings }) = bindings

makeAction :: forall a. a -> String -> KeyAction a
makeAction action description = KeyAction { action, description }

bindToAction :: forall a. String -> KeyAction a -> KeyBindingAction a
bindToAction key action = KeyBindingAction { key: KeyBinding key, action }
