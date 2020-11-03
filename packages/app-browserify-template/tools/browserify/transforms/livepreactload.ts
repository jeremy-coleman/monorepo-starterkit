import { resolve } from "path"
import { through } from '../streams'
import { Server } from "../devserver/ws"
import clc from 'kleur'


function log(msg, ...data) {
  const t = /T([0-9:.]+)Z/g.exec(new Date().toISOString())[1]
  console.log(clc.green(`[${t}] ReactHMR`)+"::"+clc.cyan(msg))
  data.forEach(d => console.log(clc.yellow("  >"), clc.yellow(d)))
}

function logError(error) {
  if (error) {
    log(error)
  }
}

export function startServer({port}) {

var wss = new Server({port});
  log(`[HMR]:Listening@port:${port}`)

  const server = {
    notifyReload(metadata) {
      log("Notify clients about bundle change")

      wss.clients.forEach((client) => {
        client.send(JSON.stringify({
          type: "change",
          data: metadata
        }), logError)
      })
    },

    notifyBundleError(error) {
      log("Notify clients about bundle error")

      wss.clients.forEach((client) => {
        client.send(JSON.stringify({
          type: "bundle_error",
          data: { error: error.toString() }
        }), logError)
      })
    }
  }

  wss.on("connection", (client) => {
    log("New client connected")
  })

  return server
}

function LiveReactloadPlugin(b, opts: any = {}) {
  const {
    port = 4474,
    host = null,
    client = true,
    dedupe = true,
    debug = false,
    } = opts

  // server is alive as long as watchify is running
  const server = startServer({port: Number(port)})

  let clientRequires = [];

  // try {
  //   const RHLPatchModule = 'react-hot-loader';
  //   require.resolve(RHLPatchModule)
  //   clientRequires.push(RHLPatchModule)
  // } catch (e) {}

  const clientOpts = {
    nodeModulesRoot: resolve(process.cwd(), "node_modules"),
    port: Number(port),
    host: host,
    clientEnabled: client,
    debug: debug,
    clientRequires: clientRequires
  }

  clientRequires.forEach(file => b.require(file, opts))

  b.on("reset", addHooks)
  addHooks()

  function addHooks() {
    var mappings = {}
    var pathById = {}
    var pathByIdx = {}
    var entries = []

    const idToPath = id =>
      pathById[id] || String(id) || throws("Full path not found for id: " + id)

    const idxToPath = idx =>
      pathByIdx[idx] || String(idx) || throws("Full path not found for index: " + idx)


    b.pipeline.on("error", server.notifyBundleError)
    

    b.pipeline.get("record").push(through.obj((row, enc, next) => {
        next(null, row)
      }
    ))

    b.pipeline.get("sort").push(through.obj((row, enc, next) => {
        const {id, index, file} = row
        pathById[id] = file
        pathByIdx[index] = file
        next(null, row)
      }
    ))

  b.pipeline.splice("dedupe", 0, through.obj((row, enc, next) => {
          const cloned = Object.assign({}, row)
          if (row.dedupeIndex) {
            cloned.dedupeIndex = idxToPath(row.dedupeIndex)
          }
          if (row.dedupe) {
            cloned.dedupe = idToPath(row.dedupe)
          }
          next(null, cloned)
        }
      )) 

    b.pipeline.get("label").push(
      through.obj((row, enc, next) => {
          const { id, file, source, deps, entry } = row;

          if (entry) {entries.push(file)}
          
          mappings[file] = [
            source,
            deps,
            {
              id: file,
              hash: getHash(source),
              browserifyId: id,
              sourcemap: ""
            }
          ];
          next(null, row);
        },
        function flush(next) {
          next();
        }
      )
    );

    b.pipeline.get("wrap").push(through.obj((row, enc, next) => {
        next(null)
      },
      function flush(next) {
        //@ts-ignore - absurd sry
        const pathById = Object.fromEntries(Object.entries(mappings).map(([file, [s, d, {browserifyId: id}]]) => [id, file]))
        const idToPath = id => pathById[id] || String(id);

          const depsToPaths = (deps) => {
            let obj = {}
            for (let [k, v] of Object.entries(deps)) {
              obj[k] = idToPath(v)
            }
            return obj
          }

 
      const withFixedDepsIds = mapValues(mappings, ([src, deps, meta]) => {
        return [src, depsToPaths(deps), meta]
      })
      

        const args = [
          withFixedDepsIds,
          entries,
          clientOpts
        ]
        let bundleSrc =
          `(${loader.toString()})(${args.map(a => JSON.stringify(a, null, 2)).join(", ")});`
        


        this.push(Buffer.from(bundleSrc, "utf8"))

        server.notifyReload(withFixedDepsIds)
        
        next()
      }
    ))
  }

  function throws(msg) {
    throw new Error(msg)
  }
}


