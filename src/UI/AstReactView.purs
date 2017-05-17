module UI.AstReactView (render, maybeNull, ReactElement) where

import Ast
import Data.String as String
import Cursor (Cursor(..))
import Data.Array (concat, head, mapWithIndex, tail)
import Data.Foldable (any, intercalate, length)
import Data.Functor ((<$>))
import Data.Maybe (Maybe(..), maybe)
import Data.String (joinWith, split)
import Prelude (class Show, bind, map, show, ($), (<>), (==), (>), (>>>), (||))

foreign import data ReactElement :: Type

foreign import isNull :: forall a. a -> Boolean
foreign import _debugSeq :: forall a. String -> a -> a
debugSeq :: forall a. Show a => a -> a
debugSeq a = _debugSeq (show a) a

maybeNull :: forall a. a -> Maybe a
maybeNull v = if isNull v then Nothing else Just v

render :: Maybe Cursor -> Expr -> ReactElement
render cursor ast =
  let selected = maybe false (\(Cursor c) -> length c == 0) cursor --(debugSeq cursor)
      intersperse v vs = intercalate [v] $ map (\i -> [i]) vs
  in case ast of
      Hole -> keyword "???" selected
      Literal l -> lit l selected
      Variable v -> id v selected
      Binary op args ->
        let all = intersperse (keyword op false) $ mapWithIndex (\i a -> renderSub (show i) cursor a) args
        in node "binary" selected all
      Let bs v ->
        let value = renderSub "value" cursor v
            joiner = if length bs > 1 then newline else text ""
            bindings = mapWithIndex (\idx (LetBinding name e) -> [
              id name false,
              keyword "=" false,
              indent [render ((unwrapCursor (show idx) >>> unwrapCursor "value") cursor) e],
              joiner]) bs
            bindings' = concat bindings
        in node "let" selected [
          keyword "let" false,
          indent bindings',
          keyword "in" false,
          indent [value]]
      Lambda args v ->
        let value = renderSub "value" cursor v
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
            fn' = parenthesiseFn fn $ renderSub "fn" cursor fn
            args' = mapWithIndex (\idx a -> parenthesiseArg a $ renderSub (show idx) cursor a) args
            isMultiline = any (\a -> ifBlock a true false) args'
        in node "apply" selected $
          if isMultiline then
            fn' <> map indent args'
          else
            fn' <> concat args'
      Pattern arg cases ->
        let arg' = render cursor arg
            cases' = mapWithIndex (\idx (PatternCase m e) -> [case m of
                PatternAny -> id "_" false
                PatternLiteral l -> text (htmlEscape $ showLiteral l),
              keyword "→" false,
              indent [render ((unwrapCursor (show idx) >>> unwrapCursor "value") cursor) e],
              newline]) cases
        in node "pattern" selected $
          [keyword "case" false, indent [arg']] <> concat cases' <> [newline]

renderSub :: String -> Maybe Cursor -> Expr -> ReactElement
renderSub unwrapper c ast = render (unwrapCursor unwrapper c) ast

unwrapCursor :: String -> Maybe Cursor -> Maybe Cursor
unwrapCursor unwrapper c = do
  (Cursor cursor) <- c
  h <- head cursor
  if h == unwrapper
    then Cursor <$> tail cursor
    else Nothing


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
