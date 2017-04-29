require.config({
  baseUrl: 'js'
})

define(['editor', 'initial-ast'], function (Editor, initialAst) {
  var editor = new Editor(document.querySelector('.editor'))
  editor.showAst(initialAst)
})
