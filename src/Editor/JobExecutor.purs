module Editor.JobExecutor (
  start,
  ExecutorState(), createExecutorState
) where

import Control.Monad.Aff.AVar as AVar
import Control.Monad.Eff.Console as Console
import Editor.Threading as Threading
import Control.Monad.Aff (Aff)
import Control.Monad.Aff.AVar (AVAR, AVar)
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Class (liftEff)
import Control.Monad.Eff.Unsafe (unsafeCoerceEff)
import Editor.Job (Job)
import Editor.State (Action)
import Prelude (Unit, bind, discard, show, ($), (<>))

data ExecutorState = ExecutorState TasksConfig InQueue OutQueue

createExecutorState :: TasksConfig -> InQueue -> OutQueue -> ExecutorState
createExecutorState config inQueue outQueue = ExecutorState config inQueue outQueue

type TasksConfig = {}
type InQueue = AVar Job
type OutQueue = AVar Action

data Task result
-- data TasksConfig job result = TasksConfig (job -> (Task result))

start :: forall e. ExecutorState -> Eff (avar :: AVAR | e) Unit
start es = Threading.startThread $ loop es

loop :: forall e. ExecutorState -> Aff (avar :: AVAR | e) Unit
loop es@(ExecutorState config inQueue outQueue) = do
  job <- Threading.takeQueue inQueue
  liftEff $ log $ "got a job: " <> show job
  loop es

log :: forall e. String -> Eff e Unit
log message = unsafeCoerceEff $ Console.log message
