import React from 'react'
import AstReactView from '../UI/AstReactView.purs'
import KeyMapChart from './keymap-chart'
import Components from '../UI/Components.purs'
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
  AstReactView.render(props.cursor)(props.ast))

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
  const result = props.evalResults['main']
  let render
  if (!result) {
    render = 'not tested'
  } else if (!result.value0) {
    render = 'failed to test'
  } else {
    render = result.value0
  }
  return e('div', {className: 'code-text'}, render)
}

module.exports = {
  editor: props => {
    const state = props.state

    const pane = e('div', {className: 'pane'}, e(AstView, {ast: state.code['main'], cursor: state.cursor.value1}))

    const sidebar = e('div', {className: 'sidebar'},
      Components['pane\'']('state pane-noseparator')(
        e(StatusView, Selectors.status(state))),
      Components.pane('instructions')('Instructions')(
        e('div', {}, 'Go and code things')),
      e(KeyMapChart.render, {keyMap: props.keyMap}),
      Components.pane('test')('Test results')(
        e(TestJsView, {evalResults: state.evalResults || {}})),
      Components.pane('compiled')('Compiled JS')(
        e(CompiledJsView, {compiled: state.cache['compiled'] || {}})))

    return e('div', {},
      e('div', {className: 'container'}, pane, sidebar))
  }
}
