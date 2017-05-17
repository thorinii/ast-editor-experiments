import Ast from './Model/Ast'

module.exports = new Ast.Let(
  [new Ast.LetBinding('test', new Ast.Literal(new Ast.LiteralString('Hello')))],
  new Ast.Binary('+', [new Ast.Variable('test'), new Ast.Literal(new Ast.LiteralString(' world'))]))
