module Editor.Listener (
  Listener, callListener
) where

import Control.Monad.Eff (Eff)
import Data.Maybe (Maybe(..))
import Editor.State (EditorState)
import Prelude (Unit, pure, unit)

foreign import data Listener :: Type

callListener :: forall e. Maybe Listener -> EditorState -> Eff e Unit
callListener listenerM state = case listenerM of
  Just listener -> _call listener state
  Nothing -> pure unit

foreign import _call :: forall e a. Listener -> EditorState -> Eff e a
