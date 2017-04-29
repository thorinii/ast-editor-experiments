define(['ast-operators'], function (AstOps) {
  return {
    translate: function (ast) {
      ast = AstOps.scrollLets(AstOps.sugarifyLet(ast))

      switch (ast.type) {
        case 'hole': return 'undefined'
        case 'literal': return JSON.stringify(ast.value)
        case 'variable': return ast.id
        case 'binary': return ast.args.map(a => this.translateP(a)).join(' ' + ast.op + ' ')
        case 'lambda': return 'function(' + ast.arg + '){return ' + this.translate(ast.value) + '}'
        case 'apply':
          return this.translateP(ast.fn) + '(' + this.translate(ast.arg) + ')'

        case 'let':
          return '(function(){var ' + ast.binding + ' = ' + this.translate(ast.value) + ';return ' + this.translate(ast.result) + '})()'

        case 'let+':
          return '(function(){' +
            ast.bindings.reduceRight((acc, b) => {
              return 'var ' + b[0] + ' = ' + this.translate(b[1]) + ';' + acc
            }, 'return ' + this.translate(ast.result)) +
            '})()'

        case 'pattern':
          let casesBlock = ast.cases.reduceRight((tmp, c) => {
            let condition
            switch (c[0].type) {
              case 'any': condition = 'true'; break
              case 'literal': condition = '_$m === ' + JSON.stringify(c[0].value); break
              default: condition = 'UNKNOWN'; break
            }
            if (condition === 'true') return this.translateP(c[1])
            else return condition + ' ? ' + this.translateP(c[1]) + ' : ' + tmp
          }, '_$throw(new Error("Unmatched case: " + JSON.stringify(_$m)))')
          return '(function(_$m){return ' + casesBlock + '})(' + this.translate(ast.arg) + ')'

        default:
          console.warn('UNKNOWN AST node', ast.type, ast)
          return 'UNKNOWN'
      }
    },

    translateP: function (ast) {
      switch (ast.type) {
        case 'lambda':
        case 'binary':
          return '(' + this.translate(ast) + ')'
        default:
          return this.translate(ast)
      }
    }
  }
})
