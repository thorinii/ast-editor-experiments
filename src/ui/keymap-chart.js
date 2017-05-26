import React from 'react'
import Components from '../UI/Components.purs'

const e = React.createElement

module.exports = {
  render: function (props) {
    const keyMap = props.keyMap

    const bindings = keyMap.getBindings().map(binding => {
      if (binding.action) {
        return e('li', {className: 'binding'},
          e('key', {}, binding.key),
          binding.action.description)
      } else {
        return e('li', {className: 'binding'},
          e('key', {}, binding.key),
          ' -> ',
          e('key', {}, binding.ref))
      }
    })

    // TODO: this is a component that can be placed in a pane, not a pane
    return Components.pane('keymap')('Key Bindings')(
      e('ul', {}, ...bindings))
  }
}
