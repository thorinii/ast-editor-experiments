var JobExecutor = require('../core/job-executor')
var KeyMap = require('./KeyMap')
var DefaultKeyMapConfig = require('../core/default-keymap-config')
var CompileTask = require('../core/task-compile')
var TestTask = require('../core/task-test')

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
  return DefaultKeyMapConfig.bindings.reduce(function (acc, binding) {
    if (binding.action) {
      return KeyMap.addBinding(binding.key)(binding.action)(acc)
    } else {
      return KeyMap.addMappedBinding(binding.key)(binding.ref)(acc)
    }
  }, keyMap)
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

exports._call = function (listener) {
  return function () {
    return listener()
  }
}
