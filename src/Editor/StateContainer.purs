module Editor.StateContainer (
  StateContainer, Reducer,
  create, get, apply
) where

import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Ref (REF, Ref, newRef, readRef, writeRef)
import Prelude (Unit, bind, pure, ($))

type Reducer s a = a -> s -> s
data StateContainer s a = StateContainer (Ref s) (Reducer s a)

create :: forall e s a. Reducer s a -> s -> Eff (ref :: REF | e) (StateContainer s a)
create reducer initialState = do
  ref <- newRef initialState
  pure $ StateContainer ref reducer

get :: forall e s a. StateContainer s a -> Eff (ref :: REF | e) s
get (StateContainer ref _) = readRef ref

apply :: forall e s a. a -> StateContainer s a -> Eff (ref :: REF | e) Unit
apply action (StateContainer ref reducer) = do
  state <- readRef ref
  let state' = reducer action state
  writeRef ref state'
