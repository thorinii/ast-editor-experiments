var React = require('react')

exports.text = function (t) { return t }

exports.el = function (type) { return function (props) { return function (content) {
  var tmp = []
  var go = function (a) {
    if (Array.isArray(a)) {
      a.forEach(function (el) { go(el) })
    } else {
      tmp.push(a)
    }
  }
  go(content)
  return React.createElement.bind(React, type, props).apply(React, tmp)
}}}

exports.ifBlock = function (test) { return function (then) { return function (otherwise) {
  var isBlock = function (test) { return Array.isArray(test) ? !!test.find(function (el) { return isBlock(el) }) : test.type === 'div' }
  return isBlock(test) ? then : otherwise
}}}

exports.isNull = function (v) { return v === null }

exports._debugSeq = function (debug) { return function (v) {
  console.log('debugseq', debug)
  return v
 }}
