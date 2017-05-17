import Cursor from '../Cursor'

module.exports = {
  moveToAdjacentLeaf: function (ast, cursor, offset) {
    const cursors = Cursor.findCursors(ast)
    const currentIndex = cursors.findIndex(c => JSON.stringify(c) === JSON.stringify(cursor))
    const nextIndex = Math.max(0, Math.min(cursors.length - 1, currentIndex + offset))
    return cursors[nextIndex] || []
  }
}
