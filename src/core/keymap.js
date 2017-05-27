import KM from '../Editor/KeyMap'

const isPassthrough = KM.isPassthrough

function KeyMap () {
  this._km = KM.empty
}

KeyMap.prototype.addBindings = function (bindings) {
  bindings.forEach(b => this.addBinding(b))
}

KeyMap.prototype.addBinding = function (binding) {
  if (binding.action) {
    this._km = KM.addBinding(binding.key)(binding.action)(this._km)
  } else {
    this._km = KM.addMappedBinding(binding.key)(binding.ref)(this._km)
  }
}

KeyMap.prototype.isPassthrough = isPassthrough

KeyMap.prototype.getAction = function (key) {
  const actionM = KM.getAction(key)(this._km)
  if (actionM.value0) {
    return actionM.value0.action
  } else {
    return null
  }
}

KeyMap.prototype.getBindings = function () {
  return KM.getBindings(this._km)
}

module.exports = KeyMap
