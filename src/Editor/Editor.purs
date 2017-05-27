module Editor.Editor (
  Editor,
  create,
  setListener, getState, getKeyMap,
  showAst, dispatchKey
) where

import Editor.Core as Core
import Editor.JobExecutor as JobExecutor
import Editor.KeyMap as KeyMap
import Editor.State as State
import Editor.StateContainer as StateContainer
import Editor.Threading as Threading
import Editor.Transformers as Transformers
import Control.Monad.Aff (Aff)
import Control.Monad.Aff.AVar (AVAR, AVar)
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Class (liftEff)
import Control.Monad.Eff.Ref (REF, Ref, newRef, writeRef)
import Data.Maybe (Maybe(..), maybe)
import Editor.JobQueue (JobQueue, Job)
import Editor.KeyMap (KeyMap)
import Editor.State (EditorState)
import Editor.StateContainer (StateContainer)
import Model.Ast (Expr)
import Prelude (Unit, bind, discard, map, pure, unit, ($))

data Editor = Editor (StateContainer EditorState State.Action)
                     JobExecutor
                     (Maybe Listener)
                     (Ref (Event -> Eff (ref :: REF) Unit)) -- TODO: make this a Signal
                     (AVar Job)
                     (AVar State.Action)

data Event = ImportAstEvent Expr
           | KeyEvent KeyMap.KeyBinding
           | JobUpdateEvent
           | UpdateCacheEvent String String State.JobResult

type Listener = {}
type JobExecutor = {}

create :: forall e. Aff (ref :: REF, avar :: AVAR | e) Editor
create = do
  dispatchRef <- liftEff $ newRef (\ev -> pure unit)
  state <- liftEff $ StateContainer.create Transformers.reducer Core.initialState
  executorQueue <- Threading.createQueue
  actionQueue <- Threading.createQueue
  liftEff $ JobExecutor.start (JobExecutor.createExecutorState {} executorQueue actionQueue)
  jobExecutor <- liftEff $ _createJobExecutor JobUpdateEvent UpdateCacheEvent dispatchRef
  liftEff $ _installCompileTask jobExecutor
  liftEff $ _installTestTask jobExecutor
  Threading.putQueue executorQueue {type: "ho ho"}
  let editor' = Editor state jobExecutor Nothing dispatchRef executorQueue actionQueue
  liftEff $ writeRef dispatchRef (\ev -> dispatchEvent ev editor')
  pure editor'

setListener :: forall e. Listener -> Editor -> Eff (ref :: REF | e) Editor
setListener listener (Editor s e _ dispatchRef eq aq) = do
  let editor' = Editor s e (Just listener) dispatchRef eq aq
  writeRef dispatchRef (\ev -> dispatchEvent ev editor')
  pure editor'

getState :: forall e. Editor -> Eff (ref :: REF | e) EditorState
getState (Editor s _ _ _ _ _) = StateContainer.get s

getKeyMap :: forall e. Editor -> Eff (ref :: REF | e) (KeyMap State.Action)
getKeyMap e = map (State.keyMap) (getState e)

showAst :: forall e. Expr -> Editor -> Eff (ref :: REF | e) Unit
showAst ast = dispatchEvent (ImportAstEvent ast)

dispatchKey :: forall e. KeyMap.KeyBinding -> Editor -> Eff (ref :: REF | e) Unit
dispatchKey key = dispatchEvent (KeyEvent key)


dispatchEvent :: forall e. Event -> Editor -> Eff (ref :: REF | e) Unit
dispatchEvent ev editor = do
  processEvent ev editor
  processJobWatchers editor
  processJobQueue editor
  callListener editor


processEvent :: forall e. Event -> Editor -> Eff (ref :: REF | e) Unit
processEvent ev ed@(Editor sc _ _ _ _ _) = do
  state <- getState ed
  keyMap <- getKeyMap ed
  case ev of
    ImportAstEvent ast ->
      StateContainer.apply (State.ImportAstAction "main" ast) sc
    KeyEvent key ->
      let actionM = KeyMap.getAction key keyMap
      in maybe (pure unit)
               (\(KeyMap.KeyAction { action }) -> StateContainer.apply action sc)
               actionM
    JobUpdateEvent ->
      pure unit
    UpdateCacheEvent target key value ->
      StateContainer.apply (State.UpdateCache target key value) sc

processJobWatchers :: forall e. Editor -> Eff (ref :: REF | e) Unit
processJobWatchers ed@(Editor sc executor _ _ _ _) = do
  state <- getState ed
  let queue = State.jobQueue state
  queue' <- _processJobWatchers state queue executor
  StateContainer.apply (State.UpdateJobQueue queue') sc


processJobQueue :: forall e. Editor -> Eff (ref :: REF | e) Unit
processJobQueue ed@(Editor sc executor _ _ _ _) = do
  state <- getState ed
  let queue = State.jobQueue state
  queue' <- _processJobQueue state queue executor
  StateContainer.apply (State.UpdateJobQueue queue') sc

callListener :: forall e. Editor -> Eff (ref :: REF | e) Unit
callListener (Editor _ _ listenerM _ _ _) = case listenerM of
  Just listener -> _call listener
  Nothing -> pure unit

foreign import _createJobExecutor :: forall e. Event -> (String -> String -> State.JobResult -> Event) -> Ref (Event -> Eff (ref :: REF) Unit) -> Eff (ref :: REF | e) JobExecutor
foreign import _installCompileTask :: forall e. JobExecutor -> Eff (ref :: REF | e) Unit
foreign import _installTestTask :: forall e. JobExecutor -> Eff (ref :: REF | e) Unit

foreign import _processJobWatchers :: forall e. EditorState -> JobQueue -> JobExecutor -> Eff e JobQueue
foreign import _processJobQueue :: forall e. EditorState -> JobQueue -> JobExecutor -> Eff e JobQueue

foreign import _call :: forall e a. Listener -> Eff e a
