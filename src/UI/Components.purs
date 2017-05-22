module UI.Components (
  ReactElement, el, text,
  pane, pane'
) where

import Prelude ((<>))

foreign import data ReactElement :: Type

foreign import el :: forall props. String -> props -> Array ReactElement -> ReactElement
foreign import text :: String -> ReactElement

type PaneType = String
type PaneTitle = String
type PaneBody = ReactElement

pane :: PaneType -> PaneTitle -> ReactElement -> ReactElement
pane type' title body =
  let className = "pane pane-" <> type'
  in el "div" {className: className} [el "h2" {} [text title], body]

pane' :: PaneType -> ReactElement -> ReactElement
pane' type' body =
  let className = "pane pane-" <> type'
  in el "div" {className: className} [body]
