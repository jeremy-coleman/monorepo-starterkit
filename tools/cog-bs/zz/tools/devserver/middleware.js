'use strict';

var path = require('path');
var resolve = path.resolve;
var stat = require('fs').statSync;
var uglify = require('terser')
var watchify = require('../browserify/watchify');
var crypto = require('crypto');
var zlib = require('zlib');
var browserifyMain = require('../browserify');
var reservedKeys = ['normalize', 'env', 'mode'];
var mode = process.env.NODE_ENV || 'development';

/* -------------------------------------------------------------------------- */
/*                                   helpers                                  */
/* -------------------------------------------------------------------------- */

function ms(val) {
  const T = {
  s: 1000,
  m: 60000,
  h: 360000,
  d: 8640000,
  w: 60480000,
  y: 3155760000
}
if (typeof val === 'string' && val.length > 0) {
    str = String(val);
    if (str.length > 100) {
        return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
        return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || 'ms').toLowerCase();
    switch (type) {
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
            return n * T.y;
        case 'weeks':
        case 'week':
        case 'w':
            return n * T.w;
        case 'days':
        case 'day':
        case 'd':
            return n * T.d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
            return n * T.h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
            return n * T.m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
            return n * T.s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
            return n;
        default:
            return undefined;
    }
  }
else if (typeof val === 'number' && isFinite(val)) {
    return  function (){
    var msAbs = Math.abs(val);
    switch(msAbs){
        case msAbs>= T.d: return Math.round(val / T.d) + 'd'
        case msAbs>= T.h: return Math.round(val / T.h) + 'h'
        case msAbs>= T.m: return Math.round(val / T.m) + 'm'
        case msAbs>= T.s: return Math.round(val / T.s) + 's'
        default: return val + 'ms'
    }
    }
}
throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
}

var settings = Object.assign(setter(), {
external: [],
ignore: [],
ignoreMissing: false,
transform: [],
insertGlobals: false,
detectGlobals: true,
standalone: false,
noParse: [],
extensions: [],
basedir: undefined,
grep: /\.js$/,
cache: false,
minify: false,
gzip: true,
debug: false,
normalize: normalize,
mode: mode
})


function env(name) {
  if (settings[name]) {
    return settings[name];
  }
  reservedKeys.push(name);
  return settings[name] = setter();
}

function setter(obj) {
  obj = obj || set;
  function set(key) {
    if (arguments.length === 2) {
      obj[key] = arguments[1];
      return this;
    } else if (typeof key === 'object') {
      Object.keys(key)
        .forEach(function (k) {
          obj[k] = key[k];
        });
      return this;
    } else {
      return obj[key];
    }
  }
  return set;
}


var production = env('production');
production.cache = true;
production.precompile = true;
production.minify = true;
production.gzip = true;
production.debug = false;


// var production = Object.assign(env('production'), {
//   cache : true,
//   precompile : true,
//   minify : true,
//   gzip : true,
//   debug : false
// })

// var development = Object.assign(env('development'), {
//   cache : 'dynamic',
//   precompile : false,
//   minify : false,
//   gzip : false,
//   debug : true
// })

var development = env('development');
development.cache = 'dynamic';
development.precompile = false;
development.minify = false;
development.gzip = false;
development.debug = true;


function normalize(options) {
  var defaults = settings[mode] || {};
  options = options || {};

  Object.keys(defaults)
    .forEach(function (key) {
      if (options[key] === null || options[key] === undefined) {
        options[key] = defaults[key];
      }
    });
  Object.keys(settings).forEach(function (key) {
      if (reservedKeys.indexOf(key) === -1 && (options[key] === null || options[key] === undefined)) {
        options[key] = settings[key];
      }
    });


  if (options.cache === 'dynamic') {
    // leave unchanged
  } else if (typeof options.cache === 'string' && ms(options.cache)) {
    options.cache = 'public, max-age=' + Math.floor(ms(options.cache)/1000);
  } else if (options.cache === true) {
    options.cache = 'public, max-age=60';
  } else if (typeof options.cache === 'number') {
    options.cache = 'public, max-age=' + Math.floor(options.cache/1000);
  } else if (typeof options.cache === 'object') {
    options.cache = (options.cache.private ? 'private' : 'public') + ', max-age='
                  + Math.floor(ms(options.cache.maxAge.toString())/1000);
  }

  options.precompile = !!options.precompile;
  options.external = arrayify(options.external);
  options.ignore = arrayify(options.ignore);
  options.transform = arrayify(options.transform);
  options.noParse = arrayify(options.noParse);
  options.extensions = arrayify(options.extensions);

  return options;
}

function arrayify(val) {
  if (val && !Array.isArray(val) && typeof val !== 'boolean') {
    return [val];
  } else {
    return val;
  }
}


