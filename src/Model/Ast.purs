module Model.Ast (
  LiteralValue(..),
  Expr(..),
  LetBinding(..),
  PatternMatch(..), PatternCase(..)
) where

import Data.Generic (class Generic, gShow)
import Prelude (class Show, show)

data LiteralValue = LiteralNumber Number | LiteralString String
derive instance genericLiteralValue :: Generic LiteralValue

data LetBinding = LetBinding String Expr
derive instance genericLetBinding :: Generic LetBinding

data PatternMatch = PatternLiteral LiteralValue | PatternAny
derive instance genericPatternMatch :: Generic PatternMatch

data PatternCase = PatternCase PatternMatch Expr
derive instance genericPatternCase :: Generic PatternCase

data Expr = Hole
          | Literal LiteralValue
          | Variable String
          | Lambda (Array String) Expr
          | Apply Expr (Array Expr)
          | Binary String (Array Expr)
          | Let (Array LetBinding) Expr
          | Pattern Expr (Array PatternCase)

derive instance genericExpr :: Generic Expr
instance showExpr :: Show Expr where
  show = gShow
