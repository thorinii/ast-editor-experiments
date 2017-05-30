module Editor.Job (
  Job(..)
) where

import Model.Ast (Expr)
import Prelude (class Show, (<>))

data Job = EvalJob String Expr

instance showJob :: Show Job where
  show (EvalJob name _) = "Eval(" <> name <> ")"
