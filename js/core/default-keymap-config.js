import Transformers from './transformers'

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

module.exports = {
  bindings: bindings
}
