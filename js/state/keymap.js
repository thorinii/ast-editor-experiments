define(['state/transformers'], function (Transformers) {
  'use strict'

  const bindings = [
    {
      key: '<space>',
      action: {
        description: 'Call the current expression as a function',
        action: Transformers.ast(Transformers.applySelected)
      }
    }, {
      key: '.',
      action: {
        description: 'Call a function with the current expression',
        action: Transformers.ast(Transformers.applyWithSelected)
      }
    },

    {
      key: 'l',
      action: {
        description: 'Move to the next leaf node',
        action: Transformers.cursorMotion(1)
      }
    }, {
      key: 'h',
      action: {
        description: 'Move to the previous leaf node',
        action: Transformers.cursorMotion(-1)
      }
    },

    { key: '<right>', ref: 'l' },
    { key: '<left>', ref: 'h' }
  ]

  const actions = bindings.reduce((acc, binding) => {
    acc[binding.key] = binding.action ? binding.action.action : binding.ref
    return acc
  }, {})

  return {
    isPassthrough: function (e) { return this.passthrough.indexOf(e.string) !== -1 },
    getAction: function (e) {
      if (typeof e === 'string') {
        const action = this.actions[e]
        return (typeof action === 'string') ? this.getAction(action) : action
      } else {
        return this.getAction(e.string)
      }
    },

    passthrough: [
      'ctrl + r', 'ctrl + shift + r',
      'f5', 'ctrl + f5'
    ],

    bindings: bindings,
    actions: actions
  }
})
