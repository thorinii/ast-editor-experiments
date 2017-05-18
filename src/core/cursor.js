import Cursor from '../Model/Cursor'

module.exports = {
  moveToAdjacentLeaf: function (ast, cursor, offset) {
    const unwrappedCursor = cursor.value0 ? cursor.value0 : null
    const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b)

    const cursors = Cursor.findCursors(ast)
    const currentIndex = cursors.findIndex(c => eq(c, unwrappedCursor))
    const nextIndex = Math.max(0, Math.min(cursors.length - 1, currentIndex + offset))
    return Cursor.aJust(cursors[nextIndex]) || Cursor.aNothing
  }
}
