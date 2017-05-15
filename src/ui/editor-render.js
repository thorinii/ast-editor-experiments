import React from 'react'
import AstRenderReact from './ast-render-react'
import KeyMapChart from './keymap-chart'
import UI from './ui-components'
import Selectors from '../core/selectors'

const e = React.createElement
const intersperse = (arr, sep) => arr.reduce((a, v) => [...a, v, sep], []).slice(0, -1)

const StatusView = props => e(
  'div',
  {className: 'message ' + props.level},
  intersperse(props.message.split('\n'), e('br')))

const AstView = props => e(
  'div',
  {className: 'code-text', tabIndex: 0},
  AstRenderReact.render(props.cursor, props.ast))

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

const TestJsView = props => {
  const result = props.testResults['main']
  let render
  if (!result) {
    render = 'not tested'
  } else if (!result.success) {
    render = 'failed to test'
  } else {
    render = result.output
  }
  return e('div', {className: 'code-text'}, render)
}

module.exports = {
  editor: props => {
    const state = props.state

    const pane = e('div', {className: 'pane'}, e(AstView, {ast: state.code['main'], cursor: state.cursor.path}))

    const sidebar = e('div', {className: 'sidebar'},
      e(UI.pane, {
        type: 'status pane-noseparator',
        body: e(StatusView, Selectors.status(state))
      }),
      e(UI.pane, {
        title: 'Instructions',
        body: e('div', {}, 'Go and code things')
      }),
      e(KeyMapChart.render, {keyMap: props.keyMap}),
      e(UI.pane, {
        title: 'Test results',
        body: e(TestJsView, {testResults: state.cache['tested'] || {}})
      }),
      e(UI.pane, {
        title: 'Compiled JS',
        body: e(CompiledJsView, {compiled: state.cache['compiled'] || {}})
      }))

    return e('div', {},
      e('div', {className: 'container'}, pane, sidebar))
  }
}
