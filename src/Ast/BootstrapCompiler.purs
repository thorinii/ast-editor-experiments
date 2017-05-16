module Ast.BootstrapCompiler (translate) where

import Ast
import Data.Foldable (foldl, foldr)
import Data.String (joinWith)
import Prelude (map, show, ($), (<>), (==))

translate :: Expr -> String
translate ast = case ast of
  Hole -> "undefined"
  Literal l -> stringify l
  Variable v -> v
  Binary op args -> joinWith op $ map translateP args
  Apply fn args ->
    foldl
      (\acc arg -> "(" <> acc <> ")(" <> translate arg <> ")")
      (translate fn)
      args
  Lambda args value ->
    foldr
      (\arg acc -> "function(" <> arg <> "){return " <> acc <> "}")
      (translate value)
      args
  Let bindings value ->
    let block = foldr
                  (\(LetBinding v e) acc -> "var " <> v <> " = " <> translate e <> ";" <> acc)
                  ("return " <> translate value)
                  bindings
    in "(function(){" <> block <> "})()"
  Pattern arg cases ->
    let block = foldr
                  (\(PatternCase m e) acc ->
                     let condition = case m of
                           PatternAny -> "true"
                           PatternLiteral l -> "_$m === " <> stringify l
                     in if condition == "true" then translateP(e)
                        else condition <> " ? " <> translateP(e) <> " : " <> acc)
                  ("_$throw(new Error('Unmatched case: ' + JSON.stringify(_$m)))")
                  cases
    in "(function(_$m){return " <> block <> "})(" <> translate arg <> ")"


translateP :: Expr -> String
translateP ast = case ast of
  Lambda _ _ -> "(" <> translate ast <> ")"
  Binary _ _ -> "(" <> translate ast <> ")"
  _ -> translate ast

stringify :: LiteralValue -> String
stringify (LiteralNumber n) = show n
stringify (LiteralString s) = "\"" <> s <> "\""
