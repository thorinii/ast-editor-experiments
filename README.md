# Experimental AST editors

See this project live at https://thorinii.github.io/ast-editor-experiments/.


## Aim

* An editor
  * For Haskell-like languages
    * Particularly Purescript
  * That works the syntax tree
* Should have efficient controls, but can have a learning curve
* Awesome autocomplete
  * Make use of the awesome type system
  * The type system checking shouldn't get in the way of making multi-step edits
* Stores everything in a database without regard for files
  * Modules, yes. Files, no
  * Toplevel declarations don't have an order
* Tests can be spatially located close to the code
  * Automatically run when things change


## Usage

There is no usage yet.


## TODO

* Don't swallow Ctrl-R
* Use JS handler to render the AST
  * Add cursor rendering
  * Use React pure components?
* Use Require.js
  * Split into React components
* Render a keymap chart
  * Based on the actual keybinding table
* Immutable state & dispatch/reducer system
* Asynchronous compilation
* Better one-line rendering support (use complexity or approximate length)
* More rolling up of nested things (in the core AST as well)
  * Lambda
  * Apply
  * Remove 'let' replace with 'let+' renamed
* More intelligent parenthesis
* Array/object literals (use a helper method)
* Keyboard command binding (use proper key-binding system)
* Implement more commands
  * Variable
  * Literals
* Database/serialisation
  * Use LevelDB (https://github.com/Level/level) with encoding=json
* Use AST functions to execute commands
  * An abstract Editor Hooks function
* Mouse


## Thoughts

* The editor should use Vim-like commands (avoid Enter)
  * Modes
    * Normal
    * Replace (I doubt this is a mode. Or if it is, then Identifier/Literal editing is a mode as well)
  * ‘c’ on a node to replace it
    * L Let
    * A Apply
    * \ or / Lambda
    * V Variable
    * L Literal
    * P Pattern
    * It’s possible some of these are the same thing via autocomplete
* Eg ‘c<space|tab>’ then enter
* ‘let’ Let
* ‘case’ Pattern
* ‘\’ Lambda
* Variable
* Literal
* If the current node is a variable or literal then Autocomplete will be prefilled
  * ‘<space>’ on an expression node wraps it in an Apply (or appends/inserts a new apply)
  * ‘\’ or ‘/’ on a hole makes a lambda
  * Other non-conflicting letters to begin on a hole?
  * ‘w’ Wraps. deletes a node, lets you replace it with something, then inserts it into the first hole
    * Should this be programmable functionality?
    * Yank, Change (wait), Paste(latest)
  * ‘d’ to delete a node into a tmp buffer (replaces it with a hole)
    * Yank, Replace(hole)
  * ‘D’ as ‘d’ but without yanking
    * Replace(hole)
  * ‘y’ to copy a node into a tmp buffer
    * Yank
  * ‘p’ take the latest yank and replace the current node it (if the current node is not a hole, yank it first)
    * tmp = latest, Yank, Replace(tmp)
  * ‘P’ as ‘p’, but don’t keep the current node
    * Replace(latest)
  * ‘u’ undo
  * Inserting a node with holes in it selects the first hole
    * Tab switches between holes in Normal/Replace mode
  * Nodes have class (TopLevelBinding | Expression | Identifier | Let variable | Pattern case | Pattern case expression | …)
    * Expression has type (Let | Apply | …)
    * Identifier is eg ‘let <identifier> = …’ or ‘\ <identifier> -> …’
    * Nodes can only be places in where their classes match
  * Provision to insert and move nodes in ‘list-like’ things
    * Let variable
    * Pattern case
    * ‘<space>’ with a such a node selected to insert
    * ‘<shift + up | down>’ to move
* The editor should be programmable
  * Shortcuts definable in the language
  * A reset shortcut in case of breakage
* Keyboard
  * Invisible input listening for commands
  * For autocomplete a text field appears in an appropriate place (in the node tree)
  * For random text input a text field appears in a control pane
* Mouse
  * Click on node to make it current
* Undo
  * Has an undo/redo stack per AST
  * Editor state doesn’t get undone
  * I want to undo several things on a single AST regardless of other AST edits
* React (shouldn’t need Redux)
  * Use flat data format
  * Lookup expressions by an arbitrary ID
* Be able to embed an editor for a particular node class anywhere
* For debug/repair a broken situation can dump an AST to Javascript builder tree, then back again

* The editor event handlers should be separate, coming together through pipelines to make actions for the main state updater to reduce.
  * The low-level command executor
  * Macro commands
  * Undo/redo recording
  * Keyboard command processing
* ' ' on an expression to call it as a function
* '.' on an expression to call a function with it

* Use require.js modules to construct the editor
  * Use an anonymous require in the HTML to instantiate everything
  * defines for everything else
* Nope, use webpack
* Try require.js first. It works on dead servers. Webpack is compatible with it.
* Eventually we’ll need a Node.js backing so Webpack can come alive then

* Wrap in modules
* Don’t use the AST function to render
  * Quicker development with just JS. And most of the rest of the editor is JS
  * We don’t have a way to save yet
  * Rewrite PP.toHtml function to take a cursor
    * Use React functional components
    * Use keyed let/binary/pattern/etc things
  * Instead develop against an AST that makes a value (and render the value)
* Add support for multiple top-levels
* Collect all documentation in a document like the README
* Use Object.freeze when we get to immutability
