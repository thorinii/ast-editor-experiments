module Editor.Threading (
  startThread,
  createQueue,
  takeQueue, putQueue, putQueue'
) where

import Control.Monad.Aff.AVar as AVar
import Control.Monad.Aff (Aff, forkAff, runAff)
import Control.Monad.Aff.AVar (AVAR, AVar)
import Control.Monad.Eff (Eff)
import Prelude (Unit, bind, pure, unit, ($))

startThread :: forall e. Aff (avar :: AVAR | e) Unit -> Eff (avar :: AVAR | e) Unit
startThread thread = do
  _ <- runAff (\e -> startThread thread)
              (\_ -> pure unit)
              (forkAff thread)
  pure unit

createQueue :: forall e a. Aff (avar :: AVAR | e) (AVar a)
createQueue = AVar.makeVar

takeQueue :: forall e a. AVar a -> Aff (avar :: AVAR | e) a
takeQueue = AVar.takeVar

putQueue :: forall e a. AVar a -> a -> Aff (avar :: AVAR | e) Unit
putQueue queue item = do
  _ <- forkAff $ AVar.putVar queue item
  pure unit

putQueue' :: forall e a. AVar a -> a -> Eff (avar :: AVAR | e) Unit
putQueue' queue item = do
  _ <- runAff (\e -> pure unit)
              (\_ -> pure unit)
              (putQueue queue item)
  pure unit
