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

    return Components.pane('keymap')('Key Bindings')(
      e('ul', {}, ...bindings))
  }
}
