import React from 'react'
import Components from '../UI/Components.purs'
import KeyMap from '../Editor/KeyMap'

const e = React.createElement

module.exports = {
  render: function (props) {
    const keyMap = props.keyMap

    const bindings = KeyMap.getBindings(keyMap).map(binding => {
      if (binding.action.constructor.name === 'Left') {
        return e('li', {className: 'binding'},
          e('key', {}, binding.key),
          binding.action.value0.description)
      } else {
        return e('li', {className: 'binding'},
          e('key', {}, binding.key),
          ' -> ',
          e('key', {}, binding.action.value0.ref))
      }
    })

    // TODO: this is a component that can be placed in a pane, not a pane
    return Components.pane('keymap')('Key Bindings')(
      e('ul', {}, ...bindings))
  }
}
