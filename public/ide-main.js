import Editor from '../src/core/editor'
import EditorUI from '../src/ui/editor-ui'
import initialAst from '../src/initial-ast'

var editor = new Editor()
var editorUI = new EditorUI(editor, document.querySelector('.editor'))
editor.showAst(initialAst)
