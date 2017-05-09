define(['ast/ast-builder'], function (A) {
  'use strict'

  return A.lets(
    'test', A.l('Hello'),
    A.bin('+', 'test', A.l(' world')))
})
