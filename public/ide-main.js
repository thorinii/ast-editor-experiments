import Editor from '../src/core/editor'
import EditorUI from '../src/ui/editor-ui'
import InitialAst from '../src/InitialAst'

var editor = new Editor()
var editorUI = new EditorUI(editor, document.querySelector('.editor'))
editor.showAst(InitialAst.main)
