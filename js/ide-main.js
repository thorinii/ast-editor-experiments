/* globals require */

require.config({
  baseUrl: 'js',

  shim: {
    'editor-ast': {
      deps: ['main'],
      exports: '__initialAst'
    },
    'main': {
      deps: ['react'],
      exports: 'nothing'
    }
  }
})

define(['editor', 'editor-ast'], function (Editor, __initialAst) {
  var editor = new Editor(document.querySelector('.editor'))
  editor.showAst(__initialAst)
})
