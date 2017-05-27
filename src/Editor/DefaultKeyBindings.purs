module Editor.DefaultKeyBindings (
  bindings
) where

import Editor.KeyMap (KeyBindingAction, bindToAction, makeAction)
import Editor.State (Action(..), AstAction(..))
import Prelude (negate, ($))

bindings :: Array (KeyBindingAction Action)
bindings = [
  bindToAction "<space>" $
    makeAction (AstAction ApplySelected)
      "Call the current expression as a function",
  bindToAction "." $
    makeAction (AstAction ApplyWithSelected)
      "Call a function with the current expression",
  bindToAction "l" $
    makeAction (AstAction WrapInLet)
      "Wrap the current expression in a let",
  bindToAction "\\" $
    makeAction (AstAction ReplaceWithLambda)
      "Replace the current expression with a lambda",

  bindToAction "<left>" $
    makeAction (CursorAction (-1))
      "Move to the previous leaf node",
  bindToAction "<right>" $
    makeAction (CursorAction 1)
      "Move to the next leaf node"
]
