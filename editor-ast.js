const nodeClass = t => selected => {
  const cType = ' code-ast-' + t
  const cBrace = (t === 'brace-left' || t === 'brace-right') ? ' code-ast-brace' : ''
  const cHighlightable = (t === 'identifier' || t === 'keyword' || t === 'literal') ? ' highlightable' : ''
  const cSelected = selected ? ' selected' : ''
  return {className: 'code-ast-node' + cType + cBrace + cHighlightable + cSelected}
}

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

const ifEq = (test, check, then, otherwise) => if_(bin('===', test, check), then, otherwise)
const if_ = (test, then, otherwise) => caseof(test, l(true), then, any(), otherwise)

const debugSeq_ = (value) => lets('tmp', value, ap('debugSeq', 'tmp', 'tmp'))

const Array$dropFirst = array => array.slice(1)

var __initialAst = lam('cursor', 'ast', lets(

  'debugSeq', lam('print', 'ret', lets(
    'ignored', ap('console.log', 'print'),
    'ret'
  )),

  'el', 'reactElement',

  'node', lam('type', 'selected', 'content',
    ap('el', ap('ifBlock', 'content', l('div'), l('span')), ap('nodeClass', 'type', 'selected'), 'content')),
    // bin('+', l('<span class="code-ast-node code-ast-'), 'type', l('">'), 'content', l('</span>'))),
  'nodeBlock', lam('type', 'selected', 'content',
    ap('el', l('div'), ap('nodeClass', 'type', 'selected'), 'content')),

  'newline', ap('el', l('div'), l({}), l(null)),

  'kw', lam('word', ap('node', l('keyword'), l(false), 'word')),
  'id', lam('word', 'selected', ap('node', l('identifier'), 'selected', 'word')),
  'lit', lam('word', 'selected', ap('node', l('literal'), 'selected', ap('htmlEscape', ap('JSON.stringify', 'word')))),

  'parenL', ap('node', l('brace-left'), l(false), l('(')),
  'parenR', ap('node', l('brace-right'), l(false), l(')')),

  'indent', lam('content', ap('ifBlock', 'content', ap('nodeBlock', l('indent'), l(false), 'content'), 'content')),


  'unwrapCursor', lam('unwrapper', 'cursor',
    if_(bin('||', bin('===', 'cursor', l(null)), bin('===', 'cursor.length', l(0))), l(null),
      ifEq('unwrapper', 'cursor[0]', ap('Array$dropFirst', 'cursor'), l(null))
    )
  ),


  /* eslint-disable */
  'translate', lam('cursor', 'ast',
    lets(
      'selected', bin('&&', bin('!==', 'cursor', l(null)), bin('===', 'cursor.length', l(0))),

      caseof('ast.type',

        l('literal'), ap('lit', 'ast.value', 'selected'),
        l('variable'), ap('id', 'ast.id', 'selected'),

        l('binary'), lets(
          'all', ap('Array$intersperse', ap('kw', 'ast.op'), ap('map', ap('translate', ap('unwrapCursor', l(0), 'cursor')), 'ast.args')),
          ap('node', l('binary'), 'selected', 'all')
        ),

        l('let+'), lets(
          'value', ap('translate', ap('unwrapCursor', l('value'), 'cursor'), 'ast.result'),
          'joiner', ifEq('ast.bindings.length', l(1), l(''), ap('newline')),
          'bindings', ap('map', lam('b',
            arrayOf(ap('id', 'b[0]', l(false)), ap('kw', l('=')), ap('indent', ap('translate', ap('unwrapCursor', l('value'), ap('unwrapCursor', l(0), 'cursor')), 'b[1]')), 'joiner')
          ), 'ast.bindings'),
          ap('node', l('let'), 'selected', arrayOf(
            ap('kw', l('let')),
            ap('indent', 'bindings'),
            ap('kw', l('in')),
            ap('indent', 'value')
          ))
        ),

        l('lambda'), lets(
          'value', ap('translate', ap('unwrapCursor', l('value'), 'cursor'), 'ast.value'),
          ap('node', l('lambda'), 'selected', arrayOf(
            ap('kw', l('λ')),
            ap('id', 'ast.arg', l(false)),
            ap('kw', l('→')),
            ap('indent', 'value')
          ))
        ),

        l('apply'), lets(
          'fn', ap('translate', ap('unwrapCursor', l('fn'), 'cursor'), 'ast.fn'),
          'arg', ap('translate', ap('unwrapCursor', l('arg'), 'cursor'), 'ast.arg'),
          ap('node', l('apply'), 'selected', arrayOf(
            'fn', 'parenL', 'arg', 'parenR'
          ))
        ),

        l('pattern'), lets(
          'arg', ap('translate', ap('unwrapCursor', l('arg'), 'cursor'), 'ast.arg'),
          'cases', ap('map', lam('b', lets(
            'pattern', caseof('b[0].type',
              l('literal'), ap('lit', 'b[0].value', l(false)),
              l('any'), ap('id', l('_'), l(false)),
              any(), ap('debugSeq', 'b[0]', ap('id', 'b[0]', l(false)))
            ),
            arrayOf('pattern', ap('kw', l('→')), ap('indent', ap('translate', ap('unwrapCursor', l('value'), ap('unwrapCursor', l(0), 'cursor')), 'b[1]')), 'newline'))
          ), 'ast.cases'),
          ap('node', l('apply'), 'selected', arrayOf(
            ap('kw', l('case')),
            'arg',
            ap('kw', l('of')),
            ap('indent', 'cases')
          ))
        ),

        any(), ap('debugSeq', 'ast', ap('node', l('unknown'), 'selected', l('UNKNOWN')))
      )
    )
  ),


  ap('translate', 'cursor', ap('scrollLets', ap('sugarifyLet', 'ast')))
))
