const passthrough = [
  'ctrl + r', 'ctrl + shift + r',
  'f5', 'ctrl + f5',
  'ctrl + shift + i',
  'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'
]

const isPassthrough = function (key) { return passthrough.indexOf(key) !== -1 }

function KeyMap () {
  this._bindings = []
  this._actions = {}
}

KeyMap.prototype.addBindings = function (bindings) {
  bindings.forEach(b => this.addBinding(b))
}

KeyMap.prototype.addBinding = function (binding) {
  this._bindings.push(binding)
  this._actions[binding.key] = binding.action ? binding.action.action : binding.ref
}

KeyMap.prototype.isPassthrough = isPassthrough

KeyMap.prototype.getAction = function (key) {
  const action = this._actions[key]
  return (typeof action === 'string') ? this.getAction(action) : action
}

KeyMap.prototype.getBindings = function () { return this._bindings }
KeyMap.prototype.getActions = function () { return this._actions }

module.exports = KeyMap
