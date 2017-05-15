import React from 'react'
import UI from './ui-components'

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

    return e(UI.pane, {
      title: 'Key Bindings',
      type: 'keymap',
      body: e('ul', {}, ...bindings)
    })
  }
}
