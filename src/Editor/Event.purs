module Editor.Event (Event(..)) where

import Editor.KeyMap as KeyMap
import Data.Maybe (Maybe)
import Editor.Listener (Listener)
import Model.Ast (Expr)

data Event = ImportAstEvent Expr
           | KeyEvent KeyMap.KeyBinding
           | EvaluatedEvent String (Maybe String)
           | SetListener Listener
           | AutocompleteUpdatedEvent String
