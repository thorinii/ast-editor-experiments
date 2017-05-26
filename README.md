# Experimental AST editors

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
* Possibly usable on a phone-sized/touch-based device
* Simple debugger

### Anti-goals

It shouldn't be:

* Really slow, locking up at small things and taking ages to type-check/compile/test
* Heavily mouse driven
* Hard to remember or find keyboard shortcuts
* Hard to find code
* Hard to read code
* Hard to find documentation for code (libraries and project code)
* Hard to see dependencies between things
* Hard to use/add/control libraries
* Painful or annoying to write tests
* In your way when doing non-type-preserving edits


## Usage

There is no usage yet.


## Milestones

1. An expression editor
  * Enter expressions (literals, variables, lambdas, applies, binaries, lets, and patterns)
  * Modify expressions
  * Evaluate on the fly and render the result


## TODO

* Begin rewriting in Purescript <--- very important for code sanity
  * keymap
  * default-keymap-config
  * Job Executor
  * task-compile
  * task-test
  * Use a signal to trigger the event loop
    * Event loop has type `StateT EditorState Eff a`
    * Outer signaller uses purescript-signal channels to publish events
      * foldP (\ev state -> runStateM state (... ev))
    * State changers tend to have `forall m a. MonadState EditorState m => m a`.
  * most things in state should be hashable
  * Split Jobs and cached functions; cache should be separate to state
    * Jobs shouldn't care about sources and targets
      * They are `Aff (...) Transformers.Action` with Exceptions
    * compile task is as if a constantly run function
      * code[key] -> compiled[key]
    * test task the same
      * compiled[key] -> testResults[key]
    * cached by the infrastructure with hashes
    * job queue works behind the scenes
  * Where should JobExecutor and KeyMap etc state go?
  * selectors
  * keymap-chart
  * editor-render
  * editor-ui
* Implement more commands
  * Implement literal entry/variable picker asap aka the autocomplete popup
  * All expression types
    * Add an autocomplete popup with <key>c</key>
      * For literals, variables
      * let 'let', lambda '\', pattern 'case'
* More rolling up of nested things (in the core AST as well)
  * Lambda
  * Apply
  * Remove 'let' replace with 'let+' renamed
* Database/serialisation
  * Websocket to the NodeJS server
  * Use LevelDB (https://github.com/Level/level) with encoding=json
  * https://webpack.js.org/guides/get-started/
  * https://webpack.js.org/guides/development/#webpack-dev-middleware
  * http://www.pauleveritt.org/articles/pylyglot/webpack/
  * http://jamesknelson.com/using-es6-in-the-browser-with-babel-6-and-webpack/
  * Offload compilation and testing
* Implement more cursor motions
  * Hole navigation (tab)
  * Widening/shrinking
* Support multiple top-levels
* Array/object literals
* Fix editor pane layout/wrapping etc. Either fix the flexbox or use something else.
* Better one-line rendering support (use complexity or approximate length)
  * Also render `let` and `where` with variables starting on the same line
* Keyboard command binding (use proper key-binding system)
* Attach comments to any node
* Switch to a Purescript AST
* Use AST functions to execute commands
  * An abstract Editor Hooks function
* Mouse
* Use a consistent colour scheme
* Add running tests
  * QuickCheck/PSUnit
  * "table check" - a table of input/output values
    * A function for the table
    * Input + expected output for each row
* Add types
* 2D spatial code grid
* Mobile interface
  * So offload as much work as possible to server
* Try using a CSS pre-processor with variables


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
* Render a 3D dependency diagram
* When we have types, have three modes
  * no checking
  * warning
  * forbid breaking changes
    * requires type checking synchronously in the change and vetoing it
* Need to have some core engine code running on both server and client (ie type checker, AST tools).
* Implement a fancy circular tool switcher thing using keyboard shortcuts (ctrl-space or something)
  * refactoring
  * create/delete top-levels/tests/watches/etc
  * use ':' for the magic popup picker
* show documentation
* show dependencies/dependents
* toplevels have aliased-externals
  * corresponding to imports
  * eg "in this toplevel, `Just` refers to `Data.Maybe.Just`"
* "typeof <selected>" command
* ":" action picker
  * key commands must be stable
  * refactorings: rename, extract, inline
* ast contexts: expression, pattern case, let binding, toplevel, type
* toplevels: binding, eval (expr with Show OR Renderable), test, type class
* think about how it could actually be used
  * ie how could you write the editor in the editor
  * launched from cli
  * continuously building to a bundle.js or something
* Debugger
  * Can't pause the execution (without browser support)
  * Can record things as they happen
