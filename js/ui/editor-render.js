define(['react', 'ui/ast-render-react', 'ast/bootstrap-compiler', 'ui/keymap-chart', 'ui/ui-components'], function (React, AstRenderReact, Bootstrap, KeyMapChart, UI) {
  const e = React.createElement
  const tryFn = (fn, error) => { try { return fn() } catch (e) { return error(e) } }

  const AstView = props => e(
    'div',
    {className: 'code-text', tabIndex: 0},
    tryFn(() => AstRenderReact.render(props.cursor, props.ast), e => ['' + e]))

  const CompiledJsView = props => {
    const result = props.compiled['main']
    let render
    if (!result) {
      render = 'not compiled'
    } else if (!result.success) {
      render = 'failed to compile'
    } else {
      render = result.output
    }
    return e('div', {className: 'code-text'}, render)
  }

  return {
    editor: props => {
      const state = props.state

      const pane = e('div', {className: 'pane'}, e(AstView, {ast: state.code['main'], cursor: state.cursor.path}))

      const sidebar = e('div', {className: 'sidebar'},
        e(UI.pane, {
          type: 'status pane-noseparator',
          body: e('div', {className: 'message info'}, state.status)
        }),
        e(UI.pane, {
          title: 'Instructions',
          body: e('div', {}, 'Go and code things')
        }),
        e(KeyMapChart.render, {keyMap: props.keyMap}),
        e(UI.pane, {
          title: 'Compiled JS',
          body: e(CompiledJsView, {compiled: state.cache['compiled'] || {}})
        }))

      return e('div', {},
        e('div', {className: 'container'}, pane, sidebar))
    }
  }
})
