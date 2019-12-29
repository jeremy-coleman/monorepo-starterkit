var url = require("url")
var zlib = require('zlib')
var url = require('url');
var assert = require('assert');
var STATUS_CODES = require('http').STATUS_CODES;

var hasOwnProperty = Object.prototype.hasOwnProperty;
var isWordBoundary = /[_.-](\w|$)/g;

var extend = (...v) => Object.assign({}, ...v);

function extend1(target, source) {
    for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
            target[key] = source[key]
        }
    }
}

function camelCase(str) {
    return str.replace(isWordBoundary, upperCase);
}

function upperCase(_, x) {
    return x.toUpperCase();
}

function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

/* -------------------------------------------------------------------------- */
/*                                   router                                   */
/* -------------------------------------------------------------------------- */

var localRoutes = [];


/**
 * Convert path to route object
 *
 * A string or RegExp should be passed,
 * will return { re, src, keys} obj
 *
 * @param  {String / RegExp} path
 * @return {Object}
 */

var Route = function(path){
  //using 'new' is optional

  var src, re, keys = [];

  if(path instanceof RegExp){
    re = path;
    src = path.toString();
  }else{
    re = pathToRegExp(path, keys);
    src = path;
  }

  return {
  	 re: re,
  	 src: path.toString(),
  	 keys: keys
  }
};

/**
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {String} path
 * @param  {Array} keys
 * @return {RegExp}
 */
var pathToRegExp = function (path, keys) {
	path = path
		.concat('/?')
		.replace(/\/\(/g, '(?:/')
		.replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?|\*/g, function(_, slash, format, key, capture, optional){
			if (_ === "*"){
				keys.push(undefined);
				return _;
			}

			keys.push(key);
			slash = slash || '';
			return ''
				+ (optional ? '' : slash)
				+ '(?:'
				+ (optional ? slash : '')
				+ (format || '') + (capture || '([^/]+?)') + ')'
				+ (optional || '');
		})
		.replace(/([\/.])/g, '\\$1')
		.replace(/\*/g, '(.*)');
	return new RegExp('^' + path + '$', 'i');
};

/**
 * Attempt to match the given request to
 * one of the routes. When successful
 * a  {fn, params, splats} obj is returned
 *
 * @param  {Array} routes
 * @param  {String} uri
 * @return {Object}
 */
var match = function (routes, uri, startAt) {
	var captures, i = startAt || 0;

	for (var len = routes.length; i < len; ++i) {
		var route = routes[i],
		    re = route.re,
		    keys = route.keys,
		    splats = [],
		    params = {};

		if (captures = uri.match(re)) {
			for (var j = 1, len = captures.length; j < len; ++j) {
				var key = keys[j-1],
					val = typeof captures[j] === 'string'
						? unescape(captures[j])
						: captures[j];
				if (key) {
					params[key] = val;
				} else {
					splats.push(val);
				}
			}
			return {
				params: params,
				splats: splats,
				route: route.src,
				next: i + 1
			};
		}
	}
};

/**
 * Default "normal" router constructor.
 * accepts path, fn tuples via addRoute
 * returns {fn, params, splats, route}
 *  via match
 *
 * @return {Object}
 */

var RoutesRouter = function(){
  //using 'new' is optional
  return {
    routes: [],
    routeMap : {},
    addRoute: function(path, fn){
      if (!path) throw new Error(' route requires a path');
      if (!fn) throw new Error(' route ' + path.toString() + ' requires a callback');

      if (this.routeMap[path]) {
        throw new Error('path is already defined: ' + path);
      }

      var route = Route(path);
      route.fn = fn;

      this.routes.push(route);
      this.routeMap[path] = fn;
    },

    removeRoute: function(path) {
      if (!path) throw new Error(' route requires a path');
      if (!this.routeMap[path]) {
        throw new Error('path does not exist: ' + path);
      }

      var match;
      var newRoutes = [];

      // copy the routes excluding the route being removed
      for (var i = 0; i < this.routes.length; i++) {
        var route = this.routes[i];
        if (route.src !== path) {
          newRoutes.push(route);
        }
      }
      this.routes = newRoutes;
      delete this.routeMap[path];
    },

    match: function(pathname, startAt){
      var route = match(this.routes, pathname, startAt);
      if(route){
        route.fn = this.routeMap[route.route];
        route.next = this.match.bind(this, pathname, route.next)
      }
      return route;
    }
  }
};

RoutesRouter.Route = Route
RoutesRouter.pathToRegExp = pathToRegExp
RoutesRouter.match = match

