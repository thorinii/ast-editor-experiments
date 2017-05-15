import A from './ast/ast-builder'

module.exports = A.lets(
  'test', A.l('Hello'),
  A.bin('+', 'test', A.l(' world')))
