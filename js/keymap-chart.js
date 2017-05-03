define(['keymap', 'react', 'ui-components'], function (KeyMap, React, UI) {
  const e = React.createElement

  return {
    render: function (props) {
      const keyMap = props.keyMap

      const bindings = keyMap.bindings.map(binding => {
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
})
