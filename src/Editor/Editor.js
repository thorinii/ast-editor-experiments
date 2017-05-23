var KeyMap = require('../core/keymap')
var JobExecutor = require('../core/job-executor')
var DefaultKeyMapConfig = require('../core/default-keymap-config')
var CompileTask = require('../core/task-compile')
var TestTask = require('../core/task-test')
var Maybe = require('../../bower_components/purescript-maybe/src/Data/Maybe')

exports._makeKeyMap = new KeyMap()

exports._createJobExecutor = function (JobUpdateEvent) {
  return function (UpdateCacheEvent) {
    return function (dispatcherRef) {
      return function () {
        return new JobExecutor(
          function () {
            setTimeout(function () {
              dispatcherRef.value(JobUpdateEvent)()
            })
          },
          function (target, key, value) {
            setTimeout(function () {
              dispatcherRef.value(UpdateCacheEvent(target)(key)(value))()
            })
          })
      }
    }
  }
}

exports._installCompileTask = function (jobExecutor) {
  return function () {
    CompileTask(jobExecutor)
  }
}

exports._installTestTask = function (jobExecutor) {
  return function () {
    TestTask(jobExecutor)
  }
}

exports._installKeyBindings = function (keyMap) {
  keyMap.addBindings(DefaultKeyMapConfig.bindings)
  return keyMap
}

exports._processJobWatchers = function (state) {
  return function (queue) {
    return function (executor) {
      return function () {
        return executor.processWatchers(state, queue)
      }
    }
  }
}

exports._processJobQueue = function (state) {
  return function (queue) {
    return function (executor) {
      return function () {
        return executor.process(state, queue)
      }
    }
  }
}

exports._getAction = function (key) {
  return function (keyMap) {
    const action = keyMap.getAction(key)
    if (action !== undefined) {
      return Maybe.Just.create(action)
    } else {
      return Maybe.Nothing.value
    }
  }
}

exports._call = function (listener) {
  return function () {
    return listener()
  }
}