/* -------------------------------------------------------------------------- */
/*                                   loader                                   */
/* -------------------------------------------------------------------------- */


export function loader(mappings, entryPoints, options) {
  const {
    host = "localhost",
    protocol = "ws",
    port = 3000,
  } = options

  if (entryPoints.length > 1) {
    throw new Error("[HOT]Please use only one entry point")
  }

  var entryId = entryPoints[0];

  var scope = {
    mappings: mappings,
    cache: {},
    reloadHooks: {}
  };

  function startClient() {

    var ws = new WebSocket(`ws://localhost:${port}`);

    ws.onopen = () => {
      info("[HMR]:Listening for changes")
    };

    ws.onmessage = (m) => {
      var msg = JSON.parse(m.data);
      switch(msg.type){
        case "change": handleBundleChange(msg.data);
        break;
        case "bundle_error": handleBundleError(msg.data);
        break;
        default: return void(0)
      }
    }

  }

  function compile(mapping) {
    var body = mapping[0];
    if (typeof body !== "function") {
      mapping[0] = eval(`((require, module, exports) => {${body}})`)
      mapping[2].source = body;
    }
  }

  // returns module from cache or the source then caches it
  function load(id, recur?) {
    var mappings = scope.mappings;
    var cache = scope.cache;
    
    if (!cache[id]) {
      if (!mappings[id]) {
        var req = typeof require == "function" && require;
        if (req) return req(id);
        var error = new Error("Cannot find module '" + id + "'");
        error["code"] = "MODULE_NOT_FOUND";
        throw error;
      }

      var module = cache[id] = {
        exports: {},
        hot: {
          onUpdate: (maybe, hook) => {
            scope.reloadHooks[id] = hook || maybe
          }
        }
      };

      //(require, module, exports) => body
      const _moduleRequire = (path) => {
        var targetId = mappings[id][1][path];
        return load(targetId ? targetId : path);
      }

      mappings[id][0].call(module.exports, _moduleRequire, module, module.exports);

    }
    return cache[id].exports;
  }


  /**
   * Patches the existing modules with new sources and returns a list of changes
   * (module id and old mapping. ATTENTION: This function does not do any reloading yet.
   */
  function patch(mappings) {
    var changes = [];

    Object.keys(mappings).forEach((id) => {
      var old = scope.mappings[id];
      var mapping = mappings[id];
      var meta = mapping[2];

      if (!old || old[2].hash !== meta.hash) {
        compile(mapping);
        scope.mappings[id] = mapping;
        changes.push([id, old]);
      }
      
    });

    return changes;
  }

  /** Reloads modules based on the given changes or tries to restore previous code.
    @param changes Changes array received from "patch" function */
  function reload(changes) {
    var changedModules = changes.map((c) =>c[0])
    var newMods = changes.filter((c) => !c[1]).map((c) =>  c[0])

    // Promise.resolve(evaluate(entryId, {}))
    //   .catch(e => {
    //     restore();
    //     evaluate(entryId, {})
    //   })

    try {
      info("Applying changes...");
      debug("Changed modules", changedModules);
      debug("New modules", newMods);
      evaluate(entryId, {});
      info("Reload complete!");
    } 
    catch (e) {
      error("Error occurred while reloading changes. Restoring old implementation...");
      console.error(e);
      console.error(e.stack);
      try {
        restore();
        evaluate(entryId, {})
        info("Restored!");
      } 
      catch (re) {
        error("Restore failed. You may need to refresh your browser");
        console.error(re);
        console.error(re.stack);
      }
    }

    function evaluate(id, changeCache) {

      if (id in changeCache) {
        debug("Circular dependency detected for module", id, "not traversing any further");
        return changeCache[id];
      }
      if (isExternalModule(id)) {
        debug("Module", id, "is an external module. Do not reload");
        return false;
      }

      var meChanged = contains(changedModules, id);
      changeCache[id] = meChanged;

      var originalCache = scope.cache[id];

      //idk about this
      if (id in scope.cache) {
        delete scope.cache[id];
      }

      var deps = vals(scope.mappings[id][1]).filter(isLocalModule);
      var depsChanged = deps.map((dep) => evaluate(dep, changeCache))

      var isReloaded = originalCache !== undefined && id in scope.cache;

      var depChanged = any(depsChanged);

      if (isReloaded || depChanged || meChanged) {
        debug("Module changed", id, isReloaded, depChanged, meChanged);
        
        if (!isReloaded) {
          var hook = scope.reloadHooks[id];

          if (typeof hook === "function" && hook()) {
            console.log(" > Manually accepted", id);
            scope.cache[id] = originalCache;
            changeCache[id] = false;
          } 
          else {
            contains(newMods, id)
              ? console.log(" > New module::",id)
              : console.log(" > Reloading::",id)
            load(id);
            changeCache[id] = true;
          }
        } 
        else {
          console.log(" > Already reloaded ::", id);
        }
        return changeCache[id];
      } 
      
      else {
        // restore old version of the module
        if (originalCache !== undefined) {
          scope.cache[id] = originalCache;
        }
        return false;
      }
    }

    function restore() {
      changes.forEach(function (c) {
        var id = c[0], mapping = c[1];
        if (mapping) {
          debug("Restore old mapping", id);
          scope.mappings[id] = mapping;
        } 
        else {
          debug("Delete new mapping", id);
          delete scope.mappings[id];
        }
      })
    }

  }

  function handleBundleChange(newMappings) {
    info("Bundle changed");
    var changes = patch(newMappings);
    if (changes.length > 0) {
      reload(changes);
    } 
    else {
      info("Nothing to reload");
    }
  }

  function handleBundleError(data) {
    error("Bundling error occurred");
    error(data.error);
  }


  // prepare mappings before starting the app
  forEachValue(scope.mappings, compile);

  debug("Options:", options);
  debug("Entries:", entryPoints, entryId);

  startClient();

  if (options.clientRequires && options.clientRequires.length) {
    options.clientRequires.forEach(load);
  }
  // standalone bundles may need the exports from entry module
  return load(entryId);

  function isLocalModule(id) {
    return id.indexOf(options.nodeModulesRoot) === -1
  }

  function isExternalModule(id) {
    return !(id in scope.mappings);
  }

  function keys(obj) {
    return obj ? Object.keys(obj) : [];
  }

  function vals(obj) {
    return keys(obj).map(function (key) {
      return obj[key];
    });
  }

  function contains(col, val) {
    for (var i = 0; i < col.length; i++) {
      if (col[i] === val) return true;
    }
    return false;
  }


  function any(col, f?) {
    if (!f) {
      f = function (x) {
        return x;
      };
    }
    for (var i = 0; i < col.length; i++) {
      if (f(col[i])) return true;
    }
    return false;
  }

  function forEachValue(obj, fn) {
    keys(obj).forEach((key) => {
      if (obj.hasOwnProperty(key)) {
        fn(obj[key]);
      }
    });
  }



function debug(...args) {
    if (options.debug) {
      console.log.apply(console, ["LiveReactload [DEBUG] ::"].concat(Array.prototype.slice.call(arguments)));
    }
  }

  function info(msg) {
    console.info("LiveReactload ::", msg);
  }

  function warn(msg) {
    console.warn("LiveReactload ::", msg);
  }

  function error(msg) {
    console.error("LiveReactload ::", msg);
  }
}