/* -------------------------------------------------------------------------- */
/*                               string-template                              */
/* -------------------------------------------------------------------------- */

var nargs = /\{([0-9a-zA-Z_]+)\}/g

function template(string) {
    var args

    if (arguments.length === 2 && typeof arguments[1] === "object") {
        args = arguments[1]
    } else {
        args = new Array(arguments.length - 1)
        for (var i = 1; i < arguments.length; ++i) {
            args[i - 1] = arguments[i]
        }
    }

    if (!args || !args.hasOwnProperty) {
        args = {}
    }

    return string.replace(nargs, function replaceArg(match, i, index) {
        var result

        if (string[index - 1] === "{" &&
            string[index + match.length] === "}") {
            return i
        } else {
            result = args.hasOwnProperty(i) ? args[i] : null
            if (result === null || result === undefined) {
                return ""
            }

            return result
        }
    })
}
/* -------------------------------------------------------------------------- */
/*                                 typed-error                                */
/* -------------------------------------------------------------------------- */



var FUNCTION_FIELD_WHITELIST = Object.getOwnPropertyNames(TypedError)

function TypedError(args) {
    assert(args, 'TypedError: must specify options');
    assert(args.type, 'TypedError: must specify options.type');
    assert(args.message, 'TypedError: must specify options.message');

    assert(!has(args, 'fullType'),
        'TypedError: fullType field is reserved');

    var message = args.message;
    var funcName = args.name
    if (!funcName) {
        var errorName = camelCase(args.type) + 'Error';
        funcName = errorName[0].toUpperCase() + errorName.substr(1);
    }

    var copyArgs = {}
    extend(copyArgs, args)
    for (var i = 0; i < FUNCTION_FIELD_WHITELIST.length; i++) {
        delete copyArgs[FUNCTION_FIELD_WHITELIST[i]]
    }

    extend(createError, copyArgs);
    createError._name = funcName;

    return createError;

    function createError(opts) {
        var result = new Error();

        Object.defineProperty(result, 'type', {
            value: result.type,
            enumerable: true,
            writable: true,
            configurable: true
        });

        var options = {}
        extend(options, args)
        extend(options, opts)
        if (!options.fullType) {
            options.fullType = options.type;
        }

        result.name = funcName
        extend(result, options);
        if (opts && opts.message) {
            result.message = template(opts.message, options);
        } else if (message) {
            result.message = template(message, options);
        }

        return result;
    }
}



/* -------------------------------------------------------------------------- */
/*                                  send-data                                 */
/* -------------------------------------------------------------------------- */


function acceptsGzip(req) {
    var isGzip = /\bgzip\b/
    var acceptEncoding = req.headers['accept-encoding'] || ''
    return !!acceptEncoding.match(isGzip)
}

function send(req, res, opts, callback) {
    var headers = opts.headers || {}
    var statusCode = opts.statusCode || null
    var body = typeof opts === 'object' ? opts.body : opts
    var gzip = opts.gzip || false

    body = Buffer.isBuffer(body) ? body : Buffer.from(body || '')
    headers = headers || {}

    res.statusCode = statusCode || res.statusCode

    Object.keys(headers).forEach(function (header) {
        res.setHeader(header, headers[header])
    })

    if (gzip && acceptsGzip(req)) {
        if (!callback) {
            throw new Error('send(req, res, opts, callback). Callback is required')
        }

        zlib.gzip(body, function (err, body) {
            if (err) {
                return callback(err)
            }

            res.once('finish', callback)

            res.setHeader('content-encoding', 'gzip')
            res.setHeader('content-length', body.length)
            res.end(body)
        })
    } else {
        if (callback) {
            res.once('finish', callback)
        }

        res.setHeader('content-length', body.length)
        res.end(body)
    }
}


function isSendObject(object) {
    return object &&
        (typeof object.statusCode === 'number' ||
        (typeof object.headers === 'object' && object.headers !== null));
}

function sendJson(req, res, opts, callback) {
    if (!isSendObject(opts)) {
        opts = { body: opts }
    } else {
        opts = extend(opts);
    }

    if (opts.pretty) {
        opts.space = '    '
    }

    var tuple = safeStringify(opts.body,
        opts.replacer || null, opts.space || '');

    if (tuple[0]) {
        return callback(tuple[0]);
    }

    opts.headers = extend(opts.headers, {
        'content-type': 'application/json'
    });
    opts.body = tuple[1];

    send(req, res, opts, callback)
}

