const nodeClass = t => { return {className: 'code-ast-node code-ast-' + t} }

const reactElement = type => props => content => {
  let tmp = []
  const go = a => {
    if (Array.isArray(a)) {
      a.forEach(el => go(el))
    } else {
      tmp.push(a)
    }
  }
  go(content)

  return React.createElement(type, props, ...tmp)
}

//

const arrayOf = (...items) => items.reduce((acc, el) => ap('Array$push', acc, el), l([]))

const ifBlock = test => then => otherwise => {
  const isBlock = test => Array.isArray(test) ? !!test.find(el => isBlock(el)) : test.type === 'div'
  return isBlock(test) ? then : otherwise
}

var __initialAst = lam('ast', lets(

  'debugSeq', lam('print', 'ret', lets(
    'ignored', ap('console.log', 'print'),
    'ret'
  )),

  'el', 'reactElement',

  'node', lam('type', 'content',
    ap('el', ap('ifBlock', 'content', l('div'), l('span')), ap('nodeClass', 'type'), 'content')),
    // bin('+', l('<span class="code-ast-node code-ast-'), 'type', l('">'), 'content', l('</span>'))),
  'nodeBlock', lam('type', 'content',
    ap('el', l('div'), ap('nodeClass', 'type'), 'content')),

  'newline', ap('el', l('div'), l({}), l(null)),

  'kw', lam('word', ap('node', l('keyword'), 'word')),
  'id', lam('word', ap('node', l('identifier'), 'word')),
  'lit', lam('word', ap('node', l('literal'), ap('htmlEscape', ap('JSON.stringify', 'word')))),

  'parenL', ap('node', l('brace-left'), l('(')),
  'parenR', ap('node', l('brace-right'), l(')')),

  'indent', lam('content', ap('ifBlock', 'content', ap('nodeBlock', l('indent'), 'content'), 'content')),


  'translate', lam('ast',
    caseof('ast.type',

      l('literal'), ap('lit', 'ast.value'),
      l('variable'), ap('node', l('identifier'), 'ast.id'),

      l('binary'), lets(
        'all', ap('Array$intersperse', ap('kw', 'ast.op'), ap('map', 'translate', 'ast.args')),
        ap('nodeBlock', l('let'), 'all')
      ),

      l('let+'), lets(
        'value', ap('translate', 'ast.result'),
        'joiner', caseof(bin('===', 'ast.bindings.length', l(1)), l(true), l(''), l(false), ap('newline')),
        'bindings', ap('map', lam('b',
          arrayOf(ap('id', 'b[0]'), ap('kw', l('=')), ap('indent', ap('translate', 'b[1]')), 'joiner')
        ), 'ast.bindings'),
        ap('node', l('let'), arrayOf(
          ap('kw', l('let')),
          ap('indent', 'bindings'),
          ap('kw', l('in')),
          ap('indent', 'value')
        ))
      ),

      l('lambda'), lets(
        'value', ap('translate', 'ast.value'),
        ap('node', l('lambda'), arrayOf(
          ap('kw', l('λ')),
          ap('id', 'ast.arg'),
          ap('kw', l('→')),
          ap('indent', 'value')
        ))
      ),

      l('apply'), lets(
        'fn', ap('translate', 'ast.fn'),
        'arg', ap('translate', 'ast.arg'),
        ap('node', l('apply'), arrayOf(
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
          arrayOf('pattern', ap('kw', l('→')), ap('indent', ap('translate', 'b[1]')), 'newline'))
        ), 'ast.cases'),
        ap('node', l('apply'), arrayOf(
          ap('kw', l('case')),
          'arg',
          ap('kw', l('of')),
          ap('indent', 'cases')
        ))
      ),

      any(), ap('debugSeq', 'ast', ap('node', l('unknown'), l('UNKNOWN')))
    )
  ),


  ap('translate', ap('scrollLets', ap('sugarifyLet', 'ast')))
))
