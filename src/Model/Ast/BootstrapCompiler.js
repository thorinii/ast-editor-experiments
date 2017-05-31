var Maybe = require('../../../bower_components/purescript-maybe/src/Data/Maybe')

var compile = function (js) {
  return eval('(' + js + ')') // eslint-disable-line
}

exports._eval = function (js) {
  try {
    var compiled = compile(js)
    if (typeof compiled !== 'string') compiled = String(compiled)
    return Maybe.Just.create(compiled)
  } catch (e) {
    console.warn('Failed to eval', e)
    return Maybe.Nothing.value
  }
}
