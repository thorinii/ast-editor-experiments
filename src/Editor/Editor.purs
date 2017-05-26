module Editor.Editor (
  Editor,
  create,
  setListener, getState, getKeyMap,
  showAst, dispatchKey
) where

import Editor.Core as Core
import Editor.State as State
import Editor.StateContainer as StateContainer
import Editor.Transformers as Transformers
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Ref (REF, Ref, newRef, writeRef)
import Data.Maybe (Maybe(..), maybe)
import Editor.JobQueue (JobQueue)
import Editor.State (EditorState)
import Editor.StateContainer (StateContainer)
import Model.Ast (Expr)
import Prelude (Unit, bind, discard, pure, unit)

data Editor = Editor (StateContainer EditorState Transformers.Action)
                     KeyMap
                     JobExecutor
                     (Maybe Listener)
                     (Ref (Event -> Eff (ref :: REF) Unit)) -- TODO: make this a Signal

data Event = ImportAstEvent Expr
           | KeyEvent Key
           | JobUpdateEvent
           | UpdateCacheEvent String String State.JobResult

type Listener = {}
type KeyMap = {}
type Key = {}
type JobExecutor = {}

create :: forall e. Eff (ref :: REF | e) Editor
create = do
  dispatchRef <- newRef (\ev -> pure unit)
  state <- StateContainer.create Transformers.reducer Core.initialState
  let keyMap = _installKeyBindings _makeKeyMap
  jobExecutor <- _createJobExecutor JobUpdateEvent UpdateCacheEvent dispatchRef
  _installCompileTask jobExecutor
  _installTestTask jobExecutor
  let editor' = Editor state keyMap jobExecutor Nothing dispatchRef
  writeRef dispatchRef (\ev -> dispatchEvent ev editor')
  pure editor'

setListener :: forall e. Listener -> Editor -> Eff (ref :: REF | e) Editor
setListener listener (Editor s k e _ dispatchRef) = do
  let editor' = Editor s k e (Just listener) dispatchRef
  writeRef dispatchRef (\ev -> dispatchEvent ev editor')
  pure editor'

getState :: forall e. Editor -> Eff (ref :: REF | e) EditorState
getState (Editor s _ _ _ _) = StateContainer.get s

getKeyMap :: Editor -> KeyMap
getKeyMap (Editor _ k _ _ _) = k

showAst :: forall e. Expr -> Editor -> Eff (ref :: REF | e) Unit
showAst ast = dispatchEvent (ImportAstEvent ast)

dispatchKey :: forall e. Key -> Editor -> Eff (ref :: REF | e) Unit
dispatchKey key = dispatchEvent (KeyEvent key)


dispatchEvent :: forall e. Event -> Editor -> Eff (ref :: REF | e) Unit
dispatchEvent ev editor = do
  processEvent ev editor
  processJobWatchers editor
  processJobQueue editor
  callListener editor


processEvent :: forall e. Event -> Editor -> Eff (ref :: REF | e) Unit
processEvent ev ed@(Editor sc keyMap _ _ _) = do
  state <- getState ed
  case ev of
    ImportAstEvent ast ->
      StateContainer.apply (Transformers.ImportAstAction "main" ast) sc
    KeyEvent key ->
      let actionM = _getAction(key)(keyMap)
      in maybe (pure unit) (\action -> StateContainer.apply action sc) actionM
    JobUpdateEvent ->
      pure unit
    UpdateCacheEvent target key value ->
      StateContainer.apply (Transformers.UpdateCache target key value) sc

processJobWatchers :: forall e. Editor -> Eff (ref :: REF | e) Unit
processJobWatchers ed@(Editor sc _ executor _ _) = do
  state <- getState ed
  let queue = State.jobQueue state
  queue' <- _processJobWatchers state queue executor
  StateContainer.apply (Transformers.UpdateJobQueue queue') sc


processJobQueue :: forall e. Editor -> Eff (ref :: REF | e) Unit
processJobQueue ed@(Editor sc _ executor _ _) = do
  state <- getState ed
  let queue = State.jobQueue state
  queue' <- _processJobQueue state queue executor
  StateContainer.apply (Transformers.UpdateJobQueue queue') sc

callListener :: forall e. Editor -> Eff (ref :: REF | e) Unit
callListener (Editor _ _ _ listenerM _) = case listenerM of
  Just listener -> _call listener
  Nothing -> pure unit

foreign import _makeKeyMap :: KeyMap
foreign import _createJobExecutor :: forall e. Event -> (String -> String -> State.JobResult -> Event) -> Ref (Event -> Eff (ref :: REF) Unit) -> Eff (ref :: REF | e) JobExecutor
foreign import _installCompileTask :: forall e. JobExecutor -> Eff (ref :: REF | e) Unit
foreign import _installTestTask :: forall e. JobExecutor -> Eff (ref :: REF | e) Unit
foreign import _installKeyBindings :: KeyMap -> KeyMap

foreign import _processJobWatchers :: forall e. EditorState -> JobQueue -> JobExecutor -> Eff e JobQueue
foreign import _processJobQueue :: forall e. EditorState -> JobQueue -> JobExecutor -> Eff e JobQueue

foreign import _getAction :: Key -> KeyMap -> Maybe Transformers.Action
foreign import _call :: forall e a. Listener -> Eff e a