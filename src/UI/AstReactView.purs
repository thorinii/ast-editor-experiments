module UI.AstReactView (render, ReactElement) where

import Ast
import Data.String as String
import Data.Array (concat, concatMap, mapWithIndex)
import Data.Foldable (any, elem, intercalate, length)
import Data.String (joinWith, split)
import Prelude (map, show, ($), (<>), (==), (>), (||))

type Cursor = Array String
foreign import data ReactElement :: Type

foreign import isSelected :: Cursor -> Boolean

render :: Cursor -> Expr -> ReactElement
render cursor ast =
  let selected = false -- isSelected cursor
      intersperse v vs = intercalate [v] $ map (\i -> [i]) vs
  in case ast of
      Hole -> keyword "???" selected
      Literal l -> lit l selected
      Variable v -> id v selected
      Binary op args ->
        let all = intersperse (keyword op false) $ map (render cursor) args
        in node "binary" selected all
      Let bs v ->
        let value = render cursor v
            joiner = if length bs > 1 then newline else text ""
            bindings = mapWithIndex (\_ (LetBinding name e) -> [
              id name false,
              keyword "=" false,
              indent [render cursor e],
              joiner]) bs
            bindings' = concat bindings
        in node "let" selected [
          keyword "let" false,
          indent bindings',
          keyword "in" false,
          indent [value]]
      Lambda args v ->
        let value = render cursor v
        in node "lambda" selected $
          [keyword "λ" false] <>
          map (\a -> id a false) args <>
          [keyword "→" false,
           indent [value]]
      Apply fn args ->
        let needsParensFn a = case a of
              Binary _ _ -> true
              Lambda _ _ -> true
              Let _ _ -> true
              _ -> false
            needsParensArg a = case a of
              Binary _ _ -> true
              Lambda _ _ -> true
              Apply _ _ -> true
              Let _ _ -> true
              _ -> false
            parenthesiseFn a rendered = if needsParensFn a then [parenL, rendered, parenR] else [rendered]
            parenthesiseArg a rendered = if needsParensArg a then [parenL, rendered, parenR] else [rendered]
            fn' = parenthesiseFn fn $ render cursor fn
            args' = map (\a -> parenthesiseArg a $ render cursor a) args
            isMultiline = any (\a -> ifBlock a true false) args'
        in node "apply" selected $
          if isMultiline then
            fn' <> map indent args'
          else
            fn' <> concat args'
      Pattern arg cases ->
        let arg' = render cursor arg
            cases' = mapWithIndex (\_ (PatternCase m e) -> [case m of
                PatternAny -> id "_" false
                PatternLiteral l -> text (htmlEscape $ showLiteral l),
              keyword "→" false,
              indent [render cursor e],
              newline]) cases
        in node "pattern" selected $
          [keyword "case" false, indent [arg']] <> concat cases' <> [newline]

-- const Array$dropFirst = array => array.slice(1)
-- const unwrapCursor = (unwrapper, cursor) => {
--   if (cursor === null || cursor.length === 0) {
--     return null
--   } else {
--     return unwrapper === cursor[0] ? Array$dropFirst(cursor) : null
--   }
-- }


newline = el "div" {} []
keyword word selected = node "keyword" selected [text word]
id word selected = node "identifier" selected [text word]
lit word selected = node "literal" selected [text (htmlEscape $ showLiteral word)]

parenL = node "brace-left" false [text "("]
parenR = node "brace-right" false [text ")"]

indent :: Array ReactElement -> ReactElement
indent content = ifBlock content (nodeBlock "indent" false content) (node "container" false content)

node :: String -> Boolean -> Array ReactElement -> ReactElement
node type' selected content = el (ifBlock content "div" "span") (nodeClass type' selected) content

nodeBlock :: String -> Boolean -> Array ReactElement -> ReactElement
nodeBlock type' selected content = el ("div") (nodeClass type' selected) content

nodeClass :: String -> Boolean -> { className :: String }
nodeClass type' selected =
  let cType = " code-ast-" <> type'
      cBrace = if type' == "brace-left" || type' == "brace-right" then " code-ast-brace" else ""
      cHighlightable = if type' == "identifier" || type' == "keyword" || type' == "literal" then " highlightable" else ""
      cSelected = if selected then " selected" else ""
  in { className: "code-ast-node" <> cType <> cBrace <> cHighlightable <> cSelected }

htmlEscape :: String -> String
htmlEscape html = joinWith "&lt;" $ split (String.Pattern "<") html

showLiteral :: LiteralValue -> String
showLiteral (LiteralNumber n) = show n
showLiteral (LiteralString s) = "\"" <> s <> "\""

foreign import text :: String -> ReactElement
foreign import el :: forall props. String -> props -> Array ReactElement -> ReactElement
foreign import ifBlock :: forall a. Array ReactElement -> a -> a -> a

--
-- module.exports = {
--   render: (cursor, ast) => translate(cursor, ast)
-- }