function safeStringify(obj, replace, space) {
    var json;
    var error = null;

    try {
        json = JSON.stringify(obj, replace, space);
    } catch (e) {
        error = e;
    }

    return [error, json];
}




function sendError(req, res, opts, callback) {
    assert(opts && opts.body, 'opts.body is required');

    var err = opts.body;
    var logger = opts.logger;
    var statsd = opts.statsd;
    var verbose = opts.verbose;

    var errOpts = {
        verbose: typeof verbose === 'boolean' ? verbose : true,
        serializeStack: opts.serializeStack,
        bodyStatusCode: opts.bodyStatusCode,
        additionalParams: opts.additionalParams,
        err: err
    };

    var statsPrefix = opts.statsPrefix || 'clients.send-data';
    var parsedUrl = url.parse(req.url);
    var statsdKey = statsPrefix + '.error-handler';

    var isExpected = err.expected ||
        (err.statusCode >= 400 && err.statusCode <= 499);

    if (!isExpected) {
        if (logger) {
            logger.error('unexpected error', err);
        }
        if (statsd) {
            statsd.increment(statsdKey + '.unexpected');
        }
    } else if (statsd) {
        statsd.increment(statsdKey + '.expected');
    }
    writeError(req, res, errOpts, callback);
}

function writeError(req, res, opts, callback) {
    var err = opts.err;
    var statusCode = err.statusCode || 500;
    var body = {
        message: err.message || STATUS_CODES[statusCode] ||
            STATUS_CODES[500]
    };

    if (typeof err.type === 'string') {
        body.type = err.type;
    }

    if (Array.isArray(err.messages)) {
        body.messages = err.messages;
    }

    // Toggle sending status code in the body
    if (opts.bodyStatusCode !== false) {
        body.statusCode = statusCode;
    }

    if (opts.verbose) {
        body.expected = err.expected;
        body.debug = err.debug;
    }

    if (opts.serializeStack) {
        body.stack = err.stack;
    }

    // Append additional params
    if (opts.additionalParams) {
        opts.additionalParams.forEach(function appendKey(k) {
            body[k] = err[k];
        });
    }

    sendJson(req, res, {
        statusCode: statusCode,
        body: body
    }, callback);
}


/* -------------------------------------------------------------------------- */
/*                                 unused atm                                 */
/* -------------------------------------------------------------------------- */

function sendPlain(req, res, opts, callback) {
    if (typeof opts === 'string' || Buffer.isBuffer(opts)) {
        opts = { body: opts }
    } else {
        opts = extend(opts);
    }

    opts.headers = extend(opts.headers, {
        'content-type': 'text/plain; charset=utf-8'
    });

    send(req, res, opts, callback)
}

function sendJavascript(req, res, opts, callback) {
    if (typeof opts === "string" || Buffer.isBuffer(opts)) {
        opts = { body: opts }
    } else {
        opts = extend(opts);
    }

    opts.headers = extend(opts.headers, {"content-type": "text/javascript"});

    send(req, res, opts, callback)
}


function sendHtml(req, res, opts, callback) {
    if (typeof opts === 'string' || Buffer.isBuffer(opts)) {
        opts = { body: opts }
    } else {
        opts = extend(opts);
    }

    opts.headers = extend(opts.headers, {
        'content-type': 'text/html'
    });

    send(req, res, opts, callback);
}

function sendCss(req, res, opts, callback) {
    if (typeof opts === 'string' || Buffer.isBuffer(opts)) {
        opts = { body: opts }
    } else {
        opts = extend(opts);
    }

    opts.headers = extend(opts.headers, {
        'content-type': 'text/css'
    });

    send(req, res, opts, callback)
}


function createDefaultHandler(opts) {
    var notFound = opts.notFound || defaultNotFound
    var errorHandler = opts.errorHandler || defaultErrorHandler

    return defaultHandler

    function defaultHandler(req, res, err) {
        if (err) {
            if (err.statusCode === 404) {
                return notFound(req, res, err)
            } else if (err.statusCode === 405) {
                return methodNotAllowed(req, res, err)
            }
            errorHandler(req, res, err)
        }
    }
}

function defaultErrorHandler(req, res, err) {
    sendError(req, res, {
        body: err,
        statusCode: err.statusCode || 500
    })
}

function defaultNotFound(req, res) {
    res.statusCode = 404
    res.end("404 Not Found")
}

function methodNotAllowed(req, res, err) {
    res.statusCode = err.statusCode
    res.end(err.message)
}

