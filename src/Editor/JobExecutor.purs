module Editor.JobExecutor (
  start,
  ExecutorState(), createExecutorState
) where

import Control.Monad.Aff.AVar as AVar
import Control.Monad.Eff.Console as Console
import Editor.Threading as Threading
import Model.Ast.BootstrapCompiler as Compiler
import Control.Monad.Aff (Aff)
import Control.Monad.Aff.AVar (AVAR, AVar)
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Class (liftEff)
import Control.Monad.Eff.Unsafe (unsafeCoerceEff)
import Editor.Event (Event(..))
import Editor.Job (Job(..))
import Model.Ast (Expr)
import Prelude (Unit, bind, discard, show, ($), (<>))

data ExecutorState = ExecutorState TasksConfig InQueue OutQueue

createExecutorState :: TasksConfig -> InQueue -> OutQueue -> ExecutorState
createExecutorState config inQueue outQueue = ExecutorState config inQueue outQueue

type TasksConfig = {}
type InQueue = AVar Job
type OutQueue = AVar Event

data Task result
-- data TasksConfig job result = TasksConfig (job -> (Task result))

start :: forall e. ExecutorState -> Eff (avar :: AVAR | e) Unit
start es = Threading.startThread $ loop es

loop :: forall e. ExecutorState -> Aff (avar :: AVAR | e) Unit
loop es@(ExecutorState config inQueue outQueue) = do
  job <- Threading.takeQueue inQueue
  case job of
    EvalJob name e -> jobEval es name e
  loop es

log :: forall e. String -> Eff e Unit
log message = unsafeCoerceEff $ Console.log message


jobEval :: forall e. ExecutorState -> String -> Expr -> Aff (avar :: AVAR | e) Unit
jobEval (ExecutorState _ _ outQueue) name expr = do
  let js = Compiler.translate expr
      result = Compiler.eval js
  Threading.putQueue outQueue $ EvaluatedEvent name result
