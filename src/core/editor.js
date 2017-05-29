import _Editor from '../Editor/Editor.purs'

const createEditor = function (callback) {
  _Editor.create(function (e) {
    callback(null, new Editor(e))
  }, function (error) {
    callback(error)
  })
}

function Editor (e) {
  this._e = e
}

Editor.prototype.setListener = function (listener) {
  _Editor.setListener(listener)(this._e)()
}

Editor.prototype.showAst = function (ast) {
  _Editor.showAst(ast)(this._e)()
}
Editor.prototype.dispatchKey = function (key) {
  _Editor.dispatchKey(key)(this._e)()
}

module.exports.createEditor = createEditor
