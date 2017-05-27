import Editor from '../src/core/editor'
import EditorUI from '../src/ui/editor-ui'
import InitialAst from '../src/InitialAst'

Editor.createEditor(function (error, editor) {
  if (error) {
    console.error('Failed to start editor', error)
  } else {
    const editorUI = new EditorUI(editor, document.querySelector('.editor'))
    editor.showAst(InitialAst.main)
  }
})