function mapValues(object, iteratee) {
  var result = {};
  Object.entries(object).forEach(([key, value]) => {
    return (result[key] = iteratee(value, key, object));
  });
  return result;
}

//murmurhash2_32_gc
function getHash(str) {
  var l = str.length,
    h = l ^ l,
    i = 0,
    k

  while (l >= 4) {
    k =
      (str.charCodeAt(i) & 0xff) |
      ((str.charCodeAt(++i) & 0xff) << 8) |
      ((str.charCodeAt(++i) & 0xff) << 16) |
      ((str.charCodeAt(++i) & 0xff) << 24)

    k = (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16)
    k ^= k >>> 24
    k = (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16)

    h =
      ((h & 0xffff) * 0x5bd1e995 +
        ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^
      k

    l -= 4
    ++i
  }

  switch (l) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & 0xff) << 16
    case 2:
      h ^= (str.charCodeAt(i + 1) & 0xff) << 8
    case 1:
      h ^= str.charCodeAt(i) & 0xff
      h =
        (h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)
  }

  h ^= h >>> 13
  h = (h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)
  h ^= h >>> 15

  return (h >>> 0).toString(36)
}




const createHmrServerPlugin = () => LiveReactloadPlugin
export { createHmrServerPlugin as LiveReactloadPlugin }





