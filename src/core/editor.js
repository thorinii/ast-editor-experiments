import _Editor from '../Editor/Editor.purs'

function Editor () {
  this._e = _Editor.create()
}

Editor.prototype.setListener = function (listener) {
  this._e = _Editor.setListener(listener)(this._e)()
}
Editor.prototype.getState = function () {
  return _Editor.getState(this._e)()
}
Editor.prototype.getKeyMap = function () {
  return _Editor.getKeyMap(this._e)
}

Editor.prototype.showAst = function (ast) {
  _Editor.showAst(ast)(this._e)()
}
Editor.prototype.dispatchKey = function (key) {
  _Editor.dispatchKey(key)(this._e)()
}

module.exports = Editor
