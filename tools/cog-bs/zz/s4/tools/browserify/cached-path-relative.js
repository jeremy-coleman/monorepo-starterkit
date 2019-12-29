
var path = require('path')


var relative = path.relative
var lastCwd = process.cwd()
var pathCache = Object.create(null)


module.exports.cachedPathRelative = cachedPathRelative
module.exports = cachedPathRelative

/* -------------------------------------------------------------------------- */
/*                            cached path relative                            */
/* -------------------------------------------------------------------------- */

function cachedPathRelative (from, to) {
  // If the current working directory changes, we need
  // to invalidate the cache
  var cwd = process.cwd()
  if (cwd !== lastCwd) {
    pathCache = {}
    lastCwd = cwd
  }

  if (pathCache[from] && pathCache[from][to]) return pathCache[from][to]

  var result = relative.call(path, from, to)

  pathCache[from] = pathCache[from] || {}
  pathCache[from][to] = result

  return result

}
