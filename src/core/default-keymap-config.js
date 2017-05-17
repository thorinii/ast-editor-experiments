import Transformers from './transformers'

const bindings = [
  {
    key: '<space>',
    action: {
      description: 'Call the current expression as a function',
      action: Transformers.ast(Transformers.applySelected)
    }
  },
  {
    key: '.',
    action: {
      description: 'Call a function with the current expression',
      action: Transformers.ast(Transformers.applyWithSelected)
    }
  },
  {
    key: 'l',
    action: {
      description: 'Wrap the current expression in a let',
      action: Transformers.ast(Transformers.wrapInLet)
    }
  },
  {
    key: '\\',
    action: {
      description: 'Replace the current expression with a lambda',
      action: Transformers.ast(Transformers.replaceWithLambda)
    }
  },

  {
    key: '<left>',
    action: {
      description: 'Move to the previous leaf node',
      action: Transformers.cursorMotion(-1)
    }
  },
  {
    key: '<right>',
    action: {
      description: 'Move to the next leaf node',
      action: Transformers.cursorMotion(1)
    }
  },
]

module.exports = {
  bindings: bindings
}
