require.config({
  baseUrl: 'js'
})

define(['editor', 'editor-ast'], function (Editor, __initialAst) {
  var editor = new Editor(document.querySelector('.editor'))
  editor.showAst(__initialAst)
})