type FileMapping = [
  any,
  any,
{
  id: string,
  hash: string,
  browserifyId: number,
  sourcemap: string | null | undefined
}
]




//module.exports = LiveReactloadPlugin


  //import crc from "crc"
//import leftPad from 'left-pad'
  // function getHash1(data) {
  //   const crcHash = leftPad(crc.crc32(data).toString(16), 8, "0")
  //   return Buffer.from(crcHash, "hex")
  //       .toString("base64")
  //       .replace(/=/g,"")
  // }

//if (!old || old[2].hash !== meta.hash) {

  //console.log(scope.mappings);
  //console.log(old);
  // scope.reloadHooks[id] = function() {
  //   let m = keys(scope.cache[id].exports)
  //   let __PSELF__ = scope.mappings[id];
  //   //@ts-ignore
  //   for (let i in m) self.__PREFRESH__.replaceComponent(__PSELF__[i], m[i])
  //   //for (let i in m) replaceComponent(__PSELF__[i], m[i])
  // }
  // let __PSELF__ = scope.mappings[id]
  // let m = keys(scope.cache[id].exports)
  // for (let i in m) self.__PREFRESH__.replaceComponent(__PSELF__[i], m[i])
  // for (let i in _m) console.log(_m[i] , __PSELF__[i])
  

  // console.log(keys(scope.cache[id].exports))
  // console.log(scope.mappings[id][2].source)
  // console.log(old)

  // switch(dedupe) {
  //   case true: {
  //     b.pipeline.splice("dedupe", 0, through.obj(
  //       function transform(row, enc, next) {
  //         const cloned = _.extend({}, row)
  //         if (row.dedupeIndex) {
  //           cloned.dedupeIndex = idxToPath(row.dedupeIndex)
  //         }
  //         if (row.dedupe) {
  //           cloned.dedupe = idToPath(row.dedupe)
  //         }
  //         next(null, cloned)
  //       }
  //     ))
  //   }
  //   break;
  //   case false: {
  //     b.pipeline.splice("dedupe", 1, through.obj())
  //     if (b.pipeline.get("dedupe")) {
  //       log("Other plugins have added de-duplicate transformations. --no-dedupe is not effective")
  //     }
  //   }
  // }


  // b.pipeline.get("label").push(through.obj(
  //   function transform(row, enc, next) {
  //     const {id, file, source, deps, entry} = row
  //     const converter = convert.fromSource(source)
  //     let sourceWithoutMaps = source
  //     let adjustedSourcemap = ''
  //     let hash;

  //     if (converter) {
  //       const sources = converter.getProperty("sources") || [];
  //       sourceWithoutMaps = convert.removeComments(source)
  //       hash = getHash(sourceWithoutMaps)
  //       converter.setProperty("sources", sources.map(source => source += "?version=" + hash))
  //       adjustedSourcemap = convert.fromObject(offsetSourceMaps(converter.toObject(), 1)).toComment()
  //     } 
  //     else {
  //       hash = getHash(source)
  //     }
  //     if (entry) {
  //       entries.push(file)
  //     }
  //     mappings[file] = [sourceWithoutMaps, deps, {id: file, hash: hash, browserifyId: id, sourcemap: adjustedSourcemap}]
  //     next(null, row)
  //   },
  //   function flush(next) {
  //     next()
  //   }
  // ))