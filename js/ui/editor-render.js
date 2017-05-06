define(['react', 'ui/ast-render-react', 'ast/bootstrap-compiler', 'ui/keymap-chart', 'ui/ui-components'], function (React, AstRenderReact, Bootstrap, KeyMapChart, UI) {
  const e = React.createElement
  const tryFn = (fn, error) => { try { return fn() } catch (e) { return error(e) } }

  const AstView = props => e(
    'div',
    {className: 'code-text', tabIndex: 0},
    tryFn(() => AstRenderReact.render(props.cursor, props.ast), e => ['' + e]))

  const CompiledJsView = props => e(
    'div',
    {className: 'code-text'},
    tryFn(() => Bootstrap.translate(props.ast), e => '' + e))

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
          body: e(CompiledJsView, {ast: state.code['main']})
        }))

      return e('div', {},
        e('div', {className: 'container'}, pane, sidebar))
    }
  }
})
