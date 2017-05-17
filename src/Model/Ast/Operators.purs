module Model.Ast.Operators (
  wrapApplyFn, wrapApplyTo
) where

import Model.Ast
import Data.Array (snoc)

wrapApplyFn :: Expr -> Expr
wrapApplyFn e = case e of
  Apply fn args -> Apply fn (args `snoc` Hole)
  _ -> Apply e [Hole]

wrapApplyTo :: Expr -> Expr
wrapApplyTo ast = Apply Hole [ast]
