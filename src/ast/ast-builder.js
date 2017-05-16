import Ast from '../Ast'

const coerceId = thing => (typeof thing === 'string' ? new Ast.Variable(thing) : thing)

module.exports = {
  ap: function (fn, ...args) {
    return new Ast.Apply(coerceId(fn), args.map(a => coerceId(a)))
  },

  lam: function (...stuff) {
    let args = stuff.slice(0, stuff.length - 1)
    let value = stuff[stuff.length - 1]
    return new Ast.Lambda(args, coerceId(value))
  },

  bin: function (op, ...args) {
    return new Ast.Binary(op, args.map(a => coerceId(a)))
  },

  v: function (id) {
    return new Ast.Variable(id)
  },

  l: function (value) {
    if (typeof value === 'number') {
      return new Ast.Literal(new Ast.LiteralNumber(value))
    } else if (typeof value === 'string') {
      return new Ast.Literal(new Ast.LiteralString(value))
    } else {
      throw new TypeError('Unknown literal type: ' + value)
    }
  },

  lets: function (...stuff) {
    var bindingPairs = stuff.slice(0, stuff.length - 1)
    var inE = stuff[stuff.length - 1]

    var bindings = []
    for (let i = 0; i < bindingPairs.length - 1; i += 2) {
      bindings.push(new Ast.LetBinding(bindingPairs[i], coerceId(bindingPairs[i + 1])))
    }

    console.log(Ast.showA(new Ast.Let(bindings, coerceId(inE))))
    return new Ast.Let(bindings, coerceId(inE))
  },

  caseof: function (arg, ...caseValuePairs) {
    var cases = []
    for (let i = 0; i < caseValuePairs.length - 1; i += 2) {
      const pattern = caseValuePairs[i]
      const value = caseValuePairs[i + 1]
      cases.push(new Ast.PatternCase(pattern, value))
    }

    return new Ast.Pattern(coerceId(arg), cases)
  },

  any: function () {
    return new Ast.PatternAny()
  }
}
