define(['react'], function (React) {
  const e = React.createElement

  return {
    pane: function (props) {
      const title = props.title
      const type = props.type
      const body = props.body

      const className = 'pane' + (type ? ' pane-' + type : '')

      if (title) {
        return e('div', {className: className}, e('h2', {}, title), body)
      } else {
        return e('div', {className: className}, body)
      }
    }
  }
})
