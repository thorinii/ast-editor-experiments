module InitialAst (main) where

import Model.Ast (Expr(..), LetBinding(..), LiteralValue(..))

main :: Expr
main = Let [LetBinding "test" (Literal (LiteralString "Hello"))]
           (Binary "+" [Variable "test",
                        Literal (LiteralString " world")])
