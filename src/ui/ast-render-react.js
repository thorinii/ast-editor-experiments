import AstReactView from '../UI/AstReactView.purs'

module.exports = {
  render: (cursor, ast) => AstReactView.render(cursor)(ast)
}
