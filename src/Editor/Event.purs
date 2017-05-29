module Editor.Event (Event(..)) where

import Editor.KeyMap as KeyMap
import Editor.State as State
import Editor.Listener (Listener)
import Model.Ast (Expr)

data Event = ImportAstEvent Expr
           | KeyEvent KeyMap.KeyBinding
           | JobUpdateEvent
           | UpdateCacheEvent String String State.JobResult
           | SetListener Listener
