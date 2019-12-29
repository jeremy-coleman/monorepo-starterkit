'use strict';

var path = require('path');
var cproc = require('child_process');
const {EventEmitter} = require('events');
var crypto = require('crypto');
var fs = require('fs');
var promisify = require('util').promisify
var readFile = promisify(fs.readFile)
var readline = require('readline');

var _ = require('lodash');

const {through} = require('../streamz')
const {convert} = require('../../esutil/combine-source-map.js');
const {SourceMapGenerator , SourceNode , SourceMapConsumer } = require('../../esutil/source-map.js')



const syncQueues = new WeakMap();
function noop() {}
function rethrow(e) {
  throw e;
}
function synchd(scopeKey, fn) {
  const waitOn = syncQueues.get(scopeKey) || Promise.resolve();
  const p = waitOn.then(fn);

  // The Promise stored in the WeakMap shouldn't contain a value.
  syncQueues.set(scopeKey, p.then(noop, noop));

  // An error handler was added above which would prevent the runtime from
  // possibly detecting an uncaught rejection, so we set up a re-throwing
  // error handler which it's up to the caller to attach an error handler to
  // or not.
  return p.catch(rethrow);
}

function synchdFn(scopeKey, fn) {
  return (function() {
    return synchd(scopeKey, () => {
      return fn.apply(this, arguments);
    });
  });
}

function has(object, propName) {
  return Object.prototype.hasOwnProperty.call(object, propName);
}

function defer () {
  const resolver = {}
  resolver.promise = new Promise((resolve, reject) => {
    Object.assign(resolver, {
      resolve,
      reject,
      fulfill: resolve
    })
  })
  return resolver
}

function hashStr(str) {
  var hasher = crypto.createHash('sha256');
  hasher.update(str);
  return hasher.digest('base64').slice(0, 20);
}

var readManagerTemplate = _.once(() => readFile(path.join(__dirname, 'hmr-manager-template.js'), 'utf8'));
var validUpdateModes = ['websocket', 'ajax', 'fs', 'none'];
var updateModesNeedingUrl = ['ajax'];


function makeIdentitySourceMap(content, resourcePath) {
  var map = new SourceMapGenerator();
  map.setSourceContent(resourcePath, content);
  content.split('\n').map(function(line, index) {
    map.addMapping({
      source: resourcePath,
      original: {
        line: index+1,
        column: 0
      },
      generated: {
        line: index+1,
        column: 0
      }
    });
  });
  return map.toJSON();
}

function readOpt(opts, long, short, defval) {
  return has(opts, long) ? opts[long] : (short && has(opts, short)) ? opts[short] : defval;
}

function boolOpt(value) {
  return Boolean(value && value !== 'false');
}

