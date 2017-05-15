import Editor from '../src/core/editor'
import EditorUI from '../src/ui/editor-ui'
import initialAst from '../src/initial-ast'
import Test from '../src/Test'

var editor = new Editor()
var editorUI = new EditorUI(editor, document.querySelector('.editor'))
editor.showAst(initialAst)

console.log(Test)
