define([], function () {
  const coerceId = thing => (typeof thing === 'string' ? _variable(thing) : thing)
  const _variable = id => ({ type: 'variable', id })
  const _apply = (fn, arg) => ({ type: 'apply', fn, arg })

  return {
    ap: function (fn, ...args) {
      return args.reduce((acc, a) => _apply(acc, coerceId(a)), coerceId(fn))
    },

    lam: function (...stuff) {
      let args = stuff.slice(0, stuff.length - 1)
      let value = stuff[stuff.length - 1]
      return args.reduceRight((acc, a) => {
        return Object.freeze({
          type: 'lambda',
          arg: a,
          value: acc
        })
      }, typeof value === 'string' ? this.v(value) : value)
    },

    bin: function (op, ...args) {
      return Object.freeze({type: 'binary', op: op, args: args.map(a => typeof a === 'string' ? this.v(a) : a)})
    },

    v: function (id) {
      return Object.freeze({type: 'variable', id: id})
    },

    l: function (value) {
      return Object.freeze({type: 'literal', value: value})
    },

    lets: function (...stuff) {
      var bindingPairs = stuff.slice(0, stuff.length - 1)
      var inE = stuff[stuff.length - 1]

      var bindings = []
      for (let i = 0; i < bindingPairs.length - 1; i += 2) {
        bindings.push([bindingPairs[i], bindingPairs[i + 1]])
      }

      return bindings.reduceRight((e, bp) => {
        var name = bp[0]
        var value = bp[1]
        return this.ap(this.lam(name, e), value)
      }, inE)
    },

    caseof: function (arg, ...caseValuePairs) {
      var caseValues = []
      for (let i = 0; i < caseValuePairs.length - 1; i += 2) {
        caseValues.push([caseValuePairs[i], caseValuePairs[i + 1]])
      }

      return Object.freeze({
        type: 'pattern',
        arg: typeof arg === 'string' ? this.v(arg) : arg,
        cases: caseValues
      })
    },

    any: function () {
      return Object.freeze({type: 'any'})
    }
  }
})
