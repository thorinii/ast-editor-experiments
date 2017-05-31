module Editor.Job (
  Job(..)
) where

import Data.Generic (class Generic, gShow)
import Model.Ast (Expr)
import Prelude (class Show)

-- TODO: EvalJob will need the entire state when there's multiple toplevels
data Job = EvalJob String Expr

derive instance genericJob :: Generic Job
instance showJob :: Show Job where
  show = gShow
