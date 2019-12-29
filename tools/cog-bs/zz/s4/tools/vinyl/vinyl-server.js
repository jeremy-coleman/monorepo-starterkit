

const url = require('url')
const http = require('http')
const connect = require('connect')
const through2 = require('through2')
const pkg = require('../package')
const Asset = require('./asset')

const DEFAULT_DEBUG_PAGE_PATH = '/__vinyl__'

const action = {
  'debug-page': require('./action/debug-page'),
  'not-found': require('./action/not-found')
}

/**
 * VinylServer serves vinyl stream entries as assets in it.
 *
 * @class
 */
class VinylServer {
  /**
   * @param {Number} port The port number
   * @param {Function[]} middleware The middleware
   */
  constructor (port, middleware) {
    this.port = port
    this.middleware = middleware || []

    /**
     * @property {Object} assets The assets to serve. this dynamically changes as streams flows.
     */
    this.assets = {}
  }

  /**
   * Handler of the starting of the server
   *
   * @param {String} url The url
   * @param {String} debugUrl The debug page url
   */
  static handlerOfStarting (url, debugUrl) {
    console.log('server started at', url)
    console.log('see debug info at', debugUrl)
  }

  /**
   * Handler for the port error.
   *
   * @param {Number} port The port number
   */
  static handlerOfPortError (port) {
    console.log('The port number is already in use:', port)
  }

  /**
   * @static
   * @param {String} debugPageTitle The debug page title
   */
  static setDebugPageTitle (debugPageTitle) {
    this.debugPageTitle = debugPageTitle
  }

  /**
   * Sets (overrides) the debug page's path.
   *
   * @param {String} path The path
   */
  static setDebugPagePath (path) {
    this.debugPagePath = path
  }

  /**
   * Sets the handler of the starting of the server.
   *
   * @param {Function} handler The handler
   */
  static setHandlerOfStarting (handler) {
    this.handlerOfStarting = handler
  }

  /**
   * Sets the handler of the port error.
   *
   * @param {Function} handler The handler
   */
  static setHandlerOfPortError (handler) {
    this.handlerOfPortError = handler
  }

  /**
   * Starts the server.
   *
   * @return {Promise}
   */
  start () {
    this.app = connect()

    this.middleware.forEach(mw => this.app.use(mw()))

    this.app.use((req, res) => {
      this.handleRequest(req, res)
    })

    this.server = http.createServer(this.app)

    this.startPromise = new Promise((resolve, reject) => {
      this.server.on('error', e => {
        this.handleErrorOnListen(e)

        reject(e)
      })

      this.server.listen(this.port, () => {
        this.constructor.handlerOfStarting(
          `http://localhost:${this.server.address().port}/`,
          `http://localhost:${this.server.address().port}${
            this.constructor.debugPagePath
          }`
        )

        resolve()
      })
    })

    return this.startPromise
  }

  /**
   * Handles the request.
   * @param {http.IncomingMessage} req The request
   * @param {http.ServerResponse} res The server response
   */
  handleRequest (req, res) {
    let url = this.getUrlFromRequest(req)

    if (this.urlIsDebugPage(url)) {
      return action['debug-page'](
        this.assets,
        this.constructor.debugPageTitle,
        pkg,
        res
      )
    }

    const asset = this.getAsset(url)

    if (asset) {
      return asset.response(res)
    }

    return action['not-found'](url, pkg, res, this.constructor.debugPagePath)
  }

  urlIsDebugPage (url) {
    return url === this.constructor.debugPagePath
  }

  /**
   * Gets the asset for the url.
   * @param {string} url The url
   * @return {Asset}
   */
  getAsset (url) {
    const asset = this.assets[url]

    if (asset) {
      return asset
    }

    // Suppose url is directory
    if (!/\/$/.test(url)) {
      url += '/'
    }

    url += 'index.html'

    const indexAsset = this.assets[url]

    if (indexAsset) {
      return indexAsset
    }

    return null
  }