/* -------------------------------------------------------------------------- */
/*                            buildBundle(compile)                            */
/* -------------------------------------------------------------------------- */
function buildBundle(path, options) {
  var bundle = browserifyMain(browserifyOptions(options));
  if (options.plugins) {
    var plugins = options.plugins; // in the format options.plugins = [{plugin: plugin, options: options}, {plugin: plugin, options: options}, ... ]
    for(var i = 0; i < plugins.length; i++) {
      var obj = plugins[i];
      bundle.plugin(obj.plugin, obj.options);
    }
  }
  if (Array.isArray(path)) {
    for (var i = 0; i < path.length; i++) {
      if (typeof path[i] === 'object') { // obj spec support; i.e. {"jquery": {options...}}
        var spec = path[i];
        var keys = Object.keys(spec);
        keys.forEach(function (key) {
          if (spec[key].run) {
            bundle.add(key, spec[key]);
          } else {
            bundle.require(key, spec[key]);
          }
        })
      } else {
        bundle.require(path[i]);
      }
    }
  } else {
    bundle.add(path);
  }
  for (var i = 0; i < (options.external || []).length; i++) {
    bundle.external(options.external[i]);
  }
  for (var i = 0; i < (options.ignore || []).length; i++) {
    bundle.ignore(options.ignore[i]);
  }
  for (var i = 0; i < (options.transform || []).length; i++) {
    var transform = options.transform[i];

    if (Array.isArray(transform)) {
      bundle.transform(transform[1], transform[0]);
    } else {
      bundle.transform(transform);
    }
  }
  return bundle;
}

function browserifyOptions(middlewareOptions) {
  var options = Object.assign({}, middlewareOptions);

  omit(options, [
    'external',
    'grep',
    'gzip',
    'ignore',
    'minify',
    'plugins',
    'postcompile',
    'postminify',
    'precompile',
    'preminify',
    'transform'
  ]);

  return Object.assign({}, options, {
    standalone: middlewareOptions.standalone || false,
    cache: middlewareOptions.cache === 'dynamic' ? {} : undefined,
    packageCache: middlewareOptions.cache === 'dynamic' ? {} : undefined
  });
}

function omit(object, properties) {
  properties.forEach(function (prop) {
    delete object[prop];
  });
}



/* -------------------------------------------------------------------------- */
/*                              prepare response                              */
/* -------------------------------------------------------------------------- */

function prepareResponse(body, headers, options) {
  if (typeof body === 'string') body = Buffer.from(body);
  if (!Buffer.isBuffer(body)) {
    return Promise.reject(new TypeError('Text must be either a buffer or a string'));
  }
  options = options || {};
  var result = new Promise(function (resolve, reject) {
    if (options.gzip === false) return resolve(null);
    zlib.gzip(body, function (err, res) {
      if (err) return reject(err);
      else return resolve(res);
    });
  }).then(function (gzippedBody) {
    if (typeof options.gzip !== 'boolean' && gzippedBody.length >= body.length) {
      options.gzip = false;
    }
    return new PreparedResponse(body,
                                options.gzip !== false ? gzippedBody : null,
                                headers,
                                options);
  });
  result.send = function (req, res, next) {
    return result.done(function (response) {
      response.send(req, res);
    }, next);
  };
  return result;
}

function PreparedResponse(body, gzippedBody, headers, options) {
  this.body = body;
  this.gzippedBody = gzippedBody;
  this.etag = md5(body);

  this.headers = Object.keys(headers || {}).map(function (header) {
    var value = headers[header];
    if (header.toLowerCase() === 'cache-control') {
      if (typeof value === 'string' && ms(value)) {
        value = 'public, max-age=' + Math.floor(ms(value) / 1000);
      } else if (typeof headers.cache === 'number') {
        value = 'public, max-age=' + Math.floor(value / 1000);
      }
    }
    if (header.toLowerCase() === 'content-type' && value.indexOf('/') === -1) {
      value = mime.getType(value);
    }
    return new Header(header, value);
  });
  this.options = options || {};
}


PreparedResponse.prototype.send = function (req, res) {
  this.headers.forEach(function (header) {
    header.set(res);
  });

  if (this.options.etag !== false) {
    //check old etag
    if (req.headers['if-none-match'] === this.etag) {
      res.statusCode = 304;
      res.end();
      return;
    }

    //add new etag
    res.setHeader('ETag', this.etag);
  }

  //add gzip
  if (this.options.gzip !== false) {
    // vary
    if (!res.getHeader('Vary')) {
      res.setHeader('Vary', 'Accept-Encoding');
    } else if (!~res.getHeader('Vary').indexOf('Accept-Encoding')) {
      res.setHeader('Vary', res.getHeader('Vary') + ', Accept-Encoding');
    }
  }
  if (this.options.gzip !== false && supportsGzip(req)) {
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Length', this.gzippedBody.length);
    if ('HEAD' === req.method) res.end();
    else res.end(this.gzippedBody);
  } else {
    res.setHeader('Content-Length', this.body.length);
    if ('HEAD' === req.method) res.end();
    else res.end(this.body);
  }
};