function methods(methods) {
  if (methods === null || typeof methods !== 'object') {throw new Error('methods must be an object');}

  function notFound(req, res, opts, cb) {
    var err = new Error('405 Method Not Allowed');
    err.statusCode = 405;
    return cb(err);
  }

  return function methodRequestHandler(req, res, opts, cb) {
      if (typeof cb !== 'function') {throw new Error('callback required');}

      var method = req.method;
      var f = methods[method] || notFound 

      return f.apply(this, arguments);
  };
}



var NotFound = TypedError({
    statusCode: 404,
    message: "resource not found {url}",
    notFound: true
})

function Router(opts) {
    if (!(this instanceof Router)) {
        return new Router(opts)
    }

    opts = opts || {};

    this.defaultHandler = createDefaultHandler(opts)
    var router = this.router = RoutesRouter()
    this.routes = router.routes
    this.routeMap = router.routeMap
    this.match = router.match.bind(router)
}

Router.prototype.addRoute = function addRoute(uri, fn) {
    if (typeof fn === "object") {
        fn = methods(fn)
    }

    var msg;
    if (this.router.routeMap[uri]) {
        msg = 'routes-router: Cannot add route, route already ' +
            'exists.\n' +
            'You\'ve called `router.addRoute("' + uri + '")` ' +
            'twice.\n'
        throw new Error(msg)
    }

    this.router.addRoute(uri, fn)
}

Router.prototype.removeRoute = function removeRoute(uri) {
    this.router.removeRoute(uri);
}

Router.prototype.prefix = function prefix(uri, fn) {
    var msg;
    if (typeof uri !== 'string') {
        msg = 'routes-router: must call ' +
            '`router.prefix("/some-prefix", fn)`'
        throw new Error(msg)
    }

    if (uri[uri.length - 1] === '/' && uri.length > 1) {
        msg = 'routes-router: ' +
            '`routes.prefix("/some-prefix/", fn)` is ' +
            'invalid.\n' +
            'Passing a trailing slash does not work.\n';
        throw new Error(msg)
    }

    if (uri[0] !== '/') {
        msg = 'routes-router: ' +
            '`routes.prefix("some-prefix", fn)` is ' +
            'invalid.\n' +
            'Must start "some-prefix" with a leading slash.\n'
        throw new Error(msg)
    }

    var pattern = uri === "/" ? "/*?" : uri + "/*?";

    if (typeof fn === "object") {
        fn = methods(fn)
    }

    this.addRoute(uri, normalizeSplatsFromUri);
    this.addRoute(pattern, normalizeSplatsFromPattern);

    function normalizeSplatsFromUri(req, res, opts) {
        var last = opts.splats.length ?
            opts.splats.length - 1 : 0;
        if (opts.splats[last] === undefined) {
            opts.splats[last] = "/";
        }
        fn.apply(this, arguments);
    }

    function normalizeSplatsFromPattern(req, res, opts) {
        var last = opts.splats.length ?
            opts.splats.length - 1 : 0;
        if (typeof opts.splats[last] === "string") {
            opts.splats[last] = "/" + opts.splats[last];
        }
        fn.apply(this, arguments);
    }
}

Router.prototype.handleRequest =
    function handleRequest(req, res, opts, callback) {
        if (typeof opts === "function") {
            callback = opts
            opts = null
        }

        opts = opts || {};
        callback = callback ||
            this.defaultHandler.bind(null, req, res)

        var pathname

        opts.params = opts.params || {}
        opts.splats = opts.splats || []

        var uri

        if (opts.splats && opts.splats.length) {
            pathname = opts.splats.pop();
        } else {
            uri = url.parse(req.url);
            pathname = uri.pathname;
        }

        var route = this.router.match(pathname);

        if (!route) {
            return callback(NotFound({
                url: req.url
            }))
        }

        var params = extend(opts, {
            params: extend(opts.params, route.params),
            splats: opts.splats.concat(route.splats)
        })

        if (uri) {
            params.parsedUrl = uri;
        }

        if (typeof opts.preHandleHook === 'function') {
            var reqOpts = {
                route: route,
                params: params,
                opts: opts
            };
            opts.preHandleHook({
                req: req,
                reqOpts: reqOpts
            });
            route.fn(req, res, params, callback);
        } else {
            route.fn(req, res, params, callback);
        }
    }

createRouter.Router = Router



function createRouter(opts) {
    var router = Router(opts)

    var handleRequest = router.handleRequest.bind(router)
    return Object.assign(handleRequest, router, {
        addRoute: router.addRoute,
        removeRoute: router.removeRoute,
        prefix: router.prefix,
        handleRequest: router.handleRequest
    })
}

module.exports = createRouter