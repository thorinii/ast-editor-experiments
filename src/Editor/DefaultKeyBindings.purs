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
    makeAction (AstAction WrapInLambda)
      "Wrap the current expression in a lambda",
  bindToAction "p" $
    makeAction (AstAction WrapInPattern)
      "Wrap the current expression in a pattern",
  bindToAction "+" $
    makeAction (AstAction (WrapInBinary "+"))
      "Wrap the current expression in a binary +",
  bindToAction "-" $
    makeAction (AstAction (WrapInBinary "-"))
      "Wrap the current expression in a binary -",

  bindToAction "<left>" $
    makeAction (CursorAction (-1))
      "Move to the previous leaf node",
  bindToAction "<right>" $
    makeAction (CursorAction 1)
      "Move to the next leaf node"
]
