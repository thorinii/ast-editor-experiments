var React = require('react')

exports.text = function (t) { return t }

exports.el = function (type) {
  return function (props) {
    return function (content) {
      return React.createElement.bind(React, type, props).apply(React, content)
    }
  }
}
