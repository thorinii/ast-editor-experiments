module Ast.Operators (
  wrapApplyFn, wrapApplyTo
) where

import Ast

wrapApplyFn :: Expr -> Expr
wrapApplyFn ast = Apply ast [Hole]

wrapApplyTo :: Expr -> Expr
wrapApplyTo ast = Apply Hole [ast]
