module Model.Ast.Operators (
  wrapApplyFn, wrapApplyTo, wrapInLet, replaceWithLambda
) where

import Model.Ast
import Model.Cursor
import Data.Array (mapWithIndex, snoc)
import Prelude (($), (==))

wrapApplyFn :: Cursor -> Expr -> Expr
wrapApplyFn = rewriteAt $ \e -> case e of
  Apply fn args -> Apply fn (args `snoc` Hole)
  _ -> Apply e [Hole]

wrapApplyTo :: Cursor -> Expr -> Expr
wrapApplyTo = rewriteAt $ \e -> Apply Hole [e]

wrapInLet :: Cursor -> Expr -> Expr
wrapInLet = rewriteAt $ \e -> Let [LetBinding "x" Hole] e

replaceWithLambda :: Cursor -> Expr -> Expr
replaceWithLambda = rewriteAt $ \e -> Lambda ["x"] Hole



rewriteAt :: (Expr -> Expr) -> Cursor -> Expr -> Expr
rewriteAt f cursor = rewriteWithCursor (\c e -> if c == cursor then f e else e)


rewriteWithCursor :: (Cursor -> Expr -> Expr) -> Expr -> Expr
rewriteWithCursor f e = rewriteWithCursor' f emptyCursor e

rewriteWithCursor' :: (Cursor -> Expr -> Expr) -> Cursor -> Expr -> Expr
rewriteWithCursor' f c e = f c $ case e of
    Hole -> e
    Literal _ -> e
    Variable _ -> e
    Lambda args v ->
      Lambda args (go ValueTarget v)
    Apply fn args ->
      Apply
        (go FnTarget fn)
        (mapWithIndex (\i -> go (IndexedTarget i)) args)
    Binary op args ->
      Binary op $ mapWithIndex (\i -> go (IndexedTarget i)) args
    Let bindings v ->
      Let
        (mapWithIndex (\i (LetBinding n e') -> LetBinding n (go2 (IndexedTarget i) ValueTarget e')) bindings)
        (go ValueTarget v)
    Pattern arg cases ->
      Pattern
        (go ArgTarget arg)
        (mapWithIndex (\i (PatternCase p e') -> PatternCase p (go2 (IndexedTarget i) ValueTarget e')) cases)

  where go target e' = rewriteWithCursor' f (c `child` target) e'
        go2 t1 t2 e' = rewriteWithCursor' f (c `child` t1 `child` t2) e'
