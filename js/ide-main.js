require.config({
  baseUrl: 'js'
})

define(['state/editor', 'ui/editor-ui', 'initial-ast'], function (Editor, EditorUI, initialAst) {
  var editor = new Editor()
  var editorUI = new EditorUI(editor, document.querySelector('.editor'))
  editor.showAst(initialAst)
})
