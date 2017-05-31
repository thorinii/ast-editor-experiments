module Editor.Listener (
  Listener, callListener
) where

import Control.Monad.Eff (Eff)
import Data.Maybe (Maybe(..))
import Editor.State (State)
import Prelude (Unit, pure, unit)

foreign import data Listener :: Type

callListener :: forall e. Maybe Listener -> State -> Eff e Unit
callListener listenerM state = case listenerM of
  Just listener -> _call listener state
  Nothing -> pure unit

foreign import _call :: forall e a. Listener -> State -> Eff e a