function Header(key, value) {
  this.key = key;
  this.value = value;
}

Header.prototype.set = function (res) {
  res.setHeader(this.key, this.value);
};

function md5(str) {
  return crypto.createHash('md5').update(str).digest("hex");
}

function supportsGzip(req) {
  return req.headers
      && req.headers['accept-encoding']
      && req.headers['accept-encoding'].indexOf('gzip') !== -1;
}
/* -------------------------------------------------------------------------- */
/*                            buildResponse (send)                            */
/* -------------------------------------------------------------------------- */

Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this;
  self.then(null, function (err) {
    setTimeout(function () {
      throw err;
    }, 0);
  });
};

function send(path, options) {
  var bundle = buildBundle(path, options);
  if (!options.cache) {
    return {
      send: function (req, res, next) {
        getResponse(bundle, options).send(req, res, next);
      },
      dispose: noop
    };
  } else if (options.cache === 'dynamic') {
    var response, resolve;
    var updatingTimeout;
    bundle = watchify(bundle, {poll: true, delay: 0});
    bundle.on('update', function () {
      if (resolve) {
        clearTimeout(updatingTimeout);
      } else {
        response = new Promise(function (_resolve) {
          resolve = _resolve;
        });
      }
      updatingTimeout = setTimeout(function rebuild() {
        resolve(getResponse(bundle, options));
        resolve = undefined;
      }, 600);
    });
    response = Promise.resolve(getResponse(bundle, options));
    return {
      send: function (req, res, next) {
        response.done((response) => { response.send(req, res, next) }, next);
      },
      dispose: function () {
        bundle.close();
      }
    };
  } else {
    return getResponse(bundle, options);
  }
}

function getResponse(bundle, options) {
  var headers = {'content-type': 'application/javascript'};
  if (options.cache && options.cache !== 'dynamic') {
    headers['cache-control'] = options.cache;
  }
  var response = getSource(bundle, options).then(function (src) {
    return prepareResponse(src, headers, {gzip: options.gzip})
  }).then(function (response) {
    return syncResponse = response;
  });
  var syncResponse;
  return {
    send: function (req, res, next) {
      if (syncResponse) return syncResponse.send(req, res);
      else return response.done(function (response) { response.send(req, res); }, next);
    },
    dispose: noop
  };
}
function getSource(bundle, options) {
  return new Promise(function (resolve, reject) {
    bundle.bundle(function (err, src) {
      if (err) return reject(err);
      resolve(src);
    });
  }).then(function (src) {
    src = src.toString();
    return options.postcompile ? options.postcompile(src) : src;
  }).then(function (src) {
    return (options.minify && options.preminify) ? options.preminify(src) : src;
  }).then(function (src) {
    if (options.minify) {
      try {
        src = minify(src, options.minify).code;
      } catch (ex) { } //better to just let the client fail to parse
    }
    return (options.minify && options.postminify) ? options.postminify(src) : src;
  });
}

function minify(str, options) {
  if (!options || typeof options !== 'object') options = {};
  const result = uglify.minify(str, options);
  if (result.error) {
    throw result.error;
  }
  return result;
}

function noop() {
}


exports = module.exports = browserify;

function browserify(path, options) {
  if (Array.isArray(path)) {
    return exports.modules(path, options);
  }
  path = resolve(path);
  options = exports.settings.normalize(options);
  options.noParse = options.noParse.map(function (path) {
    if (path[0] != '.') return path; //support `['jquery']` as well as `['./src/jquery.js']`
    return resolve(path);
  });
  if (stat(path).isDirectory()) {
    return exports.directory(path, options);
  } else {
    return exports.file(path, options);
  }
}



function modules(modules, options) {
  options = normalize(options);
  if (options.external) {
    options.external = options.external
      .filter(function (name) {
        return modules.indexOf(name) === -1;
      });
  }
  var response = send(modules, options);
  return function (req, res, next) {
    response.send(req, res, next);
  };
}


function directory(path, options) {
  options = normalize(options);
  var cache = {};
  return function (req, res, next) {
    var p = join(path, req.path);
    if (cache[p]) return cache[p].send(req, res, next);
    if (options.grep.test(req.path)) {
      fs.stat(p, function (err, stat) {
        if (err || !stat.isFile()) return next();
        cache[p] = send(p, options);
        cache[p].send(req, res, next);
      });
    } else {
      return next();
    }
  };
}

function file(path, options) {
  options = normalize(options);
  var response = send(path, options);
  return function (req, res, next) {
    response.send(req, res, next);
  };
}

exports.directory = directory
exports.file = file
exports.modules = modules
exports.settings = settings