  /**
   * @param {http.IncomingMessage} req The reqeust
   * @return {String}
   */
  getUrlFromRequest (req) {
    return url.parse(req.url).pathname
  }

  /**
   * Hanlders the error at starting the server.
   * @param {Error} e The error
   */
  handleErrorOnListen (e) {
    if (e.code === 'EADDRINUSE') {
      this.constructor.handlerOfPortError(this.port)

      return
    }

    console.log(e.stack)
  }

  /**
   * Restarts the server.
   *
   * @return {Promise}
   */
  restart () {
    return this.stop().then(() => this.start())
  }

  /**
   * Stops the server
   *
   * @return {Promise}
   */
  stop () {
    return this.startPromise.then(() => {
      return new Promise(resolve => this.server.close(() => resolve()))
    })
  }

  /**
   * Gets the writable stream. When you write the vinyl object to this stream then it's going to be served as the contents of the corresponding path.
   * @return {stream.Writable}
   */
  getStreamProcessor () {
    return through2.obj((vinyl, enc, callback) => {
      const asset = new Asset(vinyl)

      asset
        .on('ready', buffer => {
          /* TODO: do something */
        })
        .on('error', e => {
          console.log(e.stack) /* TODO: make logger configurable */
        })

      this.assets[asset.getUrl()] = asset

      callback()
    })
  }
}

VinylServer.setDebugPageTitle('Welcome to <i>' + pkg.name + '</i> debug page!')
VinylServer.setDebugPagePath(DEFAULT_DEBUG_PAGE_PATH)


const DEFAULT_PORT = 7000

/**
 * @property {Object<VinylServer>} servers The server instances
 */
const servers = {}
const middleware = []

const normalizePort = port => {
  if (typeof port === 'number') {
    return port
  }

  if (typeof port === 'undefined') {
    return DEFAULT_PORT
  }

  throw new Error(`illegal port number: ${port}`)
}

/**
 * @param {Number} port The port number
 */
const createServer = port => {
  const server = new VinylServer(port, middleware)
  server.start()

  return server
}

/**
 * Initializes the server and returns the stream processor.
 * @param {Number} port The port number
 */
const main = port => {
  port = normalizePort(port)

  servers[port] = servers[port] || createServer(port)

  return servers[port].getStreamProcessor()
}

/**
 * Restarts the server.
 *
 * @param {Number} port The port number
 * @return {Promise}
 */
const restart = port => {
  port = normalizePort(port)

  if (!servers[port]) {
    throw new Error(`no server at port="${port}"`)
  }

  return servers[port].restart()
}

/**
 * Stops the server.
 * @param {Number} port The port number
 * @return {Promise}
 */
const stop = port => {
  port = normalizePort(port)

  if (!servers[port]) {
    throw new Error(`no server at port="${port}"`)
  }

  return servers[port].stop()
}

/**
 * Gets the server instance for the port number. (mainly for test purpose)
 *
 * @param {Number} port The port number
 * @return {VinylServer}
 */
const getInstance = port => servers[normalizePort(port)]

/**
 * Returns a promise which resolves when the server on the given port is ready.
 * @return {Promise}
 */
const isServerReady = port => {
  const instance = getInstance(port)

  if (instance) {
    return instance.startPromise
  }
}

/**
 * Sets the debug page's title.
 * @param {string} title The title of the debug page
 */
const setDebugPageTitle = title => VinylServer.setDebugPageTitle(title)

/**
 * Sets the debug page's path.
 * @param {string} path The path of the debug page
 */
const setDebugPagePath = path => VinylServer.setDebugPagePath(path)

const setHandlerOfPortError = handler =>
  VinylServer.setHandlerOfPortError(handler)

const setHandlerOfStarting = handler =>
  VinylServer.setHandlerOfStarting(handler)

const addMiddleware = mw => {
  middleware.push(mw)
}

module.exports = {
  addMiddleware,
  setHandlerOfStarting,
  setHandlerOfPortError,
  setDebugPagePath,
  setDebugPageTitle,
  isServerReady,
  main,
  getInstance,
}