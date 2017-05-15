import Editor from './core/editor'
import EditorUI from './ui/editor-ui'
import initialAst from './initial-ast'

import '../css/editor.css'

var editor = new Editor()
var editorUI = new EditorUI(editor, document.querySelector('.editor'))
editor.showAst(initialAst)