module.exports = function(bundle, opts) {
  if (!opts) opts = {};
  var updateMode = readOpt(opts, 'mode', 'm', 'websocket');

  if (updateMode === 'xhr') {
    console.warn('Use update mode "ajax" instead of "xhr".');
    updateMode = 'ajax';
  }

  var updateUrl = readOpt(opts, 'url', 'u', null);
  var port = readOpt(opts, 'port', 'p', 3123);
  var hostname = readOpt(opts, 'hostname', 'h', 'localhost');
  var updateCacheBust = boolOpt(readOpt(opts, 'cacheBust', 'b', false));
  var bundleKey = readOpt(opts, 'key', 'k', updateMode+':'+updateUrl);
  var cert = readOpt(opts, 'tlscert', 'C', null);
  var key = readOpt(opts, 'tlskey', 'K', null);
  var tlsoptions = opts.tlsoptions;
  var supportModes = (opts.supportModes && opts.supportModes._) || opts.supportModes || [];
  var noServe = boolOpt(readOpt(opts, 'noServe', null, false));
  var ignoreUnaccepted = boolOpt(readOpt(opts, 'ignoreUnaccepted', null, true));

  var basedir = opts.basedir !== undefined ? opts.basedir : process.cwd();

  var em = new EventEmitter();

  supportModes = _.uniq(['none', updateMode].concat(supportModes));

  supportModes.forEach((updateMode) => {
    if (!_.includes(validUpdateModes, updateMode)) {
      throw new Error("Invalid mode "+updateMode);
    }
  });

  if (!updateUrl && _.includes(updateModesNeedingUrl, updateMode)) {
    throw new Error("url option must be specified for "+updateMode+" mode");
  }

  var incPath = './'+path.relative(basedir, require.resolve('./inc.js'));

  var sioPath = null;

  if (_.includes(supportModes, 'websocket')) {
    sioPath = './'+path.relative(basedir, require.resolve('socket.io-client'));
  }

  var useLocalSocketServer = !noServe && _.includes(supportModes, 'websocket');

  var server;
  var serverCommLock = {};
  var nextServerConfirm = defer();

  function sendToServer(data) {
    return new Promise((resolve, reject) => {
      server.stdio[3].write(JSON.stringify(data), (err) => {
        if (err) return reject(err);
        server.stdio[3].write('\n', (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });
  }

  var runServer = _.once(function runServer() {
    // Start a new process with an extra socket opened to it.
    // See https://github.com/nodejs/node-v0.x-archive/issues/5727 for a
    // description. It's faster than using `process.send`.
    server = cproc.spawn(
      process.argv[0],
      [__dirname+'/socket-server.js'],
      { stdio: ['inherit','inherit','inherit','pipe'] }
    );
    var childReadline = readline.createInterface({
      input: server.stdio[3],
      output: process.stdout,
      terminal: false
    });
    childReadline.on('line',(line) => {
      var msg = JSON.parse(line);
      if (msg.type === 'confirmNewModuleData') {
        nextServerConfirm.resolve();
        nextServerConfirm = defer();
      } else {
        console.warn('[HMR builder] Unknown message type from server:', msg.type);
      }
    });
    server.stdio[3].on('finish', () => {
      em.emit('error', new Error("Browserify-HMR lost connection to socket server"));
    });

    return new Promise((resolve, reject) => {
      var readJobs = [];
      if (cert) {
        readJobs.push(readFile(cert, 'utf8').then((data) => {
          tlsoptions = tlsoptions || {};
          tlsoptions.cert = data;
        }));
      }
      if (key) {
        readJobs.push(readFile(key, 'utf8').then((data) => {
          tlsoptions = tlsoptions || {};
          tlsoptions.key = data;
        }));
      }
      if (readJobs.length) {
        resolve(Promise.all(readJobs));
      } 
      else {
        resolve();
      }
    }).then(() => sendToServer({
        type: 'config',
        hostname: hostname,
        port: port,
        tlsoptions: tlsoptions
      })
    )
  });

  var currentModuleData = {};

  function setNewModuleData(moduleData) {
    if (!useLocalSocketServer) {
      return Promise.resolve();
    }
    return runServer().then(() => {
      var newModuleData = _.chain(moduleData)
        .toPairs()
        .filter((pair) => pair[1].isNew)
        .map((pair) => {
          return [pair[0], {
            index: pair[1].index,
            hash: pair[1].hash,
            source: pair[1].source,
            parents: pair[1].parents,
            deps: pair[1].deps
          }];
        })
        .fromPairs()
        .value();
      var removedModules = _.chain(currentModuleData)
        .keys()
        .filter((name) =>!has(moduleData, name))
        .value();
      currentModuleData = moduleData;

      // This following block talking to the server should execute serially,
      // never concurrently.
      return synchd(serverCommLock, () => {
        // Don't send all of the module data over at once, send it piece by
        // piece. The socket server won't apply the changes until it gets the
        // type:"removedModules" message.
        return Object.keys(newModuleData).reduce((promise, name) => {
          return promise.then(() => {
            return sendToServer({
              type: 'newModule',
              name: name,
              data: newModuleData[name]
            });
          });
        }, Promise.resolve()).then(() => {
          return sendToServer({
            type: 'removedModules',
            removedModules: removedModules
          });
        });
      }).then(() =>  {
        // Waiting for the response doesn't need to be in the exclusive section.
        return nextServerConfirm.promise
      });
    });
  }

  function fileKey(filename) {
    return path.relative(basedir, filename);
  }

  var hmrManagerFilename;

  // keys are filenames, values are {hash, transformedSource}
  var transformCache = {};

  function setupPipelineMods() {
    var originalEntries = [];
    bundle.pipeline.get('record').push(through.obj(function(row, enc, next) {
      if (row.entry) {
        originalEntries.push(row.file);
        next(null);
      } else {
        next(null, row);
      }
    }, function(next) {
      var source = [sioPath, incPath].filter(Boolean).concat(originalEntries).map(function(name) {
        return 'require('+JSON.stringify(name)+');\n';
      }).join('');

      // Put the hmr file name in basedir to prevent this:
      // https://github.com/babel/babelify/issues/85
      hmrManagerFilename = path.join(basedir, '__hmr_manager.js');
      this.push({
        entry: true,
        expose: false,
        basedir: undefined,
        file: hmrManagerFilename,
        id: hmrManagerFilename,
        source: source,
        order: 0
      });
      next();
    }));

    var moduleMeta = {};

    function makeModuleMetaEntry(name) {
      if (!has(moduleMeta, name)) {
        moduleMeta[name] = {
          index: null,
          hash: null,
          parents: []
        };
      }
    }

    bundle.pipeline.get('deps').push(through.obj(function(row, enc, next) {
      if (row.file !== hmrManagerFilename) {
        makeModuleMetaEntry(fileKey(row.file));
        _.forOwn(row.deps, function(name, ref) {
          // dependencies that aren't included in the bundle have the name false
          if (name) {
            makeModuleMetaEntry(fileKey(name));
            moduleMeta[fileKey(name)].parents.push(fileKey(row.file));
          }
        });
      }
      next(null, row);
    }));

    var moduleData = {};
    var newTransformCache = {};
    var managerRow = null;
    var rowBuffer = [];

    if (bundle.pipeline.get('dedupe').length > 1) {
      console.warn("[HMR] Warning: other plugins have added dedupe transforms. This may interfere.");
    }
    // Disable dedupe transforms because it screws with our change tracking.
    bundle.pipeline.splice('dedupe', 1, through.obj());

    bundle.pipeline.get('label').push(through.obj(function(row, enc, next) {
      if (row.file === hmrManagerFilename) {
        managerRow = row;
        next(null);
      } 
      else {
        // row.id used when fullPaths flag is used
        moduleMeta[fileKey(row.file)].index = has(row, 'index') ? row.index : row.id;

        var hash = moduleMeta[fileKey(row.file)].hash = hashStr(row.source);
        var originalSource = row.source;
        var isNew, thunk;
        if (has(transformCache, row.file) && transformCache[row.file].hash === hash) {
          isNew = false;
          row.source = transformCache[row.file].transformedSource;
          newTransformCache[row.file] = transformCache[row.file];
          thunk = _.constant(row);
        } 
        else {
          isNew = true;
          thunk = function() {
  
            var header = '_hmr['+JSON.stringify(bundleKey)+
              '].initModule('+JSON.stringify(fileKey(row.file))+', module);\n(function(){\n';
            
            var footer = '\n}).apply(this, arguments);\n';


            var inputMapCV = convert.fromSource(row.source);

            var inputMap;

            if (inputMapCV) {
              inputMap = inputMapCV.toObject();
              row.source = convert.removeComments(row.source);
            } 
            else {
              inputMap = makeIdentitySourceMap(row.source, path.relative(basedir, row.file));
            }

            var node = new SourceNode(null, null, null, [
              new SourceNode(null, null, null, header),
              SourceNode.fromStringWithSourceMap(row.source, new SourceMapConsumer(inputMap)),
              new SourceNode(null, null, null, footer)
            ]);

            var result = node.toStringWithSourceMap();
            row.source = result.code + convert.fromObject(result.map.toJSON()).toComment();

            newTransformCache[row.file] = {
              hash: hash,
              transformedSource: row.source
            };
            return row;
          };
        }

        if (useLocalSocketServer) {
          moduleData[fileKey(row.file)] = {
            isNew: isNew,
            index: moduleMeta[fileKey(row.file)].index,
            hash: hash,
            source: originalSource,
            parents: moduleMeta[fileKey(row.file)].parents,
            deps: row.indexDeps || row.deps
          };

          // Buffer everything so we can get the websocket stuff done sooner
          // without being slowed down by the final bundling.
          rowBuffer.push(thunk);
          next(null);
        } 
        else {
          next(null, thunk());
        }
      }
    }, function(done) {
      var self = this;

      transformCache = newTransformCache;
      setNewModuleData(moduleData)
        .then(() => readManagerTemplate())
        .then((mgrTemplate)=> {
          rowBuffer.forEach((thunk) => {
            self.push(thunk());
        });

        // const {template} = require('./t2')
        
        // console.log('modulemeta', moduleMeta)
        // console.log('oe', originalEntries)
        // console.log('up', updateUrl)
        // console.log('s', supportModes)
        // console.log('ig', ignoreUnaccepted)
        // console.log('upd-cache-bust', updateCacheBust)
        // console.log('bkey', bundleKey)

        // managerRow.source = template({
        //   moduleMeta: JSON.stringify(moduleMeta),
        //   originalEntries: JSON.stringify(originalEntries),
        //   updateUrl: JSON.stringify(updateUrl),
        //   updateMode: JSON.stringify(updateMode),
        //   supportModes: JSON.stringify(supportModes),
        //   ignoreUnaccepted: JSON.stringify(ignoreUnaccepted),
        //   updateCacheBust: JSON.stringify(updateCacheBust),
        //   bundleKey: JSON.stringify(bundleKey),
        //   sioPath: require.resolve("socket.io-client/lib/index.js"), //JSON.stringify(sioPath),
        //   incPath: __dirname + "/inc/index.js"
        // })

        managerRow.source = mgrTemplate
          .replace('null/*!^^moduleMeta*/', _.constant(JSON.stringify(moduleMeta)))
          .replace('null/*!^^originalEntries*/', _.constant(JSON.stringify(originalEntries)))
          .replace('null/*!^^updateUrl*/', _.constant(JSON.stringify(updateUrl)))
          .replace('null/*!^^updateMode*/', _.constant(JSON.stringify(updateMode)))
          .replace('null/*!^^supportModes*/', _.constant(JSON.stringify(supportModes)))
          .replace('null/*!^^ignoreUnaccepted*/', _.constant(JSON.stringify(ignoreUnaccepted)))
          .replace('null/*!^^updateCacheBust*/', _.constant(JSON.stringify(updateCacheBust)))
          .replace('null/*!^^bundleKey*/', _.constant(JSON.stringify(bundleKey)))
          .replace('null/*!^^sioPath*/', _.constant(JSON.stringify(sioPath)))
          .replace('null/*!^^incPath*/', _.constant(JSON.stringify(incPath)));

        self.push(managerRow);
      }).then(done, done);
    }));
  }

  setupPipelineMods();

  bundle.on('reset', setupPipelineMods);

  return em;

};
