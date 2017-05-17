module Model.Cursor (Cursor(..), findCursors, emptyCursor, cursorShow) where

import Model.Ast
import Data.Array (concat, mapWithIndex)
import Data.Functor (map)
import Data.Generic (class Generic, gShow)
import Data.Semigroup ((<>))
import Prelude (class Show, show, ($))

newtype Cursor = Cursor (Array String)

derive instance genericCursor :: Generic Cursor
instance showCursor :: Show Cursor where
  show = gShow

emptyCursor :: Cursor
emptyCursor = Cursor []

cursorShow :: Cursor -> String
cursorShow = show

findCursors :: Expr -> Array Cursor
findCursors ast = case ast of
  Hole -> [emptyCursor]
  Literal _ -> [emptyCursor]
  Variable _ -> [emptyCursor]

  Binary _ args ->
    concat (
      mapWithIndex
        (\idx a -> prepend (show idx) (findCursors a))
        args)

  Let bindings value ->
    let bindingMap idx (LetBinding _ e) = prepend (show idx) (prepend "value" (findCursors e))
        bindings' = concat (mapWithIndex bindingMap bindings)
        value' = prepend "value" (findCursors value)
    in bindings' <> value'

  Lambda _ value -> prepend "value" (findCursors value)

  Apply fn args ->
    let fn' = prepend "fn" (findCursors fn)
        argMap idx e = prepend (show idx) (findCursors e)
        args' = concat (mapWithIndex argMap args)
    in fn' <> args'

  Pattern arg cases ->
    let arg' = prepend "arg" (findCursors arg)
        caseMap idx (PatternCase _ e) = prepend (show idx) (prepend "value" (findCursors e))
        cases' = concat (mapWithIndex caseMap cases)
    in cases' <> arg'


prepend :: String -> Array Cursor -> Array Cursor
prepend el = map (\(Cursor c) -> Cursor $ [el] <> c)
-- TODO: use a Leaf Generator function to swap between Leaves and All
