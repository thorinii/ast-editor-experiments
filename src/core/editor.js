import StateContainer from '../Editor/StateContainer'
import Transformers from '../Editor/Transformers'
import KeyMap from './keymap'
import JobExecutor from './job-executor'
import CompileTask from './task-compile'
import TestTask from './task-test'
import DefaultKeyMapConfig from './default-keymap-config'
import Core from '../Editor/Core'

const EVENT_IMPORT_AST = 'import-ast'
const EVENT_KEY = 'key'
const EVENT_JOB_UPDATE = 'job-update'
const EVENT_UPDATE_CACHE = 'update-cache'

const initialState = Core.initialState

function Editor () {
  this._state = StateContainer.create(Transformers.reducer)(initialState)()
  this._keyMap = new KeyMap()
  this._jobExecutor = new JobExecutor(
    () => { this._dispatchEvent({ type: EVENT_JOB_UPDATE }) },
    (target, key, value) => { this._dispatchEvent({ type: EVENT_UPDATE_CACHE, target, key, value }) }
  )
  this._listener = null

  CompileTask(this._jobExecutor)
  TestTask(this._jobExecutor)

  this._keyMap.addBindings(DefaultKeyMapConfig.bindings)
}

Editor.prototype.setListener = function (listener) {
  if (this._listener !== null) throw new Error('Can only set one listener on the Editor')
  this._listener = listener
}
Editor.prototype.getState = function () { return StateContainer.get(this._state)() }
Editor.prototype.getKeyMap = function () { return this._keyMap }

Editor.prototype.showAst = function (ast) {
  this._dispatchEvent({ type: EVENT_IMPORT_AST, ast: ast })
}
Editor.prototype.dispatchKey = function (key) {
  this._dispatchEvent({ type: EVENT_KEY, key: key })
}

Editor.prototype._dispatchEvent = function (ev) {
  setTimeout(() => {
    this._processEvent(ev)

    this._processJobWatchers()
    this._processJobQueue()

    this._listener()
  })
}

Editor.prototype._processEvent = function (ev) {
  switch (ev.type) {
    case EVENT_IMPORT_AST: {
      StateContainer.apply(new Transformers.ImportAstAction('main', ev.ast))(this._state)()
      break
    }

    case EVENT_KEY: {
      const action = this._keyMap.getAction(ev.key)
      if (action !== undefined) {
        StateContainer.apply(action)(this._state)()
      } else {
        console.log('unbound key:', ev.key)
      }
      break
    }

    case EVENT_JOB_UPDATE: {
      // no-op to get the JobExecutor to reprocess
      break
    }

    case EVENT_UPDATE_CACHE: {
      StateContainer.apply(new Transformers.UpdateCache(ev.target, ev.key, ev.value))(this._state)()
      break
    }

    default: {
      console.warn('Unknown event', ev.type, ev)
      break
    }
  }
}

Editor.prototype._processJobWatchers = function () {
  const state = this.getState()
  const queue = state.jobQueue
  const nextQueue = this._jobExecutor.processWatchers(state, queue)
  StateContainer.apply(new Transformers.UpdateJobQueue(nextQueue))(this._state)()
}

Editor.prototype._processJobQueue = function () {
  const state = this.getState()
  const queue = state.jobQueue
  const nextQueue = this._jobExecutor.process(state, queue)
  StateContainer.apply(new Transformers.UpdateJobQueue(nextQueue))(this._state)()
}

module.exports = Editor
