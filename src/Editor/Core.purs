module Editor.Core (initialState) where

import Model.Ast as Ast
import Data.Maybe (Maybe(..))

initialState jobQueue = {
  code: {
    main: Ast.Hole
  },
  cursor: {
    name: "main",
    path: Nothing
  },
  jobQueue: jobQueue,
  cache: {}
}
