define(['react', 'ast-render-react', 'bootstrap-compiler'], function (React, AstRenderReact, Bootstrap) {
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

      let statusEl = e('div', {className: 'message'}, state.status)

      return e('div', {},
        statusEl,
        e('div', {className: 'container container-2-columns'},
          e('div', {className: 'pane'}, e(AstView, {ast: state.ast, cursor: state.cursor})),
          e('div', {className: 'pane'}, e(CompiledJsView, {ast: state.ast}))))
    }
  }
})
