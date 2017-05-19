import Transformers from '../Editor/Transformers'

const bindings = [
  {
    key: '<space>',
    action: {
      description: 'Call the current expression as a function',
      action: new Transformers.AstAction(Transformers.ApplySelected.value)
    }
  },
  {
    key: '.',
    action: {
      description: 'Call a function with the current expression',
      action: new Transformers.AstAction(Transformers.ApplyWithSelected.value)
    }
  },
  {
    key: 'l',
    action: {
      description: 'Wrap the current expression in a let',
      action: new Transformers.AstAction(Transformers.WrapInLet.value)
    }
  },
  {
    key: '\\',
    action: {
      description: 'Replace the current expression with a lambda',
      action: new Transformers.AstAction(Transformers.ReplaceWithLambda.value)
    }
  },

  {
    key: '<left>',
    action: {
      description: 'Move to the previous leaf node',
      action: new Transformers.CursorAction(-1)
    }
  },
  {
    key: '<right>',
    action: {
      description: 'Move to the next leaf node',
      action: new Transformers.CursorAction(1)
    }
  },
]

module.exports = {
  bindings: bindings
}
