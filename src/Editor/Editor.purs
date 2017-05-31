module Editor.Editor (
  Editor,
  create,
  setListener,
  showAst, dispatchKey
) where

import Editor.Core as Core
import Editor.JobExecutor as JobExecutor
import Editor.KeyMap as KeyMap
import Editor.Listener as Listener
import Editor.State as State
import Editor.Threading as Threading
import Control.Monad.Aff (Aff)
import Control.Monad.Aff.AVar (AVAR, AVar)
import Control.Monad.Aff.Console (log)
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Class (liftEff)
import Control.Monad.Eff.Console (CONSOLE)
import Control.Monad.Eff.Ref (REF)
import Control.Monad.State (StateT, get, lift, modify, put, runStateT)
import Control.Monad.Writer (WriterT, execWriterT)
import Data.Array (concatMap)
import Data.Maybe (Maybe(..), maybe)
import Data.Traversable (for_)
import Editor.Event (Event(..))
import Editor.Job (Job(..))
import Editor.Listener (Listener)
import Model.Ast (Expr)
import Prelude (Unit, bind, discard, map, pure, show, unit, ($), (<>))

data Editor = Editor (AVar Job) (AVar Event)

type EditorState = {
  eventQueue :: AVar Event,
  executorQueue :: AVar Job,
  state :: State.EditorState,
  listener :: Maybe Listener
}
type EditorM e = StateT EditorState (Aff (avar :: AVAR, console :: CONSOLE | e))


create :: forall e. Aff (ref :: REF, avar :: AVAR, console :: CONSOLE | e) Editor
create = do
  executorQueue <- Threading.createQueue
  eventQueue <- Threading.createQueue
  liftEff $ start {
    eventQueue, executorQueue,
    state: Core.initialState,
    listener: Nothing
  }
  liftEff $ JobExecutor.start (JobExecutor.createExecutorState {} executorQueue eventQueue)
  pure $ Editor executorQueue eventQueue


setListener :: forall e. Listener -> Editor -> Eff (avar :: AVAR | e) Unit
setListener listener = dispatchEvent $ SetListener listener

showAst :: forall e. Expr -> Editor -> Eff (ref :: REF, avar :: AVAR | e) Unit
showAst ast = dispatchEvent (ImportAstEvent ast)

dispatchKey :: forall e. KeyMap.KeyBinding -> Editor -> Eff (ref :: REF, avar :: AVAR | e) Unit
dispatchKey key = dispatchEvent (KeyEvent key)

dispatchEvent :: forall e. Event -> Editor -> Eff (avar :: AVAR | e) Unit
dispatchEvent ev (Editor _ eventQueue) = Threading.putQueue' eventQueue ev


start :: forall e. EditorState -> Eff (avar :: AVAR, console :: CONSOLE | e) Unit
start state@{ listener, state: state' } = Threading.startThread $ do
  liftEff $ Listener.callListener listener state'
  result <- runStateT loop state
  pure unit

loop :: forall e. EditorM e Unit
loop = do
  { eventQueue, executorQueue } <- get
  event <- lift $ Threading.takeQueue eventQueue
  diff <- execWriterT $ handleEvent event
  { listener, state } <- get
  let jobs = map (\(Core.Diff name) -> (EvalJob name) `map` (State.lookupEvalExpr name state)) diff
      jobs' = concatMap (maybe [] (\j -> [j])) jobs
  lift $ for_ jobs' (Threading.putQueue executorQueue)
  liftEff $ Listener.callListener listener state
  loop

handleEvent :: forall e. Event -> WriterT (Array Core.Diff) (EditorM e) Unit
handleEvent event = do
  let reduce action = do
        es@{state} <- get
        state' <- Core.reducer action state
        lift $ put $ es { state = state' }
  { state } <- lift get
  let keyMap = State.keyMap state

  case event of
    ImportAstEvent ast ->
      reduce $ State.ImportAstAction "main" ast
    KeyEvent key ->
      let actionM = KeyMap.getAction key keyMap
      in maybe (pure unit)
               (\(KeyMap.KeyAction { action }) -> reduce action)
               actionM
    EvaluatedEvent key result -> reduce $ State.UpdateEvalResult key result
    SetListener listener ->
      modify (\es -> es { listener = Just listener })
