module Model.Cursor (
  Cursor(..),
  CursorTarget(..),
  findCursors, emptyCursor, cursorShow
) where

import Model.Ast
import Data.Array (concat, mapWithIndex)
import Data.Functor (map)
import Data.Generic (class Generic, gEq)
import Data.Semigroup ((<>))
import Data.String (joinWith)
import Prelude (class Eq, class Show, show, ($))

data CursorTarget = ValueTarget | FnTarget | ArgTarget | IndexedTarget Int
derive instance genericCursorTarget :: Generic CursorTarget
instance eqCursorTarget :: Eq CursorTarget where
  eq = gEq
instance showCursorTarget :: Show CursorTarget where
  show ValueTarget = "value"
  show FnTarget = "fn"
  show ArgTarget = "arg"
  show (IndexedTarget i) = show i

newtype Cursor = Cursor (Array CursorTarget)
derive instance genericCursor :: Generic Cursor
instance eqCursor :: Eq Cursor where
  eq = gEq
instance showCursor :: Show Cursor where
  show (Cursor c) = "/" <> (joinWith "/" $ map show c)

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
        (\idx a -> prepend (IndexedTarget idx) (findCursors a))
        args)

  Let bindings value ->
    let bindingMap idx (LetBinding _ e) = prepend (IndexedTarget idx) (prepend ValueTarget (findCursors e))
        bindings' = concat (mapWithIndex bindingMap bindings)
        value' = prepend ValueTarget (findCursors value)
    in bindings' <> value'

  Lambda _ value -> prepend ValueTarget (findCursors value)

  Apply fn args ->
    let fn' = prepend FnTarget (findCursors fn)
        argMap idx e = prepend (IndexedTarget idx) (findCursors e)
        args' = concat (mapWithIndex argMap args)
    in fn' <> args'

  Pattern arg cases ->
    let arg' = prepend ArgTarget (findCursors arg)
        caseMap idx (PatternCase _ e) = prepend (IndexedTarget idx) (prepend ValueTarget (findCursors e))
        cases' = concat (mapWithIndex caseMap cases)
    in cases' <> arg'


prepend :: CursorTarget -> Array Cursor -> Array Cursor
prepend el = map (\(Cursor c) -> Cursor $ [el] <> c)
-- TODO: use a Leaf Generator function to swap between Leaves and All
