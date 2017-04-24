var __initialAst = lam('ast', lets(

  'debugSeq', lam('print', 'ret', lets(
    'ignored', ap('console.log', 'print'),
    'ret'
  )),

  'node', lam('type', 'content', bin('+', l('<span class="code-ast-node code-ast-'), 'type', l('">'), 'content', l('</span>'))),
  'nodeBlock', lam('type', 'content', bin('+', l('<div class="code-ast-node code-ast-'), 'type', l('">'), 'content', l('</div>'))),

  'kw', lam('word', ap('node', l('keyword'), 'word')),
  'id', lam('word', ap('node', l('identifier'), 'word')),
  'lit', lam('word', ap('node', l('literal'), ap('htmlEscape', ap('JSON.stringify', 'word')))),

  'parenL', ap('node', l('brace-left'), l('(')),
  'parenR', ap('node', l('brace-right'), l(')')),

  'indent', lam('content', ap('nodeBlock', l('indent'), 'content')),


  'translate', lam('ast',
    caseof('ast.type',

      l('literal'), ap('lit', 'ast.value'),
      l('variable'), ap('node', l('identifier'), 'ast.id'),

      l('binary'), lets(
        'all', ap('Array$intersperse', ap('kw', 'ast.op'), ap('map', 'translate', 'ast.args')),
        'joined', ap('Array$join', l(''), 'all'),
        ap('nodeBlock', l('let'), 'joined')
      ),

      l('let+'), lets(
        'value', ap('translate', 'ast.result'),
        'bindings', ap('map', lam('b',
          bin('+', ap('id', 'b[0]'), ap('kw', l('=')), ap('indent', ap('translate', 'b[1]')))
        ), 'ast.bindings'),
        'bindingsJoined', ap('Array$join', l(''), 'bindings'),
        ap('nodeBlock', l('let'), bin('+',
          ap('kw', l('let')),
          ap('indent', 'bindingsJoined'),
          ap('kw', l('in')),
          ap('indent', 'value')
        ))
      ),

      l('lambda'), lets(
        'value', ap('translate', 'ast.value'),
        ap('nodeBlock', l('lambda'), bin('+',
          ap('kw', l('λ')),
          ap('id', 'ast.arg'),
          ap('kw', l('→')),
          ap('indent', 'value')
        ))
      ),

      l('apply'), lets(
        'fn', ap('translate', 'ast.fn'),
        'arg', ap('translate', 'ast.arg'),
        ap('node', l('apply'), bin('+',
          'fn', 'parenL', 'arg', 'parenR'
        ))
      ),

      l('pattern'), lets(
        'arg', ap('translate', 'ast.arg'),
        'cases', ap('map', lam('b', lets(
          'pattern', caseof('b[0].type',
            l('literal'), ap('lit', 'b[0].value'),
            l('any'), ap('id', l('_')),
            any(), ap('debugSeq', 'b[0]', ap('id', 'b[0]'))
          ),
          bin('+', 'pattern', ap('kw', l('→')), ap('indent', ap('translate', 'b[1]'))))
        ), 'ast.cases'),
        'casesJoined', ap('Array$join', l(''), 'cases'),
        ap('node', l('apply'), bin('+',
          ap('kw', l('case')),
          'arg',
          ap('kw', l('of')),
          ap('indent', 'casesJoined')
        ))
      ),

      any(), ap('debugSeq', 'ast', ap('node', l('unknown'), l('UNKNOWN')))
    )
  ),


  ap('translate', ap('scrollLets', ap('sugarifyLet', 'ast')))
))
