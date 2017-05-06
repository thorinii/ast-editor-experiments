define([
  'core/state-container', 'core/transformers',
  'core/keymap',
  'core/job-queue', 'core/job-executor',
  'core/default-keymap-config'], function (StateContainer, Transformers, KeyMap, JobQueue, JobExecutor, DefaultKeyMapConfig) {
  'use strict'

  const EVENT_IMPORT_AST = 'import-ast'
  const EVENT_KEY = 'key'
  const EVENT_JOB_UPDATE = 'job-update'

  const initialState = Object.freeze({
    status: 'Idle',
    code: {
      'main': {type: 'hole'}
    },
    cursor: {
      name: 'main',
      path: null
    },
    jobQueue: JobQueue.createQueue()
  })

  function compile (js) {
    return eval('(' + js + ')') // eslint-disable-line
  }

  function Editor () {
    this._state = new StateContainer(initialState, Transformers.reducer)
    this._keyMap = new KeyMap()
    this._jobExecutor = new JobExecutor(() => { this._dispatchEvent({ type: EVENT_JOB_UPDATE }) })
    this._listener = null

    this._keyMap.addBindings(DefaultKeyMapConfig.bindings)
  }

  Editor.prototype.setListener = function (listener) {
    if (this._listener !== null) throw new Error('Can only set one listener on the Editor')
    this._listener = listener
  }
  Editor.prototype.getState = function () { return this._state.get() }
  Editor.prototype.getKeyMap = function () { return this._keyMap }

  Editor.prototype.showAst = function (ast) {
    this._dispatchEvent({ type: EVENT_IMPORT_AST, ast: ast })
  }
  Editor.prototype.dispatchKey = function (key) {
    this._dispatchEvent({ type: EVENT_KEY, key: key })
  }

  Editor.prototype._dispatchEvent = function (ev) {
    this._processEvent(ev)

    // TODO: process job watchers
    this._processJobQueue()

    this._listener()
  }

  Editor.prototype._processEvent = function (ev) {
    switch (ev.type) {
      case EVENT_IMPORT_AST: {
        this._state.apply(Transformers.importAst(ev.ast))
        break
      }

      case EVENT_KEY: {
        const action = this._keyMap.getAction(ev.key)
        if (action !== undefined) {
          this._state.apply(action)
        } else {
          console.log('unbound key:', ev.key)
        }

        this._state.apply(Transformers.enqueueJob(JobQueue.createJob(
          'compile',
          {
            source: 'code',
            source_key: 'main',
            target: 'cache.compiler-output',
            target_key: 'main'
          })))
        break
      }

      case EVENT_JOB_UPDATE: {
        // no-op to get the JobExecutor to reprocess
        break
      }

      default: {
        console.warn('Unknown event', ev.type, ev)
        break
      }
    }
  }

  Editor.prototype._processJobQueue = function () {
    const queue = this.getState().jobQueue
    const nextQueue = this._jobExecutor.process(queue)
    this._state.apply(Transformers.updateJobQueue(nextQueue))
  }

  return Editor
})
