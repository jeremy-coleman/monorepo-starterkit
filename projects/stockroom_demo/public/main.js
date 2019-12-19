/******/ (function(modules) { // webpackBootstrap
/******/ 	function hotDisposeChunk(chunkId) {
/******/ 		delete installedChunks[chunkId];
/******/ 	}
/******/ 	var parentHotUpdateCallback = window["webpackHotUpdate"];
/******/ 	window["webpackHotUpdate"] = // eslint-disable-next-line no-unused-vars
/******/ 	function webpackHotUpdateCallback(chunkId, moreModules) {
/******/ 		hotAddUpdateChunk(chunkId, moreModules);
/******/ 		if (parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
/******/ 	} ;
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotDownloadUpdateChunk(chunkId) {
/******/ 		var script = document.createElement("script");
/******/ 		script.charset = "utf-8";
/******/ 		script.src = __webpack_require__.p + "17b3170-" + chunkId + "-wps-hmr.js";
/******/ 		if (null) script.crossOrigin = null;
/******/ 		document.head.appendChild(script);
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotDownloadManifest(requestTimeout) {
/******/ 		requestTimeout = requestTimeout || 10000;
/******/ 		return new Promise(function(resolve, reject) {
/******/ 			if (typeof XMLHttpRequest === "undefined") {
/******/ 				return reject(new Error("No browser support"));
/******/ 			}
/******/ 			try {
/******/ 				var request = new XMLHttpRequest();
/******/ 				var requestPath = __webpack_require__.p + "17b3170-wps-hmr.json";
/******/ 				request.open("GET", requestPath, true);
/******/ 				request.timeout = requestTimeout;
/******/ 				request.send(null);
/******/ 			} catch (err) {
/******/ 				return reject(err);
/******/ 			}
/******/ 			request.onreadystatechange = function() {
/******/ 				if (request.readyState !== 4) return;
/******/ 				if (request.status === 0) {
/******/ 					// timeout
/******/ 					reject(
/******/ 						new Error("Manifest request to " + requestPath + " timed out.")
/******/ 					);
/******/ 				} else if (request.status === 404) {
/******/ 					// no update available
/******/ 					resolve();
/******/ 				} else if (request.status !== 200 && request.status !== 304) {
/******/ 					// other failure
/******/ 					reject(new Error("Manifest request to " + requestPath + " failed."));
/******/ 				} else {
/******/ 					// success
/******/ 					try {
/******/ 						var update = JSON.parse(request.responseText);
/******/ 					} catch (e) {
/******/ 						reject(e);
/******/ 						return;
/******/ 					}
/******/ 					resolve(update);
/******/ 				}
/******/ 			};
/******/ 		});
/******/ 	}
/******/
/******/ 	var hotApplyOnUpdate = true;
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentHash = "e401c754bfd90e721781";
/******/ 	var hotRequestTimeout = 10000;
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentChildModule;
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentParents = [];
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentParentsTemp = [];
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotCreateRequire(moduleId) {
/******/ 		var me = installedModules[moduleId];
/******/ 		if (!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if (me.hot.active) {
/******/ 				if (installedModules[request]) {
/******/ 					if (installedModules[request].parents.indexOf(moduleId) === -1) {
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 					}
/******/ 				} else {
/******/ 					hotCurrentParents = [moduleId];
/******/ 					hotCurrentChildModule = request;
/******/ 				}
/******/ 				if (me.children.indexOf(request) === -1) {
/******/ 					me.children.push(request);
/******/ 				}
/******/ 			} else {
/******/ 				console.warn(
/******/ 					"[HMR] unexpected require(" +
/******/ 						request +
/******/ 						") from disposed module " +
/******/ 						moduleId
/******/ 				);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		var ObjectFactory = function ObjectFactory(name) {
/******/ 			return {
/******/ 				configurable: true,
/******/ 				enumerable: true,
/******/ 				get: function() {
/******/ 					return __webpack_require__[name];
/******/ 				},
/******/ 				set: function(value) {
/******/ 					__webpack_require__[name] = value;
/******/ 				}
/******/ 			};
/******/ 		};
/******/ 		for (var name in __webpack_require__) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(__webpack_require__, name) &&
/******/ 				name !== "e" &&
/******/ 				name !== "t"
/******/ 			) {
/******/ 				Object.defineProperty(fn, name, ObjectFactory(name));
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId) {
/******/ 			if (hotStatus === "ready") hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			return __webpack_require__.e(chunkId).then(finishChunkLoading, function(err) {
/******/ 				finishChunkLoading();
/******/ 				throw err;
/******/ 			});
/******/
/******/ 			function finishChunkLoading() {
/******/ 				hotChunksLoading--;
/******/ 				if (hotStatus === "prepare") {
/******/ 					if (!hotWaitingFilesMap[chunkId]) {
/******/ 						hotEnsureUpdateChunk(chunkId);
/******/ 					}
/******/ 					if (hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 						hotUpdateDownloaded();
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		fn.t = function(value, mode) {
/******/ 			if (mode & 1) value = fn(value);
/******/ 			return __webpack_require__.t(value, mode & ~1);
/******/ 		};
/******/ 		return fn;
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotCreateModule(moduleId) {
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 			_main: hotCurrentChildModule !== moduleId,
/******/
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if (dep === undefined) hot._selfAccepted = true;
/******/ 				else if (typeof dep === "function") hot._selfAccepted = dep;
/******/ 				else if (typeof dep === "object")
/******/ 					for (var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback || function() {};
/******/ 				else hot._acceptedDependencies[dep] = callback || function() {};
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if (dep === undefined) hot._selfDeclined = true;
/******/ 				else if (typeof dep === "object")
/******/ 					for (var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 				else hot._declinedDependencies[dep] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if (!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if (idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		hotCurrentChildModule = undefined;
/******/ 		return hot;
/******/ 	}
/******/
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for (var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailableFilesMap = {};
/******/ 	var hotDeferred;
/******/
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = +id + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/
/******/ 	function hotCheck(apply) {
/******/ 		if (hotStatus !== "idle") {
/******/ 			throw new Error("check() is only allowed in idle status");
/******/ 		}
/******/ 		hotApplyOnUpdate = apply;
/******/ 		hotSetStatus("check");
/******/ 		return hotDownloadManifest(hotRequestTimeout).then(function(update) {
/******/ 			if (!update) {
/******/ 				hotSetStatus("idle");
/******/ 				return null;
/******/ 			}
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			hotAvailableFilesMap = update.c;
/******/ 			hotUpdateNewHash = update.h;
/******/
/******/ 			hotSetStatus("prepare");
/******/ 			var promise = new Promise(function(resolve, reject) {
/******/ 				hotDeferred = {
/******/ 					resolve: resolve,
/******/ 					reject: reject
/******/ 				};
/******/ 			});
/******/ 			hotUpdate = {};
/******/ 			var chunkId = "main";
/******/ 			// eslint-disable-next-line no-lone-blocks
/******/ 			{
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if (
/******/ 				hotStatus === "prepare" &&
/******/ 				hotChunksLoading === 0 &&
/******/ 				hotWaitingFiles === 0
/******/ 			) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 			return promise;
/******/ 		});
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) {
/******/ 		if (!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for (var moduleId in moreModules) {
/******/ 			if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if (--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if (!hotAvailableFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var deferred = hotDeferred;
/******/ 		hotDeferred = null;
/******/ 		if (!deferred) return;
/******/ 		if (hotApplyOnUpdate) {
/******/ 			// Wrap deferred object in Promise to mark it as a well-handled Promise to
/******/ 			// avoid triggering uncaught exception warning in Chrome.
/******/ 			// See https://bugs.chromium.org/p/chromium/issues/detail?id=465666
/******/ 			Promise.resolve()
/******/ 				.then(function() {
/******/ 					return hotApply(hotApplyOnUpdate);
/******/ 				})
/******/ 				.then(
/******/ 					function(result) {
/******/ 						deferred.resolve(result);
/******/ 					},
/******/ 					function(err) {
/******/ 						deferred.reject(err);
/******/ 					}
/******/ 				);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for (var id in hotUpdate) {
/******/ 				if (Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			deferred.resolve(outdatedModules);
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotApply(options) {
/******/ 		if (hotStatus !== "ready")
/******/ 			throw new Error("apply() is only allowed in ready status");
/******/ 		options = options || {};
/******/
/******/ 		var cb;
/******/ 		var i;
/******/ 		var j;
/******/ 		var module;
/******/ 		var moduleId;
/******/
/******/ 		function getAffectedStuff(updateModuleId) {
/******/ 			var outdatedModules = [updateModuleId];
/******/ 			var outdatedDependencies = {};
/******/
/******/ 			var queue = outdatedModules.map(function(id) {
/******/ 				return {
/******/ 					chain: [id],
/******/ 					id: id
/******/ 				};
/******/ 			});
/******/ 			while (queue.length > 0) {
/******/ 				var queueItem = queue.pop();
/******/ 				var moduleId = queueItem.id;
/******/ 				var chain = queueItem.chain;
/******/ 				module = installedModules[moduleId];
/******/ 				if (!module || module.hot._selfAccepted) continue;
/******/ 				if (module.hot._selfDeclined) {
/******/ 					return {
/******/ 						type: "self-declined",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				if (module.hot._main) {
/******/ 					return {
/******/ 						type: "unaccepted",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				for (var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if (!parent) continue;
/******/ 					if (parent.hot._declinedDependencies[moduleId]) {
/******/ 						return {
/******/ 							type: "declined",
/******/ 							chain: chain.concat([parentId]),
/******/ 							moduleId: moduleId,
/******/ 							parentId: parentId
/******/ 						};
/******/ 					}
/******/ 					if (outdatedModules.indexOf(parentId) !== -1) continue;
/******/ 					if (parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if (!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push({
/******/ 						chain: chain.concat([parentId]),
/******/ 						id: parentId
/******/ 					});
/******/ 				}
/******/ 			}
/******/
/******/ 			return {
/******/ 				type: "accepted",
/******/ 				moduleId: updateModuleId,
/******/ 				outdatedModules: outdatedModules,
/******/ 				outdatedDependencies: outdatedDependencies
/******/ 			};
/******/ 		}
/******/
/******/ 		function addAllToSet(a, b) {
/******/ 			for (var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if (a.indexOf(item) === -1) a.push(item);
/******/ 			}
/******/ 		}
/******/
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/
/******/ 		var warnUnexpectedRequire = function warnUnexpectedRequire() {
/******/ 			console.warn(
/******/ 				"[HMR] unexpected require(" + result.moduleId + ") to disposed module"
/******/ 			);
/******/ 		};
/******/
/******/ 		for (var id in hotUpdate) {
/******/ 			if (Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				moduleId = toModuleId(id);
/******/ 				/** @type {TODO} */
/******/ 				var result;
/******/ 				if (hotUpdate[id]) {
/******/ 					result = getAffectedStuff(moduleId);
/******/ 				} else {
/******/ 					result = {
/******/ 						type: "disposed",
/******/ 						moduleId: id
/******/ 					};
/******/ 				}
/******/ 				/** @type {Error|false} */
/******/ 				var abortError = false;
/******/ 				var doApply = false;
/******/ 				var doDispose = false;
/******/ 				var chainInfo = "";
/******/ 				if (result.chain) {
/******/ 					chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 				}
/******/ 				switch (result.type) {
/******/ 					case "self-declined":
/******/ 						if (options.onDeclined) options.onDeclined(result);
/******/ 						if (!options.ignoreDeclined)
/******/ 							abortError = new Error(
/******/ 								"Aborted because of self decline: " +
/******/ 									result.moduleId +
/******/ 									chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "declined":
/******/ 						if (options.onDeclined) options.onDeclined(result);
/******/ 						if (!options.ignoreDeclined)
/******/ 							abortError = new Error(
/******/ 								"Aborted because of declined dependency: " +
/******/ 									result.moduleId +
/******/ 									" in " +
/******/ 									result.parentId +
/******/ 									chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "unaccepted":
/******/ 						if (options.onUnaccepted) options.onUnaccepted(result);
/******/ 						if (!options.ignoreUnaccepted)
/******/ 							abortError = new Error(
/******/ 								"Aborted because " + moduleId + " is not accepted" + chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "accepted":
/******/ 						if (options.onAccepted) options.onAccepted(result);
/******/ 						doApply = true;
/******/ 						break;
/******/ 					case "disposed":
/******/ 						if (options.onDisposed) options.onDisposed(result);
/******/ 						doDispose = true;
/******/ 						break;
/******/ 					default:
/******/ 						throw new Error("Unexception type " + result.type);
/******/ 				}
/******/ 				if (abortError) {
/******/ 					hotSetStatus("abort");
/******/ 					return Promise.reject(abortError);
/******/ 				}
/******/ 				if (doApply) {
/******/ 					appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 					addAllToSet(outdatedModules, result.outdatedModules);
/******/ 					for (moduleId in result.outdatedDependencies) {
/******/ 						if (
/******/ 							Object.prototype.hasOwnProperty.call(
/******/ 								result.outdatedDependencies,
/******/ 								moduleId
/******/ 							)
/******/ 						) {
/******/ 							if (!outdatedDependencies[moduleId])
/******/ 								outdatedDependencies[moduleId] = [];
/******/ 							addAllToSet(
/******/ 								outdatedDependencies[moduleId],
/******/ 								result.outdatedDependencies[moduleId]
/******/ 							);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 				if (doDispose) {
/******/ 					addAllToSet(outdatedModules, [result.moduleId]);
/******/ 					appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for (i = 0; i < outdatedModules.length; i++) {
/******/ 			moduleId = outdatedModules[i];
/******/ 			if (
/******/ 				installedModules[moduleId] &&
/******/ 				installedModules[moduleId].hot._selfAccepted &&
/******/ 				// removed self-accepted modules should not be required
/******/ 				appliedUpdate[moduleId] !== warnUnexpectedRequire
/******/ 			) {
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 			}
/******/ 		}
/******/
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		Object.keys(hotAvailableFilesMap).forEach(function(chunkId) {
/******/ 			if (hotAvailableFilesMap[chunkId] === false) {
/******/ 				hotDisposeChunk(chunkId);
/******/ 			}
/******/ 		});
/******/
/******/ 		var idx;
/******/ 		var queue = outdatedModules.slice();
/******/ 		while (queue.length > 0) {
/******/ 			moduleId = queue.pop();
/******/ 			module = installedModules[moduleId];
/******/ 			if (!module) continue;
/******/
/******/ 			var data = {};
/******/
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for (j = 0; j < disposeHandlers.length; j++) {
/******/ 				cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/
/******/ 			// when disposing there is no need to call dispose handler
/******/ 			delete outdatedDependencies[moduleId];
/******/
/******/ 			// remove "parents" references from all children
/******/ 			for (j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if (!child) continue;
/******/ 				idx = child.parents.indexOf(moduleId);
/******/ 				if (idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// remove outdated dependency from module children
/******/ 		var dependency;
/******/ 		var moduleOutdatedDependencies;
/******/ 		for (moduleId in outdatedDependencies) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)
/******/ 			) {
/******/ 				module = installedModules[moduleId];
/******/ 				if (module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					for (j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 						dependency = moduleOutdatedDependencies[j];
/******/ 						idx = module.children.indexOf(dependency);
/******/ 						if (idx >= 0) module.children.splice(idx, 1);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Now in "apply" phase
/******/ 		hotSetStatus("apply");
/******/
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/
/******/ 		// insert new code
/******/ 		for (moduleId in appliedUpdate) {
/******/ 			if (Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for (moduleId in outdatedDependencies) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)
/******/ 			) {
/******/ 				module = installedModules[moduleId];
/******/ 				if (module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					var callbacks = [];
/******/ 					for (i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 						dependency = moduleOutdatedDependencies[i];
/******/ 						cb = module.hot._acceptedDependencies[dependency];
/******/ 						if (cb) {
/******/ 							if (callbacks.indexOf(cb) !== -1) continue;
/******/ 							callbacks.push(cb);
/******/ 						}
/******/ 					}
/******/ 					for (i = 0; i < callbacks.length; i++) {
/******/ 						cb = callbacks[i];
/******/ 						try {
/******/ 							cb(moduleOutdatedDependencies);
/******/ 						} catch (err) {
/******/ 							if (options.onErrored) {
/******/ 								options.onErrored({
/******/ 									type: "accept-errored",
/******/ 									moduleId: moduleId,
/******/ 									dependencyId: moduleOutdatedDependencies[i],
/******/ 									error: err
/******/ 								});
/******/ 							}
/******/ 							if (!options.ignoreErrored) {
/******/ 								if (!error) error = err;
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Load self accepted modules
/******/ 		for (i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch (err) {
/******/ 				if (typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch (err2) {
/******/ 						if (options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "self-accept-error-handler-errored",
/******/ 								moduleId: moduleId,
/******/ 								error: err2,
/******/ 								originalError: err
/******/ 							});
/******/ 						}
/******/ 						if (!options.ignoreErrored) {
/******/ 							if (!error) error = err2;
/******/ 						}
/******/ 						if (!error) error = err;
/******/ 					}
/******/ 				} else {
/******/ 					if (options.onErrored) {
/******/ 						options.onErrored({
/******/ 							type: "self-accept-errored",
/******/ 							moduleId: moduleId,
/******/ 							error: err
/******/ 						});
/******/ 					}
/******/ 					if (!options.ignoreErrored) {
/******/ 						if (!error) error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if (error) {
/******/ 			hotSetStatus("fail");
/******/ 			return Promise.reject(error);
/******/ 		}
/******/
/******/ 		hotSetStatus("idle");
/******/ 		return new Promise(function(resolve) {
/******/ 			resolve(outdatedModules);
/******/ 		});
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {},
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(0)(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "../../node_modules/@babel/runtime/helpers/assertThisInitialized.js":
/*!***********************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/assertThisInitialized.js ***!
  \***********************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function _assertThisInitialized(self) {\n  if (self === void 0) {\n    throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n  }\n\n  return self;\n}\n\nmodule.exports = _assertThisInitialized;\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/assertThisInitialized.js?");

/***/ }),

/***/ "../../node_modules/@babel/runtime/helpers/classCallCheck.js":
/*!****************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/classCallCheck.js ***!
  \****************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function _classCallCheck(instance, Constructor) {\n  if (!(instance instanceof Constructor)) {\n    throw new TypeError(\"Cannot call a class as a function\");\n  }\n}\n\nmodule.exports = _classCallCheck;\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/classCallCheck.js?");

/***/ }),

/***/ "../../node_modules/@babel/runtime/helpers/createClass.js":
/*!*************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/createClass.js ***!
  \*************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function _defineProperties(target, props) {\n  for (var i = 0; i < props.length; i++) {\n    var descriptor = props[i];\n    descriptor.enumerable = descriptor.enumerable || false;\n    descriptor.configurable = true;\n    if (\"value\" in descriptor) descriptor.writable = true;\n    Object.defineProperty(target, descriptor.key, descriptor);\n  }\n}\n\nfunction _createClass(Constructor, protoProps, staticProps) {\n  if (protoProps) _defineProperties(Constructor.prototype, protoProps);\n  if (staticProps) _defineProperties(Constructor, staticProps);\n  return Constructor;\n}\n\nmodule.exports = _createClass;\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/createClass.js?");

/***/ }),

/***/ "../../node_modules/@babel/runtime/helpers/get.js":
/*!*****************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/get.js ***!
  \*****************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var superPropBase = __webpack_require__(/*! ./superPropBase */ \"../../node_modules/@babel/runtime/helpers/superPropBase.js\");\n\nfunction _get(target, property, receiver) {\n  if (typeof Reflect !== \"undefined\" && Reflect.get) {\n    module.exports = _get = Reflect.get;\n  } else {\n    module.exports = _get = function _get(target, property, receiver) {\n      var base = superPropBase(target, property);\n      if (!base) return;\n      var desc = Object.getOwnPropertyDescriptor(base, property);\n\n      if (desc.get) {\n        return desc.get.call(receiver);\n      }\n\n      return desc.value;\n    };\n  }\n\n  return _get(target, property, receiver || target);\n}\n\nmodule.exports = _get;\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/get.js?");

/***/ }),

/***/ "../../node_modules/@babel/runtime/helpers/getPrototypeOf.js":
/*!****************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/getPrototypeOf.js ***!
  \****************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function _getPrototypeOf(o) {\n  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {\n    return o.__proto__ || Object.getPrototypeOf(o);\n  };\n  return _getPrototypeOf(o);\n}\n\nmodule.exports = _getPrototypeOf;\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/getPrototypeOf.js?");

/***/ }),

/***/ "../../node_modules/@babel/runtime/helpers/inherits.js":
/*!**********************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/inherits.js ***!
  \**********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var setPrototypeOf = __webpack_require__(/*! ./setPrototypeOf */ \"../../node_modules/@babel/runtime/helpers/setPrototypeOf.js\");\n\nfunction _inherits(subClass, superClass) {\n  if (typeof superClass !== \"function\" && superClass !== null) {\n    throw new TypeError(\"Super expression must either be null or a function\");\n  }\n\n  subClass.prototype = Object.create(superClass && superClass.prototype, {\n    constructor: {\n      value: subClass,\n      writable: true,\n      configurable: true\n    }\n  });\n  if (superClass) setPrototypeOf(subClass, superClass);\n}\n\nmodule.exports = _inherits;\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/inherits.js?");

/***/ }),

/***/ "../../node_modules/@babel/runtime/helpers/interopRequireDefault.js":
/*!***********************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/interopRequireDefault.js ***!
  \***********************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function _interopRequireDefault(obj) {\n  return obj && obj.__esModule ? obj : {\n    \"default\": obj\n  };\n}\n\nmodule.exports = _interopRequireDefault;\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/interopRequireDefault.js?");

/***/ }),

/***/ "../../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js":
/*!***************************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/possibleConstructorReturn.js ***!
  \***************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var _typeof = __webpack_require__(/*! ../helpers/typeof */ \"../../node_modules/@babel/runtime/helpers/typeof.js\");\n\nvar assertThisInitialized = __webpack_require__(/*! ./assertThisInitialized */ \"../../node_modules/@babel/runtime/helpers/assertThisInitialized.js\");\n\nfunction _possibleConstructorReturn(self, call) {\n  if (call && (_typeof(call) === \"object\" || typeof call === \"function\")) {\n    return call;\n  }\n\n  return assertThisInitialized(self);\n}\n\nmodule.exports = _possibleConstructorReturn;\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/possibleConstructorReturn.js?");

/***/ }),

/***/ "../../node_modules/@babel/runtime/helpers/setPrototypeOf.js":
/*!****************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/setPrototypeOf.js ***!
  \****************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function _setPrototypeOf(o, p) {\n  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {\n    o.__proto__ = p;\n    return o;\n  };\n\n  return _setPrototypeOf(o, p);\n}\n\nmodule.exports = _setPrototypeOf;\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/setPrototypeOf.js?");

/***/ }),

/***/ "../../node_modules/@babel/runtime/helpers/superPropBase.js":
/*!***************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/superPropBase.js ***!
  \***************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var getPrototypeOf = __webpack_require__(/*! ./getPrototypeOf */ \"../../node_modules/@babel/runtime/helpers/getPrototypeOf.js\");\n\nfunction _superPropBase(object, property) {\n  while (!Object.prototype.hasOwnProperty.call(object, property)) {\n    object = getPrototypeOf(object);\n    if (object === null) break;\n  }\n\n  return object;\n}\n\nmodule.exports = _superPropBase;\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/superPropBase.js?");

/***/ }),

/***/ "../../node_modules/@babel/runtime/helpers/typeof.js":
/*!********************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/typeof.js ***!
  \********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function _typeof(obj) {\n  if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") {\n    module.exports = _typeof = function _typeof(obj) {\n      return typeof obj;\n    };\n  } else {\n    module.exports = _typeof = function _typeof(obj) {\n      return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj;\n    };\n  }\n\n  return _typeof(obj);\n}\n\nmodule.exports = _typeof;\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@babel/runtime/helpers/typeof.js?");

/***/ }),

/***/ "../../node_modules/@material/animation/index.js":
/*!****************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/animation/index.js ***!
  \****************************************************************************************************************/
/*! exports provided: transformStyleProperties, getCorrectEventName, getCorrectPropertyName */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"transformStyleProperties\", function() { return transformStyleProperties; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getCorrectEventName\", function() { return getCorrectEventName; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getCorrectPropertyName\", function() { return getCorrectPropertyName; });\n/**\n * @license\n * Copyright 2016 Google Inc.\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\n/**\n * @typedef {{\n *   noPrefix: string,\n *   webkitPrefix: string,\n *   styleProperty: string\n * }}\n */\nlet VendorPropertyMapType;\n\n/** @const {Object<string, !VendorPropertyMapType>} */\nconst eventTypeMap = {\n  'animationstart': {\n    noPrefix: 'animationstart',\n    webkitPrefix: 'webkitAnimationStart',\n    styleProperty: 'animation',\n  },\n  'animationend': {\n    noPrefix: 'animationend',\n    webkitPrefix: 'webkitAnimationEnd',\n    styleProperty: 'animation',\n  },\n  'animationiteration': {\n    noPrefix: 'animationiteration',\n    webkitPrefix: 'webkitAnimationIteration',\n    styleProperty: 'animation',\n  },\n  'transitionend': {\n    noPrefix: 'transitionend',\n    webkitPrefix: 'webkitTransitionEnd',\n    styleProperty: 'transition',\n  },\n};\n\n/** @const {Object<string, !VendorPropertyMapType>} */\nconst cssPropertyMap = {\n  'animation': {\n    noPrefix: 'animation',\n    webkitPrefix: '-webkit-animation',\n  },\n  'transform': {\n    noPrefix: 'transform',\n    webkitPrefix: '-webkit-transform',\n  },\n  'transition': {\n    noPrefix: 'transition',\n    webkitPrefix: '-webkit-transition',\n  },\n};\n\n/**\n * @param {!Object} windowObj\n * @return {boolean}\n */\nfunction hasProperShape(windowObj) {\n  return (windowObj['document'] !== undefined && typeof windowObj['document']['createElement'] === 'function');\n}\n\n/**\n * @param {string} eventType\n * @return {boolean}\n */\nfunction eventFoundInMaps(eventType) {\n  return (eventType in eventTypeMap || eventType in cssPropertyMap);\n}\n\n/**\n * @param {string} eventType\n * @param {!Object<string, !VendorPropertyMapType>} map\n * @param {!Element} el\n * @return {string}\n */\nfunction getJavaScriptEventName(eventType, map, el) {\n  return map[eventType].styleProperty in el.style ? map[eventType].noPrefix : map[eventType].webkitPrefix;\n}\n\n/**\n * Helper function to determine browser prefix for CSS3 animation events\n * and property names.\n * @param {!Object} windowObj\n * @param {string} eventType\n * @return {string}\n */\nfunction getAnimationName(windowObj, eventType) {\n  if (!hasProperShape(windowObj) || !eventFoundInMaps(eventType)) {\n    return eventType;\n  }\n\n  const map = /** @type {!Object<string, !VendorPropertyMapType>} */ (\n    eventType in eventTypeMap ? eventTypeMap : cssPropertyMap\n  );\n  const el = windowObj['document']['createElement']('div');\n  let eventName = '';\n\n  if (map === eventTypeMap) {\n    eventName = getJavaScriptEventName(eventType, map, el);\n  } else {\n    eventName = map[eventType].noPrefix in el.style ? map[eventType].noPrefix : map[eventType].webkitPrefix;\n  }\n\n  return eventName;\n}\n\n// Public functions to access getAnimationName() for JavaScript events or CSS\n// property names.\n\nconst transformStyleProperties = ['transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'MSTransform'];\n\n/**\n * @param {!Object} windowObj\n * @param {string} eventType\n * @return {string}\n */\nfunction getCorrectEventName(windowObj, eventType) {\n  return getAnimationName(windowObj, eventType);\n}\n\n/**\n * @param {!Object} windowObj\n * @param {string} eventType\n * @return {string}\n */\nfunction getCorrectPropertyName(windowObj, eventType) {\n  return getAnimationName(windowObj, eventType);\n}\n\n\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/animation/index.js?");

/***/ }),

/***/ "../../node_modules/@material/base/component.js":
/*!***************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/base/component.js ***!
  \***************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _foundation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./foundation */ \"../../node_modules/@material/base/foundation.js\");\n/**\n * @license\n * Copyright 2016 Google Inc.\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\n\n\n/**\n * @template F\n */\nclass MDCComponent {\n  /**\n   * @param {!Element} root\n   * @return {!MDCComponent}\n   */\n  static attachTo(root) {\n    // Subclasses which extend MDCBase should provide an attachTo() method that takes a root element and\n    // returns an instantiated component with its root set to that element. Also note that in the cases of\n    // subclasses, an explicit foundation class will not have to be passed in; it will simply be initialized\n    // from getDefaultFoundation().\n    return new MDCComponent(root, new _foundation__WEBPACK_IMPORTED_MODULE_0__[\"default\"]());\n  }\n\n  /**\n   * @param {!Element} root\n   * @param {F=} foundation\n   * @param {...?} args\n   */\n  constructor(root, foundation = undefined, ...args) {\n    /** @protected {!Element} */\n    this.root_ = root;\n    this.initialize(...args);\n    // Note that we initialize foundation here and not within the constructor's default param so that\n    // this.root_ is defined and can be used within the foundation class.\n    /** @protected {!F} */\n    this.foundation_ = foundation === undefined ? this.getDefaultFoundation() : foundation;\n    this.foundation_.init();\n    this.initialSyncWithDOM();\n  }\n\n  initialize(/* ...args */) {\n    // Subclasses can override this to do any additional setup work that would be considered part of a\n    // \"constructor\". Essentially, it is a hook into the parent constructor before the foundation is\n    // initialized. Any additional arguments besides root and foundation will be passed in here.\n  }\n\n  /**\n   * @return {!F} foundation\n   */\n  getDefaultFoundation() {\n    // Subclasses must override this method to return a properly configured foundation class for the\n    // component.\n    throw new Error('Subclasses must override getDefaultFoundation to return a properly configured ' +\n      'foundation class');\n  }\n\n  initialSyncWithDOM() {\n    // Subclasses should override this method if they need to perform work to synchronize with a host DOM\n    // object. An example of this would be a form control wrapper that needs to synchronize its internal state\n    // to some property or attribute of the host DOM. Please note: this is *not* the place to perform DOM\n    // reads/writes that would cause layout / paint, as this is called synchronously from within the constructor.\n  }\n\n  destroy() {\n    // Subclasses may implement this method to release any resources / deregister any listeners they have\n    // attached. An example of this might be deregistering a resize event from the window object.\n    this.foundation_.destroy();\n  }\n\n  /**\n   * Wrapper method to add an event listener to the component's root element. This is most useful when\n   * listening for custom events.\n   * @param {string} evtType\n   * @param {!Function} handler\n   */\n  listen(evtType, handler) {\n    this.root_.addEventListener(evtType, handler);\n  }\n\n  /**\n   * Wrapper method to remove an event listener to the component's root element. This is most useful when\n   * unlistening for custom events.\n   * @param {string} evtType\n   * @param {!Function} handler\n   */\n  unlisten(evtType, handler) {\n    this.root_.removeEventListener(evtType, handler);\n  }\n\n  /**\n   * Fires a cross-browser-compatible custom event from the component root of the given type,\n   * with the given data.\n   * @param {string} evtType\n   * @param {!Object} evtData\n   * @param {boolean=} shouldBubble\n   */\n  emit(evtType, evtData, shouldBubble = false) {\n    let evt;\n    if (typeof CustomEvent === 'function') {\n      evt = new CustomEvent(evtType, {\n        detail: evtData,\n        bubbles: shouldBubble,\n      });\n    } else {\n      evt = document.createEvent('CustomEvent');\n      evt.initCustomEvent(evtType, shouldBubble, false, evtData);\n    }\n\n    this.root_.dispatchEvent(evt);\n  }\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (MDCComponent);\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/base/component.js?");

/***/ }),

/***/ "../../node_modules/@material/base/foundation.js":
/*!****************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/base/foundation.js ***!
  \****************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/**\n * @license\n * Copyright 2016 Google Inc.\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\n/**\n * @template A\n */\nclass MDCFoundation {\n  /** @return enum{cssClasses} */\n  static get cssClasses() {\n    // Classes extending MDCFoundation should implement this method to return an object which exports every\n    // CSS class the foundation class needs as a property. e.g. {ACTIVE: 'mdc-component--active'}\n    return {};\n  }\n\n  /** @return enum{strings} */\n  static get strings() {\n    // Classes extending MDCFoundation should implement this method to return an object which exports all\n    // semantic strings as constants. e.g. {ARIA_ROLE: 'tablist'}\n    return {};\n  }\n\n  /** @return enum{numbers} */\n  static get numbers() {\n    // Classes extending MDCFoundation should implement this method to return an object which exports all\n    // of its semantic numbers as constants. e.g. {ANIMATION_DELAY_MS: 350}\n    return {};\n  }\n\n  /** @return {!Object} */\n  static get defaultAdapter() {\n    // Classes extending MDCFoundation may choose to implement this getter in order to provide a convenient\n    // way of viewing the necessary methods of an adapter. In the future, this could also be used for adapter\n    // validation.\n    return {};\n  }\n\n  /**\n   * @param {A=} adapter\n   */\n  constructor(adapter = {}) {\n    /** @protected {!A} */\n    this.adapter_ = adapter;\n  }\n\n  init() {\n    // Subclasses should override this method to perform initialization routines (registering events, etc.)\n  }\n\n  destroy() {\n    // Subclasses should override this method to perform de-initialization routines (de-registering events, etc.)\n  }\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (MDCFoundation);\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/base/foundation.js?");

/***/ }),

/***/ "../../node_modules/@material/base/index.js":
/*!***********************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/base/index.js ***!
  \***********************************************************************************************************/
/*! exports provided: MDCFoundation, MDCComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _foundation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./foundation */ \"../../node_modules/@material/base/foundation.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"MDCFoundation\", function() { return _foundation__WEBPACK_IMPORTED_MODULE_0__[\"default\"]; });\n\n/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./component */ \"../../node_modules/@material/base/component.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"MDCComponent\", function() { return _component__WEBPACK_IMPORTED_MODULE_1__[\"default\"]; });\n\n/**\n * @license\n * Copyright 2016 Google Inc.\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\n\n\n\n\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/base/index.js?");

/***/ }),

/***/ "../../node_modules/@material/linear-progress/constants.js":
/*!**************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/linear-progress/constants.js ***!
  \**************************************************************************************************************************/
/*! exports provided: cssClasses, strings */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"cssClasses\", function() { return cssClasses; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"strings\", function() { return strings; });\n/**\n * @license\n * Copyright 2017 Google Inc.\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\nconst cssClasses = {\n  CLOSED_CLASS: 'mdc-linear-progress--closed',\n  INDETERMINATE_CLASS: 'mdc-linear-progress--indeterminate',\n  REVERSED_CLASS: 'mdc-linear-progress--reversed',\n};\n\nconst strings = {\n  PRIMARY_BAR_SELECTOR: '.mdc-linear-progress__primary-bar',\n  BUFFER_SELECTOR: '.mdc-linear-progress__buffer',\n};\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/linear-progress/constants.js?");

/***/ }),

/***/ "../../node_modules/@material/linear-progress/foundation.js":
/*!***************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/linear-progress/foundation.js ***!
  \***************************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return MDCLinearProgressFoundation; });\n/* harmony import */ var _material_base_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @material/base/index */ \"../../node_modules/@material/base/index.js\");\n/* harmony import */ var _material_animation_index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @material/animation/index */ \"../../node_modules/@material/animation/index.js\");\n/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants */ \"../../node_modules/@material/linear-progress/constants.js\");\n/**\n * @license\n * Copyright 2017 Google Inc.\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\n\n\n\n\n\nclass MDCLinearProgressFoundation extends _material_base_index__WEBPACK_IMPORTED_MODULE_0__[\"MDCFoundation\"] {\n  static get cssClasses() {\n    return _constants__WEBPACK_IMPORTED_MODULE_2__[\"cssClasses\"];\n  }\n\n  static get strings() {\n    return _constants__WEBPACK_IMPORTED_MODULE_2__[\"strings\"];\n  }\n\n  static get defaultAdapter() {\n    return {\n      addClass: (/* className: string */) => {},\n      getPrimaryBar: () => /* el: Element */ {},\n      getBuffer: () => /* el: Element */ {},\n      hasClass: (/* className: string */) => false,\n      removeClass: (/* className: string */) => {},\n      setStyle: (/* el: Element, styleProperty: string, value: string */) => {},\n    };\n  }\n\n  constructor(adapter) {\n    super(Object.assign(MDCLinearProgressFoundation.defaultAdapter, adapter));\n  }\n\n  init() {\n    this.determinate_ = !this.adapter_.hasClass(_constants__WEBPACK_IMPORTED_MODULE_2__[\"cssClasses\"].INDETERMINATE_CLASS);\n    this.reverse_ = this.adapter_.hasClass(_constants__WEBPACK_IMPORTED_MODULE_2__[\"cssClasses\"].REVERSED_CLASS);\n    this.progress_ = 0;\n  }\n\n  setDeterminate(isDeterminate) {\n    this.determinate_ = isDeterminate;\n    if (this.determinate_) {\n      this.adapter_.removeClass(_constants__WEBPACK_IMPORTED_MODULE_2__[\"cssClasses\"].INDETERMINATE_CLASS);\n      this.setScale_(this.adapter_.getPrimaryBar(), this.progress_);\n    } else {\n      this.adapter_.addClass(_constants__WEBPACK_IMPORTED_MODULE_2__[\"cssClasses\"].INDETERMINATE_CLASS);\n      this.setScale_(this.adapter_.getPrimaryBar(), 1);\n      this.setScale_(this.adapter_.getBuffer(), 1);\n    }\n  }\n\n  setProgress(value) {\n    this.progress_ = value;\n    if (this.determinate_) {\n      this.setScale_(this.adapter_.getPrimaryBar(), value);\n    }\n  }\n\n  setBuffer(value) {\n    if (this.determinate_) {\n      this.setScale_(this.adapter_.getBuffer(), value);\n    }\n  }\n\n  setReverse(isReversed) {\n    this.reverse_ = isReversed;\n    if (this.reverse_) {\n      this.adapter_.addClass(_constants__WEBPACK_IMPORTED_MODULE_2__[\"cssClasses\"].REVERSED_CLASS);\n    } else {\n      this.adapter_.removeClass(_constants__WEBPACK_IMPORTED_MODULE_2__[\"cssClasses\"].REVERSED_CLASS);\n    }\n  }\n\n  open() {\n    this.adapter_.removeClass(_constants__WEBPACK_IMPORTED_MODULE_2__[\"cssClasses\"].CLOSED_CLASS);\n  }\n\n  close() {\n    this.adapter_.addClass(_constants__WEBPACK_IMPORTED_MODULE_2__[\"cssClasses\"].CLOSED_CLASS);\n  }\n\n  setScale_(el, scaleValue) {\n    const value = 'scaleX(' + scaleValue + ')';\n    _material_animation_index__WEBPACK_IMPORTED_MODULE_1__[\"transformStyleProperties\"].forEach((transformStyleProperty) => {\n      this.adapter_.setStyle(el, transformStyleProperty, value);\n    });\n  }\n}\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/linear-progress/foundation.js?");

/***/ }),

/***/ "../../node_modules/@material/linear-progress/index.js":
/*!**********************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/linear-progress/index.js ***!
  \**********************************************************************************************************************/
/*! exports provided: MDCLinearProgressFoundation, MDCLinearProgress */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"MDCLinearProgress\", function() { return MDCLinearProgress; });\n/* harmony import */ var _material_base_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @material/base/index */ \"../../node_modules/@material/base/index.js\");\n/* harmony import */ var _foundation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./foundation */ \"../../node_modules/@material/linear-progress/foundation.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"MDCLinearProgressFoundation\", function() { return _foundation__WEBPACK_IMPORTED_MODULE_1__[\"default\"]; });\n\n/**\n * @license\n * Copyright 2017 Google Inc.\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\n\n\n\n\n\nclass MDCLinearProgress extends _material_base_index__WEBPACK_IMPORTED_MODULE_0__[\"MDCComponent\"] {\n  static attachTo(root) {\n    return new MDCLinearProgress(root);\n  }\n\n  set determinate(value) {\n    this.foundation_.setDeterminate(value);\n  }\n\n  set progress(value) {\n    this.foundation_.setProgress(value);\n  }\n\n  set buffer(value) {\n    this.foundation_.setBuffer(value);\n  }\n\n  set reverse(value) {\n    this.foundation_.setReverse(value);\n  }\n\n  open() {\n    this.foundation_.open();\n  }\n\n  close() {\n    this.foundation_.close();\n  }\n\n  getDefaultFoundation() {\n    return new _foundation__WEBPACK_IMPORTED_MODULE_1__[\"default\"]({\n      addClass: (className) => this.root_.classList.add(className),\n      getPrimaryBar: () => this.root_.querySelector(_foundation__WEBPACK_IMPORTED_MODULE_1__[\"default\"].strings.PRIMARY_BAR_SELECTOR),\n      getBuffer: () => this.root_.querySelector(_foundation__WEBPACK_IMPORTED_MODULE_1__[\"default\"].strings.BUFFER_SELECTOR),\n      hasClass: (className) => this.root_.classList.contains(className),\n      removeClass: (className) => this.root_.classList.remove(className),\n      setStyle: (el, styleProperty, value) => el.style[styleProperty] = value,\n    });\n  }\n}\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/linear-progress/index.js?");

/***/ }),

/***/ "../../node_modules/@material/ripple/adapter.js":
/*!***************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/ripple/adapter.js ***!
  \***************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/**\n * @license\n * Copyright 2016 Google Inc.\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\n/* eslint no-unused-vars: [2, {\"args\": \"none\"}] */\n\n/**\n * Adapter for MDC Ripple. Provides an interface for managing\n * - classes\n * - dom\n * - CSS variables\n * - position\n * - dimensions\n * - scroll position\n * - event handlers\n * - unbounded, active and disabled states\n *\n * Additionally, provides type information for the adapter to the Closure\n * compiler.\n *\n * Implement this adapter for your framework of choice to delegate updates to\n * the component in your framework of choice. See architecture documentation\n * for more details.\n * https://github.com/material-components/material-components-web/blob/master/docs/code/architecture.md\n *\n * @record\n */\nclass MDCRippleAdapter {\n  /** @return {boolean} */\n  browserSupportsCssVars() {}\n\n  /** @return {boolean} */\n  isUnbounded() {}\n\n  /** @return {boolean} */\n  isSurfaceActive() {}\n\n  /** @return {boolean} */\n  isSurfaceDisabled() {}\n\n  /** @param {string} className */\n  addClass(className) {}\n\n  /** @param {string} className */\n  removeClass(className) {}\n\n  /** @param {!EventTarget} target */\n  containsEventTarget(target) {}\n\n  /**\n   * @param {string} evtType\n   * @param {!Function} handler\n   */\n  registerInteractionHandler(evtType, handler) {}\n\n  /**\n   * @param {string} evtType\n   * @param {!Function} handler\n   */\n  deregisterInteractionHandler(evtType, handler) {}\n\n  /**\n   * @param {string} evtType\n   * @param {!Function} handler\n   */\n  registerDocumentInteractionHandler(evtType, handler) {}\n\n  /**\n   * @param {string} evtType\n   * @param {!Function} handler\n   */\n  deregisterDocumentInteractionHandler(evtType, handler) {}\n\n  /**\n   * @param {!Function} handler\n   */\n  registerResizeHandler(handler) {}\n\n  /**\n   * @param {!Function} handler\n   */\n  deregisterResizeHandler(handler) {}\n\n  /**\n   * @param {string} varName\n   * @param {?number|string} value\n   */\n  updateCssVariable(varName, value) {}\n\n  /** @return {!ClientRect} */\n  computeBoundingRect() {}\n\n  /** @return {{x: number, y: number}} */\n  getWindowPageOffset() {}\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (MDCRippleAdapter);\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/ripple/adapter.js?");

/***/ }),

/***/ "../../node_modules/@material/ripple/constants.js":
/*!*****************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/ripple/constants.js ***!
  \*****************************************************************************************************************/
/*! exports provided: cssClasses, strings, numbers */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"cssClasses\", function() { return cssClasses; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"strings\", function() { return strings; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"numbers\", function() { return numbers; });\n/**\n * @license\n * Copyright 2016 Google Inc.\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\nconst cssClasses = {\n  // Ripple is a special case where the \"root\" component is really a \"mixin\" of sorts,\n  // given that it's an 'upgrade' to an existing component. That being said it is the root\n  // CSS class that all other CSS classes derive from.\n  ROOT: 'mdc-ripple-upgraded',\n  UNBOUNDED: 'mdc-ripple-upgraded--unbounded',\n  BG_FOCUSED: 'mdc-ripple-upgraded--background-focused',\n  FG_ACTIVATION: 'mdc-ripple-upgraded--foreground-activation',\n  FG_DEACTIVATION: 'mdc-ripple-upgraded--foreground-deactivation',\n};\n\nconst strings = {\n  VAR_LEFT: '--mdc-ripple-left',\n  VAR_TOP: '--mdc-ripple-top',\n  VAR_FG_SIZE: '--mdc-ripple-fg-size',\n  VAR_FG_SCALE: '--mdc-ripple-fg-scale',\n  VAR_FG_TRANSLATE_START: '--mdc-ripple-fg-translate-start',\n  VAR_FG_TRANSLATE_END: '--mdc-ripple-fg-translate-end',\n};\n\nconst numbers = {\n  PADDING: 10,\n  INITIAL_ORIGIN_SCALE: 0.6,\n  DEACTIVATION_TIMEOUT_MS: 225, // Corresponds to $mdc-ripple-translate-duration (i.e. activation animation duration)\n  FG_DEACTIVATION_MS: 150, // Corresponds to $mdc-ripple-fade-out-duration (i.e. deactivation animation duration)\n  TAP_DELAY_MS: 300, // Delay between touch and simulated mouse events on touch devices\n};\n\n\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/ripple/constants.js?");

/***/ }),

/***/ "../../node_modules/@material/ripple/foundation.js":
/*!******************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/ripple/foundation.js ***!
  \******************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _material_base_foundation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @material/base/foundation */ \"../../node_modules/@material/base/foundation.js\");\n/* harmony import */ var _adapter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./adapter */ \"../../node_modules/@material/ripple/adapter.js\");\n/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants */ \"../../node_modules/@material/ripple/constants.js\");\n/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util */ \"../../node_modules/@material/ripple/util.js\");\n/**\n * @license\n * Copyright 2016 Google Inc.\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\n\n\n\n\n\n/**\n * @typedef {{\n *   isActivated: (boolean|undefined),\n *   hasDeactivationUXRun: (boolean|undefined),\n *   wasActivatedByPointer: (boolean|undefined),\n *   wasElementMadeActive: (boolean|undefined),\n *   activationEvent: Event,\n *   isProgrammatic: (boolean|undefined)\n * }}\n */\nlet ActivationStateType;\n\n/**\n * @typedef {{\n *   activate: (string|undefined),\n *   deactivate: (string|undefined),\n *   focus: (string|undefined),\n *   blur: (string|undefined)\n * }}\n */\nlet ListenerInfoType;\n\n/**\n * @typedef {{\n *   activate: function(!Event),\n *   deactivate: function(!Event),\n *   focus: function(),\n *   blur: function()\n * }}\n */\nlet ListenersType;\n\n/**\n * @typedef {{\n *   x: number,\n *   y: number\n * }}\n */\nlet PointType;\n\n// Activation events registered on the root element of each instance for activation\nconst ACTIVATION_EVENT_TYPES = ['touchstart', 'pointerdown', 'mousedown', 'keydown'];\n\n// Deactivation events registered on documentElement when a pointer-related down event occurs\nconst POINTER_DEACTIVATION_EVENT_TYPES = ['touchend', 'pointerup', 'mouseup'];\n\n// Tracks activations that have occurred on the current frame, to avoid simultaneous nested activations\n/** @type {!Array<!EventTarget>} */\nlet activatedTargets = [];\n\n/**\n * @extends {MDCFoundation<!MDCRippleAdapter>}\n */\nclass MDCRippleFoundation extends _material_base_foundation__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n  static get cssClasses() {\n    return _constants__WEBPACK_IMPORTED_MODULE_2__[\"cssClasses\"];\n  }\n\n  static get strings() {\n    return _constants__WEBPACK_IMPORTED_MODULE_2__[\"strings\"];\n  }\n\n  static get numbers() {\n    return _constants__WEBPACK_IMPORTED_MODULE_2__[\"numbers\"];\n  }\n\n  static get defaultAdapter() {\n    return {\n      browserSupportsCssVars: () => /* boolean - cached */ {},\n      isUnbounded: () => /* boolean */ {},\n      isSurfaceActive: () => /* boolean */ {},\n      isSurfaceDisabled: () => /* boolean */ {},\n      addClass: (/* className: string */) => {},\n      removeClass: (/* className: string */) => {},\n      containsEventTarget: (/* target: !EventTarget */) => {},\n      registerInteractionHandler: (/* evtType: string, handler: EventListener */) => {},\n      deregisterInteractionHandler: (/* evtType: string, handler: EventListener */) => {},\n      registerDocumentInteractionHandler: (/* evtType: string, handler: EventListener */) => {},\n      deregisterDocumentInteractionHandler: (/* evtType: string, handler: EventListener */) => {},\n      registerResizeHandler: (/* handler: EventListener */) => {},\n      deregisterResizeHandler: (/* handler: EventListener */) => {},\n      updateCssVariable: (/* varName: string, value: string */) => {},\n      computeBoundingRect: () => /* ClientRect */ {},\n      getWindowPageOffset: () => /* {x: number, y: number} */ {},\n    };\n  }\n\n  constructor(adapter) {\n    super(Object.assign(MDCRippleFoundation.defaultAdapter, adapter));\n\n    /** @private {number} */\n    this.layoutFrame_ = 0;\n\n    /** @private {!ClientRect} */\n    this.frame_ = /** @type {!ClientRect} */ ({width: 0, height: 0});\n\n    /** @private {!ActivationStateType} */\n    this.activationState_ = this.defaultActivationState_();\n\n    /** @private {number} */\n    this.initialSize_ = 0;\n\n    /** @private {number} */\n    this.maxRadius_ = 0;\n\n    /** @private {function(!Event)} */\n    this.activateHandler_ = (e) => this.activate_(e);\n\n    /** @private {function(!Event)} */\n    this.deactivateHandler_ = (e) => this.deactivate_(e);\n\n    /** @private {function(?Event=)} */\n    this.focusHandler_ = () => this.handleFocus();\n\n    /** @private {function(?Event=)} */\n    this.blurHandler_ = () => this.handleBlur();\n\n    /** @private {!Function} */\n    this.resizeHandler_ = () => this.layout();\n\n    /** @private {{left: number, top:number}} */\n    this.unboundedCoords_ = {\n      left: 0,\n      top: 0,\n    };\n\n    /** @private {number} */\n    this.fgScale_ = 0;\n\n    /** @private {number} */\n    this.activationTimer_ = 0;\n\n    /** @private {number} */\n    this.fgDeactivationRemovalTimer_ = 0;\n\n    /** @private {boolean} */\n    this.activationAnimationHasEnded_ = false;\n\n    /** @private {!Function} */\n    this.activationTimerCallback_ = () => {\n      this.activationAnimationHasEnded_ = true;\n      this.runDeactivationUXLogicIfReady_();\n    };\n\n    /** @private {?Event} */\n    this.previousActivationEvent_ = null;\n  }\n\n  /**\n   * We compute this property so that we are not querying information about the client\n   * until the point in time where the foundation requests it. This prevents scenarios where\n   * client-side feature-detection may happen too early, such as when components are rendered on the server\n   * and then initialized at mount time on the client.\n   * @return {boolean}\n   * @private\n   */\n  supportsPressRipple_() {\n    return this.adapter_.browserSupportsCssVars();\n  }\n\n  /**\n   * @return {!ActivationStateType}\n   */\n  defaultActivationState_() {\n    return {\n      isActivated: false,\n      hasDeactivationUXRun: false,\n      wasActivatedByPointer: false,\n      wasElementMadeActive: false,\n      activationEvent: null,\n      isProgrammatic: false,\n    };\n  }\n\n  /** @override */\n  init() {\n    const supportsPressRipple = this.supportsPressRipple_();\n\n    this.registerRootHandlers_(supportsPressRipple);\n\n    if (supportsPressRipple) {\n      const {ROOT, UNBOUNDED} = MDCRippleFoundation.cssClasses;\n      requestAnimationFrame(() => {\n        this.adapter_.addClass(ROOT);\n        if (this.adapter_.isUnbounded()) {\n          this.adapter_.addClass(UNBOUNDED);\n          // Unbounded ripples need layout logic applied immediately to set coordinates for both shade and ripple\n          this.layoutInternal_();\n        }\n      });\n    }\n  }\n\n  /** @override */\n  destroy() {\n    if (this.supportsPressRipple_()) {\n      if (this.activationTimer_) {\n        clearTimeout(this.activationTimer_);\n        this.activationTimer_ = 0;\n        this.adapter_.removeClass(MDCRippleFoundation.cssClasses.FG_ACTIVATION);\n      }\n\n      if (this.fgDeactivationRemovalTimer_) {\n        clearTimeout(this.fgDeactivationRemovalTimer_);\n        this.fgDeactivationRemovalTimer_ = 0;\n        this.adapter_.removeClass(MDCRippleFoundation.cssClasses.FG_DEACTIVATION);\n      }\n\n      const {ROOT, UNBOUNDED} = MDCRippleFoundation.cssClasses;\n      requestAnimationFrame(() => {\n        this.adapter_.removeClass(ROOT);\n        this.adapter_.removeClass(UNBOUNDED);\n        this.removeCssVars_();\n      });\n    }\n\n    this.deregisterRootHandlers_();\n    this.deregisterDeactivationHandlers_();\n  }\n\n  /**\n   * @param {boolean} supportsPressRipple Passed from init to save a redundant function call\n   * @private\n   */\n  registerRootHandlers_(supportsPressRipple) {\n    if (supportsPressRipple) {\n      ACTIVATION_EVENT_TYPES.forEach((type) => {\n        this.adapter_.registerInteractionHandler(type, this.activateHandler_);\n      });\n      if (this.adapter_.isUnbounded()) {\n        this.adapter_.registerResizeHandler(this.resizeHandler_);\n      }\n    }\n\n    this.adapter_.registerInteractionHandler('focus', this.focusHandler_);\n    this.adapter_.registerInteractionHandler('blur', this.blurHandler_);\n  }\n\n  /**\n   * @param {!Event} e\n   * @private\n   */\n  registerDeactivationHandlers_(e) {\n    if (e.type === 'keydown') {\n      this.adapter_.registerInteractionHandler('keyup', this.deactivateHandler_);\n    } else {\n      POINTER_DEACTIVATION_EVENT_TYPES.forEach((type) => {\n        this.adapter_.registerDocumentInteractionHandler(type, this.deactivateHandler_);\n      });\n    }\n  }\n\n  /** @private */\n  deregisterRootHandlers_() {\n    ACTIVATION_EVENT_TYPES.forEach((type) => {\n      this.adapter_.deregisterInteractionHandler(type, this.activateHandler_);\n    });\n    this.adapter_.deregisterInteractionHandler('focus', this.focusHandler_);\n    this.adapter_.deregisterInteractionHandler('blur', this.blurHandler_);\n\n    if (this.adapter_.isUnbounded()) {\n      this.adapter_.deregisterResizeHandler(this.resizeHandler_);\n    }\n  }\n\n  /** @private */\n  deregisterDeactivationHandlers_() {\n    this.adapter_.deregisterInteractionHandler('keyup', this.deactivateHandler_);\n    POINTER_DEACTIVATION_EVENT_TYPES.forEach((type) => {\n      this.adapter_.deregisterDocumentInteractionHandler(type, this.deactivateHandler_);\n    });\n  }\n\n  /** @private */\n  removeCssVars_() {\n    const {strings} = MDCRippleFoundation;\n    Object.keys(strings).forEach((k) => {\n      if (k.indexOf('VAR_') === 0) {\n        this.adapter_.updateCssVariable(strings[k], null);\n      }\n    });\n  }\n\n  /**\n   * @param {?Event} e\n   * @private\n   */\n  activate_(e) {\n    if (this.adapter_.isSurfaceDisabled()) {\n      return;\n    }\n\n    const activationState = this.activationState_;\n    if (activationState.isActivated) {\n      return;\n    }\n\n    // Avoid reacting to follow-on events fired by touch device after an already-processed user interaction\n    const previousActivationEvent = this.previousActivationEvent_;\n    const isSameInteraction = previousActivationEvent && e && previousActivationEvent.type !== e.type;\n    if (isSameInteraction) {\n      return;\n    }\n\n    activationState.isActivated = true;\n    activationState.isProgrammatic = e === null;\n    activationState.activationEvent = e;\n    activationState.wasActivatedByPointer = activationState.isProgrammatic ? false : (\n      e.type === 'mousedown' || e.type === 'touchstart' || e.type === 'pointerdown'\n    );\n\n    const hasActivatedChild =\n      e && activatedTargets.length > 0 && activatedTargets.some((target) => this.adapter_.containsEventTarget(target));\n    if (hasActivatedChild) {\n      // Immediately reset activation state, while preserving logic that prevents touch follow-on events\n      this.resetActivationState_();\n      return;\n    }\n\n    if (e) {\n      activatedTargets.push(/** @type {!EventTarget} */ (e.target));\n      this.registerDeactivationHandlers_(e);\n    }\n\n    activationState.wasElementMadeActive = this.checkElementMadeActive_(e);\n    if (activationState.wasElementMadeActive) {\n      this.animateActivation_();\n    }\n\n    requestAnimationFrame(() => {\n      // Reset array on next frame after the current event has had a chance to bubble to prevent ancestor ripples\n      activatedTargets = [];\n\n      if (!activationState.wasElementMadeActive && (e.key === ' ' || e.keyCode === 32)) {\n        // If space was pressed, try again within an rAF call to detect :active, because different UAs report\n        // active states inconsistently when they're called within event handling code:\n        // - https://bugs.chromium.org/p/chromium/issues/detail?id=635971\n        // - https://bugzilla.mozilla.org/show_bug.cgi?id=1293741\n        // We try first outside rAF to support Edge, which does not exhibit this problem, but will crash if a CSS\n        // variable is set within a rAF callback for a submit button interaction (#2241).\n        activationState.wasElementMadeActive = this.checkElementMadeActive_(e);\n        if (activationState.wasElementMadeActive) {\n          this.animateActivation_();\n        }\n      }\n\n      if (!activationState.wasElementMadeActive) {\n        // Reset activation state immediately if element was not made active.\n        this.activationState_ = this.defaultActivationState_();\n      }\n    });\n  }\n\n  /**\n   * @param {?Event} e\n   * @private\n   */\n  checkElementMadeActive_(e) {\n    return (e && e.type === 'keydown') ? this.adapter_.isSurfaceActive() : true;\n  }\n\n  /**\n   * @param {?Event=} event Optional event containing position information.\n   */\n  activate(event = null) {\n    this.activate_(event);\n  }\n\n  /** @private */\n  animateActivation_() {\n    const {VAR_FG_TRANSLATE_START, VAR_FG_TRANSLATE_END} = MDCRippleFoundation.strings;\n    const {FG_DEACTIVATION, FG_ACTIVATION} = MDCRippleFoundation.cssClasses;\n    const {DEACTIVATION_TIMEOUT_MS} = MDCRippleFoundation.numbers;\n\n    this.layoutInternal_();\n\n    let translateStart = '';\n    let translateEnd = '';\n\n    if (!this.adapter_.isUnbounded()) {\n      const {startPoint, endPoint} = this.getFgTranslationCoordinates_();\n      translateStart = `${startPoint.x}px, ${startPoint.y}px`;\n      translateEnd = `${endPoint.x}px, ${endPoint.y}px`;\n    }\n\n    this.adapter_.updateCssVariable(VAR_FG_TRANSLATE_START, translateStart);\n    this.adapter_.updateCssVariable(VAR_FG_TRANSLATE_END, translateEnd);\n    // Cancel any ongoing activation/deactivation animations\n    clearTimeout(this.activationTimer_);\n    clearTimeout(this.fgDeactivationRemovalTimer_);\n    this.rmBoundedActivationClasses_();\n    this.adapter_.removeClass(FG_DEACTIVATION);\n\n    // Force layout in order to re-trigger the animation.\n    this.adapter_.computeBoundingRect();\n    this.adapter_.addClass(FG_ACTIVATION);\n    this.activationTimer_ = setTimeout(() => this.activationTimerCallback_(), DEACTIVATION_TIMEOUT_MS);\n  }\n\n  /**\n   * @private\n   * @return {{startPoint: PointType, endPoint: PointType}}\n   */\n  getFgTranslationCoordinates_() {\n    const {activationEvent, wasActivatedByPointer} = this.activationState_;\n\n    let startPoint;\n    if (wasActivatedByPointer) {\n      startPoint = Object(_util__WEBPACK_IMPORTED_MODULE_3__[\"getNormalizedEventCoords\"])(\n        /** @type {!Event} */ (activationEvent),\n        this.adapter_.getWindowPageOffset(), this.adapter_.computeBoundingRect()\n      );\n    } else {\n      startPoint = {\n        x: this.frame_.width / 2,\n        y: this.frame_.height / 2,\n      };\n    }\n    // Center the element around the start point.\n    startPoint = {\n      x: startPoint.x - (this.initialSize_ / 2),\n      y: startPoint.y - (this.initialSize_ / 2),\n    };\n\n    const endPoint = {\n      x: (this.frame_.width / 2) - (this.initialSize_ / 2),\n      y: (this.frame_.height / 2) - (this.initialSize_ / 2),\n    };\n\n    return {startPoint, endPoint};\n  }\n\n  /** @private */\n  runDeactivationUXLogicIfReady_() {\n    // This method is called both when a pointing device is released, and when the activation animation ends.\n    // The deactivation animation should only run after both of those occur.\n    const {FG_DEACTIVATION} = MDCRippleFoundation.cssClasses;\n    const {hasDeactivationUXRun, isActivated} = this.activationState_;\n    const activationHasEnded = hasDeactivationUXRun || !isActivated;\n\n    if (activationHasEnded && this.activationAnimationHasEnded_) {\n      this.rmBoundedActivationClasses_();\n      this.adapter_.addClass(FG_DEACTIVATION);\n      this.fgDeactivationRemovalTimer_ = setTimeout(() => {\n        this.adapter_.removeClass(FG_DEACTIVATION);\n      }, _constants__WEBPACK_IMPORTED_MODULE_2__[\"numbers\"].FG_DEACTIVATION_MS);\n    }\n  }\n\n  /** @private */\n  rmBoundedActivationClasses_() {\n    const {FG_ACTIVATION} = MDCRippleFoundation.cssClasses;\n    this.adapter_.removeClass(FG_ACTIVATION);\n    this.activationAnimationHasEnded_ = false;\n    this.adapter_.computeBoundingRect();\n  }\n\n  resetActivationState_() {\n    this.previousActivationEvent_ = this.activationState_.activationEvent;\n    this.activationState_ = this.defaultActivationState_();\n    // Touch devices may fire additional events for the same interaction within a short time.\n    // Store the previous event until it's safe to assume that subsequent events are for new interactions.\n    setTimeout(() => this.previousActivationEvent_ = null, MDCRippleFoundation.numbers.TAP_DELAY_MS);\n  }\n\n  /**\n   * @param {?Event} e\n   * @private\n   */\n  deactivate_(e) {\n    const activationState = this.activationState_;\n    // This can happen in scenarios such as when you have a keyup event that blurs the element.\n    if (!activationState.isActivated) {\n      return;\n    }\n\n    const state = /** @type {!ActivationStateType} */ (Object.assign({}, activationState));\n\n    if (activationState.isProgrammatic) {\n      const evtObject = null;\n      requestAnimationFrame(() => this.animateDeactivation_(evtObject, state));\n      this.resetActivationState_();\n    } else {\n      this.deregisterDeactivationHandlers_();\n      requestAnimationFrame(() => {\n        this.activationState_.hasDeactivationUXRun = true;\n        this.animateDeactivation_(e, state);\n        this.resetActivationState_();\n      });\n    }\n  }\n\n  /**\n   * @param {?Event=} event Optional event containing position information.\n   */\n  deactivate(event = null) {\n    this.deactivate_(event);\n  }\n\n  /**\n   * @param {Event} e\n   * @param {!ActivationStateType} options\n   * @private\n   */\n  animateDeactivation_(e, {wasActivatedByPointer, wasElementMadeActive}) {\n    if (wasActivatedByPointer || wasElementMadeActive) {\n      this.runDeactivationUXLogicIfReady_();\n    }\n  }\n\n  layout() {\n    if (this.layoutFrame_) {\n      cancelAnimationFrame(this.layoutFrame_);\n    }\n    this.layoutFrame_ = requestAnimationFrame(() => {\n      this.layoutInternal_();\n      this.layoutFrame_ = 0;\n    });\n  }\n\n  /** @private */\n  layoutInternal_() {\n    this.frame_ = this.adapter_.computeBoundingRect();\n    const maxDim = Math.max(this.frame_.height, this.frame_.width);\n\n    // Surface diameter is treated differently for unbounded vs. bounded ripples.\n    // Unbounded ripple diameter is calculated smaller since the surface is expected to already be padded appropriately\n    // to extend the hitbox, and the ripple is expected to meet the edges of the padded hitbox (which is typically\n    // square). Bounded ripples, on the other hand, are fully expected to expand beyond the surface's longest diameter\n    // (calculated based on the diagonal plus a constant padding), and are clipped at the surface's border via\n    // `overflow: hidden`.\n    const getBoundedRadius = () => {\n      const hypotenuse = Math.sqrt(Math.pow(this.frame_.width, 2) + Math.pow(this.frame_.height, 2));\n      return hypotenuse + MDCRippleFoundation.numbers.PADDING;\n    };\n\n    this.maxRadius_ = this.adapter_.isUnbounded() ? maxDim : getBoundedRadius();\n\n    // Ripple is sized as a fraction of the largest dimension of the surface, then scales up using a CSS scale transform\n    this.initialSize_ = maxDim * MDCRippleFoundation.numbers.INITIAL_ORIGIN_SCALE;\n    this.fgScale_ = this.maxRadius_ / this.initialSize_;\n\n    this.updateLayoutCssVars_();\n  }\n\n  /** @private */\n  updateLayoutCssVars_() {\n    const {\n      VAR_FG_SIZE, VAR_LEFT, VAR_TOP, VAR_FG_SCALE,\n    } = MDCRippleFoundation.strings;\n\n    this.adapter_.updateCssVariable(VAR_FG_SIZE, `${this.initialSize_}px`);\n    this.adapter_.updateCssVariable(VAR_FG_SCALE, this.fgScale_);\n\n    if (this.adapter_.isUnbounded()) {\n      this.unboundedCoords_ = {\n        left: Math.round((this.frame_.width / 2) - (this.initialSize_ / 2)),\n        top: Math.round((this.frame_.height / 2) - (this.initialSize_ / 2)),\n      };\n\n      this.adapter_.updateCssVariable(VAR_LEFT, `${this.unboundedCoords_.left}px`);\n      this.adapter_.updateCssVariable(VAR_TOP, `${this.unboundedCoords_.top}px`);\n    }\n  }\n\n  /** @param {boolean} unbounded */\n  setUnbounded(unbounded) {\n    const {UNBOUNDED} = MDCRippleFoundation.cssClasses;\n    if (unbounded) {\n      this.adapter_.addClass(UNBOUNDED);\n    } else {\n      this.adapter_.removeClass(UNBOUNDED);\n    }\n  }\n\n  handleFocus() {\n    requestAnimationFrame(() =>\n      this.adapter_.addClass(MDCRippleFoundation.cssClasses.BG_FOCUSED));\n  }\n\n  handleBlur() {\n    requestAnimationFrame(() =>\n      this.adapter_.removeClass(MDCRippleFoundation.cssClasses.BG_FOCUSED));\n  }\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (MDCRippleFoundation);\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/ripple/foundation.js?");

/***/ }),

/***/ "../../node_modules/@material/ripple/index.js":
/*!*************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/ripple/index.js ***!
  \*************************************************************************************************************/
/*! exports provided: MDCRipple, MDCRippleFoundation, RippleCapableSurface, util */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"MDCRipple\", function() { return MDCRipple; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"RippleCapableSurface\", function() { return RippleCapableSurface; });\n/* harmony import */ var _material_base_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @material/base/component */ \"../../node_modules/@material/base/component.js\");\n/* harmony import */ var _adapter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./adapter */ \"../../node_modules/@material/ripple/adapter.js\");\n/* harmony import */ var _foundation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./foundation */ \"../../node_modules/@material/ripple/foundation.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"MDCRippleFoundation\", function() { return _foundation__WEBPACK_IMPORTED_MODULE_2__[\"default\"]; });\n\n/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util */ \"../../node_modules/@material/ripple/util.js\");\n/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, \"util\", function() { return _util__WEBPACK_IMPORTED_MODULE_3__; });\n/**\n * @license\n * Copyright 2016 Google Inc.\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\n\n\n\n\n\n/**\n * @extends MDCComponent<!MDCRippleFoundation>\n */\nclass MDCRipple extends _material_base_component__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n  /** @param {...?} args */\n  constructor(...args) {\n    super(...args);\n\n    /** @type {boolean} */\n    this.disabled = false;\n\n    /** @private {boolean} */\n    this.unbounded_;\n  }\n\n  /**\n   * @param {!Element} root\n   * @param {{isUnbounded: (boolean|undefined)}=} options\n   * @return {!MDCRipple}\n   */\n  static attachTo(root, {isUnbounded = undefined} = {}) {\n    const ripple = new MDCRipple(root);\n    // Only override unbounded behavior if option is explicitly specified\n    if (isUnbounded !== undefined) {\n      ripple.unbounded = /** @type {boolean} */ (isUnbounded);\n    }\n    return ripple;\n  }\n\n  /**\n   * @param {!RippleCapableSurface} instance\n   * @return {!MDCRippleAdapter}\n   */\n  static createAdapter(instance) {\n    const MATCHES = _util__WEBPACK_IMPORTED_MODULE_3__[\"getMatchesProperty\"](HTMLElement.prototype);\n\n    return {\n      browserSupportsCssVars: () => _util__WEBPACK_IMPORTED_MODULE_3__[\"supportsCssVariables\"](window),\n      isUnbounded: () => instance.unbounded,\n      isSurfaceActive: () => instance.root_[MATCHES](':active'),\n      isSurfaceDisabled: () => instance.disabled,\n      addClass: (className) => instance.root_.classList.add(className),\n      removeClass: (className) => instance.root_.classList.remove(className),\n      containsEventTarget: (target) => instance.root_.contains(target),\n      registerInteractionHandler: (evtType, handler) =>\n        instance.root_.addEventListener(evtType, handler, _util__WEBPACK_IMPORTED_MODULE_3__[\"applyPassive\"]()),\n      deregisterInteractionHandler: (evtType, handler) =>\n        instance.root_.removeEventListener(evtType, handler, _util__WEBPACK_IMPORTED_MODULE_3__[\"applyPassive\"]()),\n      registerDocumentInteractionHandler: (evtType, handler) =>\n        document.documentElement.addEventListener(evtType, handler, _util__WEBPACK_IMPORTED_MODULE_3__[\"applyPassive\"]()),\n      deregisterDocumentInteractionHandler: (evtType, handler) =>\n        document.documentElement.removeEventListener(evtType, handler, _util__WEBPACK_IMPORTED_MODULE_3__[\"applyPassive\"]()),\n      registerResizeHandler: (handler) => window.addEventListener('resize', handler),\n      deregisterResizeHandler: (handler) => window.removeEventListener('resize', handler),\n      updateCssVariable: (varName, value) => instance.root_.style.setProperty(varName, value),\n      computeBoundingRect: () => instance.root_.getBoundingClientRect(),\n      getWindowPageOffset: () => ({x: window.pageXOffset, y: window.pageYOffset}),\n    };\n  }\n\n  /** @return {boolean} */\n  get unbounded() {\n    return this.unbounded_;\n  }\n\n  /** @param {boolean} unbounded */\n  set unbounded(unbounded) {\n    this.unbounded_ = Boolean(unbounded);\n    this.setUnbounded_();\n  }\n\n  /**\n   * Closure Compiler throws an access control error when directly accessing a\n   * protected or private property inside a getter/setter, like unbounded above.\n   * By accessing the protected property inside a method, we solve that problem.\n   * That's why this function exists.\n   * @private\n   */\n  setUnbounded_() {\n    this.foundation_.setUnbounded(this.unbounded_);\n  }\n\n  activate() {\n    this.foundation_.activate();\n  }\n\n  deactivate() {\n    this.foundation_.deactivate();\n  }\n\n  layout() {\n    this.foundation_.layout();\n  }\n\n  /**\n   * @return {!MDCRippleFoundation}\n   * @override\n   */\n  getDefaultFoundation() {\n    return new _foundation__WEBPACK_IMPORTED_MODULE_2__[\"default\"](MDCRipple.createAdapter(this));\n  }\n\n  /** @override */\n  initialSyncWithDOM() {\n    this.unbounded = 'mdcRippleIsUnbounded' in this.root_.dataset;\n  }\n}\n\n/**\n * See Material Design spec for more details on when to use ripples.\n * https://material.io/guidelines/motion/choreography.html#choreography-creation\n * @record\n */\nclass RippleCapableSurface {}\n\n/** @protected {!Element} */\nRippleCapableSurface.prototype.root_;\n\n/**\n * Whether or not the ripple bleeds out of the bounds of the element.\n * @type {boolean|undefined}\n */\nRippleCapableSurface.prototype.unbounded;\n\n/**\n * Whether or not the ripple is attached to a disabled component.\n * @type {boolean|undefined}\n */\nRippleCapableSurface.prototype.disabled;\n\n\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/ripple/index.js?");

/***/ }),

/***/ "../../node_modules/@material/ripple/util.js":
/*!************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/ripple/util.js ***!
  \************************************************************************************************************/
/*! exports provided: supportsCssVariables, applyPassive, getMatchesProperty, getNormalizedEventCoords */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"supportsCssVariables\", function() { return supportsCssVariables; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"applyPassive\", function() { return applyPassive; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getMatchesProperty\", function() { return getMatchesProperty; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getNormalizedEventCoords\", function() { return getNormalizedEventCoords; });\n/**\n * @license\n * Copyright 2016 Google Inc.\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\n/**\n * Stores result from supportsCssVariables to avoid redundant processing to detect CSS custom variable support.\n * @private {boolean|undefined}\n */\nlet supportsCssVariables_;\n\n/**\n * Stores result from applyPassive to avoid redundant processing to detect passive event listener support.\n * @private {boolean|undefined}\n */\nlet supportsPassive_;\n\n/**\n * @param {!Window} windowObj\n * @return {boolean}\n */\nfunction detectEdgePseudoVarBug(windowObj) {\n  // Detect versions of Edge with buggy var() support\n  // See: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11495448/\n  const document = windowObj.document;\n  const node = document.createElement('div');\n  node.className = 'mdc-ripple-surface--test-edge-var-bug';\n  document.body.appendChild(node);\n\n  // The bug exists if ::before style ends up propagating to the parent element.\n  // Additionally, getComputedStyle returns null in iframes with display: \"none\" in Firefox,\n  // but Firefox is known to support CSS custom properties correctly.\n  // See: https://bugzilla.mozilla.org/show_bug.cgi?id=548397\n  const computedStyle = windowObj.getComputedStyle(node);\n  const hasPseudoVarBug = computedStyle !== null && computedStyle.borderTopStyle === 'solid';\n  node.remove();\n  return hasPseudoVarBug;\n}\n\n/**\n * @param {!Window} windowObj\n * @param {boolean=} forceRefresh\n * @return {boolean|undefined}\n */\n\nfunction supportsCssVariables(windowObj, forceRefresh = false) {\n  let supportsCssVariables = supportsCssVariables_;\n  if (typeof supportsCssVariables_ === 'boolean' && !forceRefresh) {\n    return supportsCssVariables;\n  }\n\n  const supportsFunctionPresent = windowObj.CSS && typeof windowObj.CSS.supports === 'function';\n  if (!supportsFunctionPresent) {\n    return;\n  }\n\n  const explicitlySupportsCssVars = windowObj.CSS.supports('--css-vars', 'yes');\n  // See: https://bugs.webkit.org/show_bug.cgi?id=154669\n  // See: README section on Safari\n  const weAreFeatureDetectingSafari10plus = (\n    windowObj.CSS.supports('(--css-vars: yes)') &&\n    windowObj.CSS.supports('color', '#00000000')\n  );\n\n  if (explicitlySupportsCssVars || weAreFeatureDetectingSafari10plus) {\n    supportsCssVariables = !detectEdgePseudoVarBug(windowObj);\n  } else {\n    supportsCssVariables = false;\n  }\n\n  if (!forceRefresh) {\n    supportsCssVariables_ = supportsCssVariables;\n  }\n  return supportsCssVariables;\n}\n\n//\n/**\n * Determine whether the current browser supports passive event listeners, and if so, use them.\n * @param {!Window=} globalObj\n * @param {boolean=} forceRefresh\n * @return {boolean|{passive: boolean}}\n */\nfunction applyPassive(globalObj = window, forceRefresh = false) {\n  if (supportsPassive_ === undefined || forceRefresh) {\n    let isSupported = false;\n    try {\n      globalObj.document.addEventListener('test', null, {get passive() {\n        isSupported = true;\n      }});\n    } catch (e) { }\n\n    supportsPassive_ = isSupported;\n  }\n\n  return supportsPassive_ ? {passive: true} : false;\n}\n\n/**\n * @param {!Object} HTMLElementPrototype\n * @return {!Array<string>}\n */\nfunction getMatchesProperty(HTMLElementPrototype) {\n  return [\n    'webkitMatchesSelector', 'msMatchesSelector', 'matches',\n  ].filter((p) => p in HTMLElementPrototype).pop();\n}\n\n/**\n * @param {!Event} ev\n * @param {{x: number, y: number}} pageOffset\n * @param {!ClientRect} clientRect\n * @return {{x: number, y: number}}\n */\nfunction getNormalizedEventCoords(ev, pageOffset, clientRect) {\n  const {x, y} = pageOffset;\n  const documentX = x + clientRect.left;\n  const documentY = y + clientRect.top;\n\n  let normalizedX;\n  let normalizedY;\n  // Determine touch point relative to the ripple container.\n  if (ev.type === 'touchstart') {\n    normalizedX = ev.changedTouches[0].pageX - documentX;\n    normalizedY = ev.changedTouches[0].pageY - documentY;\n  } else {\n    normalizedX = ev.pageX - documentX;\n    normalizedY = ev.pageY - documentY;\n  }\n\n  return {x: normalizedX, y: normalizedY};\n}\n\n\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/@material/ripple/util.js?");

/***/ }),

/***/ "../../node_modules/bind-decorator/index.js":
/*!***********************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/bind-decorator/index.js ***!
  \***********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar constants;\n(function (constants) {\n    constants.typeOfFunction = 'function';\n    constants.boolTrue = true;\n})(constants || (constants = {}));\nfunction bind(target, propertyKey, descriptor) {\n    if (!descriptor || (typeof descriptor.value !== constants.typeOfFunction)) {\n        throw new TypeError(\"Only methods can be decorated with @bind. <\" + propertyKey + \"> is not a method!\");\n    }\n    return {\n        configurable: constants.boolTrue,\n        get: function () {\n            var bound = descriptor.value.bind(this);\n            // Credits to https://github.com/andreypopp/autobind-decorator for memoizing the result of bind against a symbol on the instance.\n            Object.defineProperty(this, propertyKey, {\n                value: bound,\n                configurable: constants.boolTrue,\n                writable: constants.boolTrue\n            });\n            return bound;\n        }\n    };\n}\nexports.bind = bind;\nexports.default = bind;\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/bind-decorator/index.js?");

/***/ }),

/***/ "../../node_modules/css-loader/dist/cjs.js!../../node_modules/preact-material-components/Button/style.css":
/*!**********************************************************************************************************************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/css-loader/dist/cjs.js!C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact-material-components/Button/style.css ***!
  \**********************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../css-loader/dist/runtime/api.js */ \"../../node_modules/css-loader/dist/runtime/api.js\");\nexports = ___CSS_LOADER_API_IMPORT___(false);\n// Module\nexports.push([module.i, \"/*!\\n Material Components for the Web\\n Copyright (c) 2018 Google Inc.\\n License: MIT\\n*/\\n@-webkit-keyframes mdc-ripple-fg-radius-in {\\n  from {\\n    -webkit-animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\\n            animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\\n    -webkit-transform: translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1);\\n            transform: translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1); }\\n  to {\\n    -webkit-transform: translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1));\\n            transform: translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1)); } }\\n\\n@keyframes mdc-ripple-fg-radius-in {\\n  from {\\n    -webkit-animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\\n            animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\\n    -webkit-transform: translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1);\\n            transform: translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1); }\\n  to {\\n    -webkit-transform: translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1));\\n            transform: translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1)); } }\\n\\n@-webkit-keyframes mdc-ripple-fg-opacity-in {\\n  from {\\n    -webkit-animation-timing-function: linear;\\n            animation-timing-function: linear;\\n    opacity: 0; }\\n  to {\\n    opacity: var(--mdc-ripple-fg-opacity, 0); } }\\n\\n@keyframes mdc-ripple-fg-opacity-in {\\n  from {\\n    -webkit-animation-timing-function: linear;\\n            animation-timing-function: linear;\\n    opacity: 0; }\\n  to {\\n    opacity: var(--mdc-ripple-fg-opacity, 0); } }\\n\\n@-webkit-keyframes mdc-ripple-fg-opacity-out {\\n  from {\\n    -webkit-animation-timing-function: linear;\\n            animation-timing-function: linear;\\n    opacity: var(--mdc-ripple-fg-opacity, 0); }\\n  to {\\n    opacity: 0; } }\\n\\n@keyframes mdc-ripple-fg-opacity-out {\\n  from {\\n    -webkit-animation-timing-function: linear;\\n            animation-timing-function: linear;\\n    opacity: var(--mdc-ripple-fg-opacity, 0); }\\n  to {\\n    opacity: 0; } }\\n\\n.mdc-ripple-surface--test-edge-var-bug {\\n  --mdc-ripple-surface-test-edge-var: 1px solid #000;\\n  visibility: hidden; }\\n  .mdc-ripple-surface--test-edge-var-bug::before {\\n    border: var(--mdc-ripple-surface-test-edge-var); }\\n\\n.mdc-button {\\n  font-family: Roboto, sans-serif;\\n  -moz-osx-font-smoothing: grayscale;\\n  -webkit-font-smoothing: antialiased;\\n  font-size: 0.875rem;\\n  line-height: 2.25rem;\\n  font-weight: 500;\\n  letter-spacing: 0.08929em;\\n  text-decoration: none;\\n  text-transform: uppercase;\\n  --mdc-ripple-fg-size: 0;\\n  --mdc-ripple-left: 0;\\n  --mdc-ripple-top: 0;\\n  --mdc-ripple-fg-scale: 1;\\n  --mdc-ripple-fg-translate-end: 0;\\n  --mdc-ripple-fg-translate-start: 0;\\n  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\\n  will-change: transform, opacity;\\n  padding: 0 8px 0 8px;\\n  display: inline-flex;\\n  position: relative;\\n  align-items: center;\\n  justify-content: center;\\n  box-sizing: border-box;\\n  min-width: 64px;\\n  height: 36px;\\n  border: none;\\n  outline: none;\\n  /* @alternate */\\n  line-height: inherit;\\n  -webkit-user-select: none;\\n     -moz-user-select: none;\\n      -ms-user-select: none;\\n          user-select: none;\\n  -webkit-appearance: none;\\n  overflow: hidden;\\n  vertical-align: middle;\\n  border-radius: 2px; }\\n  .mdc-button::before, .mdc-button::after {\\n    position: absolute;\\n    border-radius: 50%;\\n    opacity: 0;\\n    pointer-events: none;\\n    content: \\\"\\\"; }\\n  .mdc-button::before {\\n    transition: opacity 15ms linear;\\n    z-index: 1; }\\n  .mdc-button.mdc-ripple-upgraded::before {\\n    -webkit-transform: scale(var(--mdc-ripple-fg-scale, 1));\\n            transform: scale(var(--mdc-ripple-fg-scale, 1)); }\\n  .mdc-button.mdc-ripple-upgraded::after {\\n    top: 0;\\n    /* @noflip */\\n    left: 0;\\n    -webkit-transform: scale(0);\\n            transform: scale(0);\\n    -webkit-transform-origin: center center;\\n            transform-origin: center center; }\\n  .mdc-button.mdc-ripple-upgraded--unbounded::after {\\n    top: var(--mdc-ripple-top, 0);\\n    /* @noflip */\\n    left: var(--mdc-ripple-left, 0); }\\n  .mdc-button.mdc-ripple-upgraded--foreground-activation::after {\\n    -webkit-animation: 225ms mdc-ripple-fg-radius-in forwards, 75ms mdc-ripple-fg-opacity-in forwards;\\n            animation: 225ms mdc-ripple-fg-radius-in forwards, 75ms mdc-ripple-fg-opacity-in forwards; }\\n  .mdc-button.mdc-ripple-upgraded--foreground-deactivation::after {\\n    -webkit-animation: 150ms mdc-ripple-fg-opacity-out;\\n            animation: 150ms mdc-ripple-fg-opacity-out;\\n    -webkit-transform: translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1));\\n            transform: translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1)); }\\n  .mdc-button::before, .mdc-button::after {\\n    top: calc(50% - 100%);\\n    /* @noflip */\\n    left: calc(50% - 100%);\\n    width: 200%;\\n    height: 200%; }\\n  .mdc-button.mdc-ripple-upgraded::after {\\n    width: var(--mdc-ripple-fg-size, 100%);\\n    height: var(--mdc-ripple-fg-size, 100%); }\\n  .mdc-button::-moz-focus-inner {\\n    padding: 0;\\n    border: 0; }\\n  .mdc-button:active {\\n    outline: none; }\\n  .mdc-button:hover {\\n    cursor: pointer; }\\n  .mdc-button:disabled {\\n    background-color: transparent;\\n    color: rgba(0, 0, 0, 0.37);\\n    cursor: default;\\n    pointer-events: none; }\\n  .mdc-button:not(:disabled) {\\n    background-color: transparent; }\\n  .mdc-button:not(:disabled) {\\n    color: #6200ee;\\n    /* @alternate */\\n    color: var(--mdc-theme-primary, #6200ee); }\\n  .mdc-button::before, .mdc-button::after {\\n    background-color: #6200ee; }\\n    @supports not (-ms-ime-align: auto) {\\n      .mdc-button::before, .mdc-button::after {\\n        /* @alternate */\\n        background-color: var(--mdc-theme-primary, #6200ee); } }\\n  .mdc-button:hover::before {\\n    opacity: 0.04; }\\n  .mdc-button:not(.mdc-ripple-upgraded):focus::before, .mdc-button.mdc-ripple-upgraded--background-focused::before {\\n    transition-duration: 75ms;\\n    opacity: 0.12; }\\n  .mdc-button:not(.mdc-ripple-upgraded)::after {\\n    transition: opacity 150ms linear; }\\n  .mdc-button:not(.mdc-ripple-upgraded):active::after {\\n    transition-duration: 75ms;\\n    opacity: 0.16; }\\n  .mdc-button.mdc-ripple-upgraded {\\n    --mdc-ripple-fg-opacity: 0.16; }\\n  .mdc-button .mdc-button__icon {\\n    /* @noflip */\\n    margin-left: 0;\\n    /* @noflip */\\n    margin-right: 8px;\\n    display: inline-block;\\n    width: 18px;\\n    height: 18px;\\n    font-size: 18px;\\n    vertical-align: top; }\\n    [dir=\\\"rtl\\\"] .mdc-button .mdc-button__icon, .mdc-button .mdc-button__icon[dir=\\\"rtl\\\"] {\\n      /* @noflip */\\n      margin-left: 8px;\\n      /* @noflip */\\n      margin-right: 0; }\\n  .mdc-button svg.mdc-button__icon {\\n    fill: currentColor; }\\n\\n.mdc-button--raised .mdc-button__icon,\\n.mdc-button--unelevated .mdc-button__icon,\\n.mdc-button--outlined .mdc-button__icon {\\n  /* @noflip */\\n  margin-left: -4px;\\n  /* @noflip */\\n  margin-right: 8px; }\\n  [dir=\\\"rtl\\\"] .mdc-button--raised .mdc-button__icon, .mdc-button--raised .mdc-button__icon[dir=\\\"rtl\\\"], [dir=\\\"rtl\\\"]\\n  .mdc-button--unelevated .mdc-button__icon,\\n  .mdc-button--unelevated .mdc-button__icon[dir=\\\"rtl\\\"], [dir=\\\"rtl\\\"]\\n  .mdc-button--outlined .mdc-button__icon,\\n  .mdc-button--outlined .mdc-button__icon[dir=\\\"rtl\\\"] {\\n    /* @noflip */\\n    margin-left: 8px;\\n    /* @noflip */\\n    margin-right: -4px; }\\n\\n.mdc-button--raised,\\n.mdc-button--unelevated {\\n  padding: 0 16px 0 16px; }\\n  .mdc-button--raised:disabled,\\n  .mdc-button--unelevated:disabled {\\n    background-color: rgba(0, 0, 0, 0.12);\\n    color: rgba(0, 0, 0, 0.37); }\\n  .mdc-button--raised:not(:disabled),\\n  .mdc-button--unelevated:not(:disabled) {\\n    background-color: #6200ee; }\\n    @supports not (-ms-ime-align: auto) {\\n      .mdc-button--raised:not(:disabled),\\n      .mdc-button--unelevated:not(:disabled) {\\n        /* @alternate */\\n        background-color: var(--mdc-theme-primary, #6200ee); } }\\n  .mdc-button--raised:not(:disabled),\\n  .mdc-button--unelevated:not(:disabled) {\\n    color: #fff;\\n    /* @alternate */\\n    color: var(--mdc-theme-on-primary, #fff); }\\n  .mdc-button--raised::before, .mdc-button--raised::after,\\n  .mdc-button--unelevated::before,\\n  .mdc-button--unelevated::after {\\n    background-color: #fff; }\\n    @supports not (-ms-ime-align: auto) {\\n      .mdc-button--raised::before, .mdc-button--raised::after,\\n      .mdc-button--unelevated::before,\\n      .mdc-button--unelevated::after {\\n        /* @alternate */\\n        background-color: var(--mdc-theme-on-primary, #fff); } }\\n  .mdc-button--raised:hover::before,\\n  .mdc-button--unelevated:hover::before {\\n    opacity: 0.08; }\\n  .mdc-button--raised:not(.mdc-ripple-upgraded):focus::before, .mdc-button--raised.mdc-ripple-upgraded--background-focused::before,\\n  .mdc-button--unelevated:not(.mdc-ripple-upgraded):focus::before,\\n  .mdc-button--unelevated.mdc-ripple-upgraded--background-focused::before {\\n    transition-duration: 75ms;\\n    opacity: 0.24; }\\n  .mdc-button--raised:not(.mdc-ripple-upgraded)::after,\\n  .mdc-button--unelevated:not(.mdc-ripple-upgraded)::after {\\n    transition: opacity 150ms linear; }\\n  .mdc-button--raised:not(.mdc-ripple-upgraded):active::after,\\n  .mdc-button--unelevated:not(.mdc-ripple-upgraded):active::after {\\n    transition-duration: 75ms;\\n    opacity: 0.32; }\\n  .mdc-button--raised.mdc-ripple-upgraded,\\n  .mdc-button--unelevated.mdc-ripple-upgraded {\\n    --mdc-ripple-fg-opacity: 0.32; }\\n\\n.mdc-button--raised {\\n  box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);\\n  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1); }\\n  .mdc-button--raised:hover, .mdc-button--raised:focus {\\n    box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12); }\\n  .mdc-button--raised:active {\\n    box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12); }\\n  .mdc-button--raised:disabled {\\n    box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12); }\\n\\n.mdc-button--outlined {\\n  border-style: solid;\\n  padding: 0 14px 0 14px;\\n  border-width: 2px; }\\n  .mdc-button--outlined:disabled {\\n    border-color: rgba(0, 0, 0, 0.37); }\\n  .mdc-button--outlined:not(:disabled) {\\n    border-color: #6200ee;\\n    /* @alternate */\\n    border-color: var(--mdc-theme-primary, #6200ee); }\\n\\n.mdc-button--dense {\\n  height: 32px;\\n  font-size: .8125rem; }\", \"\"]);\n// Exports\nmodule.exports = exports;\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact-material-components/Button/style.css?C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/css-loader/dist/cjs.js");

/***/ }),

/***/ "../../node_modules/css-loader/dist/cjs.js!../../node_modules/preact-material-components/LinearProgress/style.css":
/*!******************************************************************************************************************************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/css-loader/dist/cjs.js!C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact-material-components/LinearProgress/style.css ***!
  \******************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../css-loader/dist/runtime/api.js */ \"../../node_modules/css-loader/dist/runtime/api.js\");\nexports = ___CSS_LOADER_API_IMPORT___(false);\n// Module\nexports.push([module.i, \"/*!\\n Material Components for the Web\\n Copyright (c) 2018 Google Inc.\\n License: MIT\\n*/\\n@-webkit-keyframes primary-indeterminate-translate {\\n  0% {\\n    -webkit-transform: translateX(0);\\n            transform: translateX(0); }\\n  20% {\\n    -webkit-animation-timing-function: cubic-bezier(0.5, 0, 0.70173, 0.49582);\\n            animation-timing-function: cubic-bezier(0.5, 0, 0.70173, 0.49582);\\n    -webkit-transform: translateX(0);\\n            transform: translateX(0); }\\n  59.15% {\\n    -webkit-animation-timing-function: cubic-bezier(0.30244, 0.38135, 0.55, 0.95635);\\n            animation-timing-function: cubic-bezier(0.30244, 0.38135, 0.55, 0.95635);\\n    -webkit-transform: translateX(83.67142%);\\n            transform: translateX(83.67142%); }\\n  100% {\\n    -webkit-transform: translateX(200.61106%);\\n            transform: translateX(200.61106%); } }\\n\\n@keyframes primary-indeterminate-translate {\\n  0% {\\n    -webkit-transform: translateX(0);\\n            transform: translateX(0); }\\n  20% {\\n    -webkit-animation-timing-function: cubic-bezier(0.5, 0, 0.70173, 0.49582);\\n            animation-timing-function: cubic-bezier(0.5, 0, 0.70173, 0.49582);\\n    -webkit-transform: translateX(0);\\n            transform: translateX(0); }\\n  59.15% {\\n    -webkit-animation-timing-function: cubic-bezier(0.30244, 0.38135, 0.55, 0.95635);\\n            animation-timing-function: cubic-bezier(0.30244, 0.38135, 0.55, 0.95635);\\n    -webkit-transform: translateX(83.67142%);\\n            transform: translateX(83.67142%); }\\n  100% {\\n    -webkit-transform: translateX(200.61106%);\\n            transform: translateX(200.61106%); } }\\n\\n@-webkit-keyframes primary-indeterminate-scale {\\n  0% {\\n    -webkit-transform: scaleX(0.08);\\n            transform: scaleX(0.08); }\\n  36.65% {\\n    -webkit-animation-timing-function: cubic-bezier(0.33473, 0.12482, 0.78584, 1);\\n            animation-timing-function: cubic-bezier(0.33473, 0.12482, 0.78584, 1);\\n    -webkit-transform: scaleX(0.08);\\n            transform: scaleX(0.08); }\\n  69.15% {\\n    -webkit-animation-timing-function: cubic-bezier(0.06, 0.11, 0.6, 1);\\n            animation-timing-function: cubic-bezier(0.06, 0.11, 0.6, 1);\\n    -webkit-transform: scaleX(0.66148);\\n            transform: scaleX(0.66148); }\\n  100% {\\n    -webkit-transform: scaleX(0.08);\\n            transform: scaleX(0.08); } }\\n\\n@keyframes primary-indeterminate-scale {\\n  0% {\\n    -webkit-transform: scaleX(0.08);\\n            transform: scaleX(0.08); }\\n  36.65% {\\n    -webkit-animation-timing-function: cubic-bezier(0.33473, 0.12482, 0.78584, 1);\\n            animation-timing-function: cubic-bezier(0.33473, 0.12482, 0.78584, 1);\\n    -webkit-transform: scaleX(0.08);\\n            transform: scaleX(0.08); }\\n  69.15% {\\n    -webkit-animation-timing-function: cubic-bezier(0.06, 0.11, 0.6, 1);\\n            animation-timing-function: cubic-bezier(0.06, 0.11, 0.6, 1);\\n    -webkit-transform: scaleX(0.66148);\\n            transform: scaleX(0.66148); }\\n  100% {\\n    -webkit-transform: scaleX(0.08);\\n            transform: scaleX(0.08); } }\\n\\n@-webkit-keyframes secondary-indeterminate-translate {\\n  0% {\\n    -webkit-animation-timing-function: cubic-bezier(0.15, 0, 0.51506, 0.40969);\\n            animation-timing-function: cubic-bezier(0.15, 0, 0.51506, 0.40969);\\n    -webkit-transform: translateX(0);\\n            transform: translateX(0); }\\n  25% {\\n    -webkit-animation-timing-function: cubic-bezier(0.31033, 0.28406, 0.8, 0.73371);\\n            animation-timing-function: cubic-bezier(0.31033, 0.28406, 0.8, 0.73371);\\n    -webkit-transform: translateX(37.65191%);\\n            transform: translateX(37.65191%); }\\n  48.35% {\\n    -webkit-animation-timing-function: cubic-bezier(0.4, 0.62704, 0.6, 0.90203);\\n            animation-timing-function: cubic-bezier(0.4, 0.62704, 0.6, 0.90203);\\n    -webkit-transform: translateX(84.38617%);\\n            transform: translateX(84.38617%); }\\n  100% {\\n    -webkit-transform: translateX(160.27778%);\\n            transform: translateX(160.27778%); } }\\n\\n@keyframes secondary-indeterminate-translate {\\n  0% {\\n    -webkit-animation-timing-function: cubic-bezier(0.15, 0, 0.51506, 0.40969);\\n            animation-timing-function: cubic-bezier(0.15, 0, 0.51506, 0.40969);\\n    -webkit-transform: translateX(0);\\n            transform: translateX(0); }\\n  25% {\\n    -webkit-animation-timing-function: cubic-bezier(0.31033, 0.28406, 0.8, 0.73371);\\n            animation-timing-function: cubic-bezier(0.31033, 0.28406, 0.8, 0.73371);\\n    -webkit-transform: translateX(37.65191%);\\n            transform: translateX(37.65191%); }\\n  48.35% {\\n    -webkit-animation-timing-function: cubic-bezier(0.4, 0.62704, 0.6, 0.90203);\\n            animation-timing-function: cubic-bezier(0.4, 0.62704, 0.6, 0.90203);\\n    -webkit-transform: translateX(84.38617%);\\n            transform: translateX(84.38617%); }\\n  100% {\\n    -webkit-transform: translateX(160.27778%);\\n            transform: translateX(160.27778%); } }\\n\\n@-webkit-keyframes secondary-indeterminate-scale {\\n  0% {\\n    -webkit-animation-timing-function: cubic-bezier(0.20503, 0.05705, 0.57661, 0.45397);\\n            animation-timing-function: cubic-bezier(0.20503, 0.05705, 0.57661, 0.45397);\\n    -webkit-transform: scaleX(0.08);\\n            transform: scaleX(0.08); }\\n  19.15% {\\n    -webkit-animation-timing-function: cubic-bezier(0.15231, 0.19643, 0.64837, 1.00432);\\n            animation-timing-function: cubic-bezier(0.15231, 0.19643, 0.64837, 1.00432);\\n    -webkit-transform: scaleX(0.4571);\\n            transform: scaleX(0.4571); }\\n  44.15% {\\n    -webkit-animation-timing-function: cubic-bezier(0.25776, -0.00316, 0.21176, 1.38179);\\n            animation-timing-function: cubic-bezier(0.25776, -0.00316, 0.21176, 1.38179);\\n    -webkit-transform: scaleX(0.72796);\\n            transform: scaleX(0.72796); }\\n  100% {\\n    -webkit-transform: scaleX(0.08);\\n            transform: scaleX(0.08); } }\\n\\n@keyframes secondary-indeterminate-scale {\\n  0% {\\n    -webkit-animation-timing-function: cubic-bezier(0.20503, 0.05705, 0.57661, 0.45397);\\n            animation-timing-function: cubic-bezier(0.20503, 0.05705, 0.57661, 0.45397);\\n    -webkit-transform: scaleX(0.08);\\n            transform: scaleX(0.08); }\\n  19.15% {\\n    -webkit-animation-timing-function: cubic-bezier(0.15231, 0.19643, 0.64837, 1.00432);\\n            animation-timing-function: cubic-bezier(0.15231, 0.19643, 0.64837, 1.00432);\\n    -webkit-transform: scaleX(0.4571);\\n            transform: scaleX(0.4571); }\\n  44.15% {\\n    -webkit-animation-timing-function: cubic-bezier(0.25776, -0.00316, 0.21176, 1.38179);\\n            animation-timing-function: cubic-bezier(0.25776, -0.00316, 0.21176, 1.38179);\\n    -webkit-transform: scaleX(0.72796);\\n            transform: scaleX(0.72796); }\\n  100% {\\n    -webkit-transform: scaleX(0.08);\\n            transform: scaleX(0.08); } }\\n\\n@-webkit-keyframes buffering {\\n  to {\\n    -webkit-transform: translateX(-10px);\\n            transform: translateX(-10px); } }\\n\\n@keyframes buffering {\\n  to {\\n    -webkit-transform: translateX(-10px);\\n            transform: translateX(-10px); } }\\n\\n@-webkit-keyframes primary-indeterminate-translate-reverse {\\n  0% {\\n    -webkit-transform: translateX(0);\\n            transform: translateX(0); }\\n  20% {\\n    -webkit-animation-timing-function: cubic-bezier(0.5, 0, 0.70173, 0.49582);\\n            animation-timing-function: cubic-bezier(0.5, 0, 0.70173, 0.49582);\\n    -webkit-transform: translateX(0);\\n            transform: translateX(0); }\\n  59.15% {\\n    -webkit-animation-timing-function: cubic-bezier(0.30244, 0.38135, 0.55, 0.95635);\\n            animation-timing-function: cubic-bezier(0.30244, 0.38135, 0.55, 0.95635);\\n    -webkit-transform: translateX(-83.67142%);\\n            transform: translateX(-83.67142%); }\\n  100% {\\n    -webkit-transform: translateX(-200.61106%);\\n            transform: translateX(-200.61106%); } }\\n\\n@keyframes primary-indeterminate-translate-reverse {\\n  0% {\\n    -webkit-transform: translateX(0);\\n            transform: translateX(0); }\\n  20% {\\n    -webkit-animation-timing-function: cubic-bezier(0.5, 0, 0.70173, 0.49582);\\n            animation-timing-function: cubic-bezier(0.5, 0, 0.70173, 0.49582);\\n    -webkit-transform: translateX(0);\\n            transform: translateX(0); }\\n  59.15% {\\n    -webkit-animation-timing-function: cubic-bezier(0.30244, 0.38135, 0.55, 0.95635);\\n            animation-timing-function: cubic-bezier(0.30244, 0.38135, 0.55, 0.95635);\\n    -webkit-transform: translateX(-83.67142%);\\n            transform: translateX(-83.67142%); }\\n  100% {\\n    -webkit-transform: translateX(-200.61106%);\\n            transform: translateX(-200.61106%); } }\\n\\n@-webkit-keyframes secondary-indeterminate-translate-reverse {\\n  0% {\\n    -webkit-animation-timing-function: cubic-bezier(0.15, 0, 0.51506, 0.40969);\\n            animation-timing-function: cubic-bezier(0.15, 0, 0.51506, 0.40969);\\n    -webkit-transform: translateX(0);\\n            transform: translateX(0); }\\n  25% {\\n    -webkit-animation-timing-function: cubic-bezier(0.31033, 0.28406, 0.8, 0.73371);\\n            animation-timing-function: cubic-bezier(0.31033, 0.28406, 0.8, 0.73371);\\n    -webkit-transform: translateX(-37.65191%);\\n            transform: translateX(-37.65191%); }\\n  48.35% {\\n    -webkit-animation-timing-function: cubic-bezier(0.4, 0.62704, 0.6, 0.90203);\\n            animation-timing-function: cubic-bezier(0.4, 0.62704, 0.6, 0.90203);\\n    -webkit-transform: translateX(-84.38617%);\\n            transform: translateX(-84.38617%); }\\n  100% {\\n    -webkit-transform: translateX(-160.27778%);\\n            transform: translateX(-160.27778%); } }\\n\\n@keyframes secondary-indeterminate-translate-reverse {\\n  0% {\\n    -webkit-animation-timing-function: cubic-bezier(0.15, 0, 0.51506, 0.40969);\\n            animation-timing-function: cubic-bezier(0.15, 0, 0.51506, 0.40969);\\n    -webkit-transform: translateX(0);\\n            transform: translateX(0); }\\n  25% {\\n    -webkit-animation-timing-function: cubic-bezier(0.31033, 0.28406, 0.8, 0.73371);\\n            animation-timing-function: cubic-bezier(0.31033, 0.28406, 0.8, 0.73371);\\n    -webkit-transform: translateX(-37.65191%);\\n            transform: translateX(-37.65191%); }\\n  48.35% {\\n    -webkit-animation-timing-function: cubic-bezier(0.4, 0.62704, 0.6, 0.90203);\\n            animation-timing-function: cubic-bezier(0.4, 0.62704, 0.6, 0.90203);\\n    -webkit-transform: translateX(-84.38617%);\\n            transform: translateX(-84.38617%); }\\n  100% {\\n    -webkit-transform: translateX(-160.27778%);\\n            transform: translateX(-160.27778%); } }\\n\\n@-webkit-keyframes buffering-reverse {\\n  to {\\n    -webkit-transform: translateX(10px);\\n            transform: translateX(10px); } }\\n\\n@keyframes buffering-reverse {\\n  to {\\n    -webkit-transform: translateX(10px);\\n            transform: translateX(10px); } }\\n\\n.mdc-linear-progress {\\n  position: relative;\\n  width: 100%;\\n  height: 4px;\\n  -webkit-transform: translateZ(0);\\n          transform: translateZ(0);\\n  transition: opacity 250ms 0ms cubic-bezier(0.4, 0, 0.6, 1);\\n  overflow: hidden; }\\n  .mdc-linear-progress__bar {\\n    position: absolute;\\n    width: 100%;\\n    height: 100%;\\n    -webkit-animation: none;\\n            animation: none;\\n    -webkit-transform-origin: top left;\\n            transform-origin: top left;\\n    transition: -webkit-transform 250ms 0ms cubic-bezier(0.4, 0, 0.6, 1);\\n    transition: transform 250ms 0ms cubic-bezier(0.4, 0, 0.6, 1);\\n    transition: transform 250ms 0ms cubic-bezier(0.4, 0, 0.6, 1), -webkit-transform 250ms 0ms cubic-bezier(0.4, 0, 0.6, 1); }\\n  .mdc-linear-progress__bar-inner {\\n    display: inline-block;\\n    position: absolute;\\n    width: 100%;\\n    height: 100%;\\n    -webkit-animation: none;\\n            animation: none; }\\n  .mdc-linear-progress__buffering-dots {\\n    position: absolute;\\n    width: 100%;\\n    height: 100%;\\n    -webkit-animation: buffering 250ms infinite linear;\\n            animation: buffering 250ms infinite linear;\\n    background-repeat: repeat-x;\\n    background-size: 10px 4px; }\\n  .mdc-linear-progress__buffer {\\n    position: absolute;\\n    width: 100%;\\n    height: 100%;\\n    -webkit-transform-origin: top left;\\n            transform-origin: top left;\\n    transition: -webkit-transform 250ms 0ms cubic-bezier(0.4, 0, 0.6, 1);\\n    transition: transform 250ms 0ms cubic-bezier(0.4, 0, 0.6, 1);\\n    transition: transform 250ms 0ms cubic-bezier(0.4, 0, 0.6, 1), -webkit-transform 250ms 0ms cubic-bezier(0.4, 0, 0.6, 1); }\\n  .mdc-linear-progress__primary-bar {\\n    -webkit-transform: scaleX(0);\\n            transform: scaleX(0); }\\n  .mdc-linear-progress__secondary-bar {\\n    visibility: hidden; }\\n  .mdc-linear-progress--indeterminate .mdc-linear-progress__bar {\\n    transition: none; }\\n  .mdc-linear-progress--indeterminate .mdc-linear-progress__primary-bar {\\n    left: -145.166611%;\\n    -webkit-animation: primary-indeterminate-translate 2s infinite linear;\\n            animation: primary-indeterminate-translate 2s infinite linear; }\\n    .mdc-linear-progress--indeterminate .mdc-linear-progress__primary-bar > .mdc-linear-progress__bar-inner {\\n      -webkit-animation: primary-indeterminate-scale 2s infinite linear;\\n              animation: primary-indeterminate-scale 2s infinite linear; }\\n  .mdc-linear-progress--indeterminate .mdc-linear-progress__secondary-bar {\\n    left: -54.888891%;\\n    -webkit-animation: secondary-indeterminate-translate 2s infinite linear;\\n            animation: secondary-indeterminate-translate 2s infinite linear;\\n    visibility: visible; }\\n    .mdc-linear-progress--indeterminate .mdc-linear-progress__secondary-bar > .mdc-linear-progress__bar-inner {\\n      -webkit-animation: secondary-indeterminate-scale 2s infinite linear;\\n              animation: secondary-indeterminate-scale 2s infinite linear; }\\n  .mdc-linear-progress--reversed .mdc-linear-progress__bar,\\n  .mdc-linear-progress--reversed .mdc-linear-progress__buffer {\\n    right: 0;\\n    -webkit-transform-origin: center right;\\n            transform-origin: center right; }\\n  .mdc-linear-progress--reversed .mdc-linear-progress__primary-bar {\\n    -webkit-animation-name: primary-indeterminate-translate-reverse;\\n            animation-name: primary-indeterminate-translate-reverse; }\\n  .mdc-linear-progress--reversed .mdc-linear-progress__secondary-bar {\\n    -webkit-animation-name: secondary-indeterminate-translate-reverse;\\n            animation-name: secondary-indeterminate-translate-reverse; }\\n  .mdc-linear-progress--reversed .mdc-linear-progress__buffering-dots {\\n    -webkit-animation: buffering-reverse 250ms infinite linear;\\n            animation: buffering-reverse 250ms infinite linear; }\\n  .mdc-linear-progress--closed {\\n    opacity: 0; }\\n\\n.mdc-linear-progress__bar-inner {\\n  background-color: #6200ee;\\n  /* @alternate */\\n  background-color: var(--mdc-theme-primary, #6200ee); }\\n\\n.mdc-linear-progress__buffering-dots {\\n  background-image: url(\\\"data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' enable-background='new 0 0 5 2' xml:space='preserve' viewBox='0 0 5 2' preserveAspectRatio='none slice'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23e6e6e6'/%3E%3C/svg%3E\\\"); }\\n\\n.mdc-linear-progress__buffer {\\n  background-color: #e6e6e6; }\\n\\n.mdc-linear-progress--indeterminate.mdc-linear-progress--reversed .mdc-linear-progress__primary-bar {\\n  right: -145.166611%;\\n  left: auto; }\\n\\n.mdc-linear-progress--indeterminate.mdc-linear-progress--reversed .mdc-linear-progress__secondary-bar {\\n  right: -54.888891%;\\n  left: auto; }\", \"\"]);\n// Exports\nmodule.exports = exports;\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact-material-components/LinearProgress/style.css?C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/css-loader/dist/cjs.js");

/***/ }),

/***/ "../../node_modules/css-loader/dist/cjs.js!./src/style.css":
/*!**************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/css-loader/dist/cjs.js!./src/style.css ***!
  \**************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ \"../../node_modules/css-loader/dist/runtime/api.js\");\nvar ___CSS_LOADER_AT_RULE_IMPORT_0___ = __webpack_require__(/*! -!../../../node_modules/css-loader/dist/cjs.js!preact-material-components/Button/style.css */ \"../../node_modules/css-loader/dist/cjs.js!../../node_modules/preact-material-components/Button/style.css\");\nvar ___CSS_LOADER_AT_RULE_IMPORT_1___ = __webpack_require__(/*! -!../../../node_modules/css-loader/dist/cjs.js!preact-material-components/LinearProgress/style.css */ \"../../node_modules/css-loader/dist/cjs.js!../../node_modules/preact-material-components/LinearProgress/style.css\");\nexports = ___CSS_LOADER_API_IMPORT___(false);\nexports.i(___CSS_LOADER_AT_RULE_IMPORT_0___);\nexports.i(___CSS_LOADER_AT_RULE_IMPORT_1___);\n// Module\nexports.push([module.i, \"html, body {\\r\\n\\theight: 100%;\\r\\n\\twidth: 100%;\\r\\n\\tpadding: 0;\\r\\n\\tmargin: 0;\\r\\n\\tbackground: #f9f9f9;\\r\\n\\tfont: 400 14px/1.3 'Helvetica Neue',verdana,arial,sans-serif;\\r\\n\\tcolor: #555;\\r\\n\\t-webkit-font-smoothing: antialiased;\\r\\n\\t-moz-osx-font-smoothing: grayscale;\\r\\n\\ttouch-action: manipulation;\\r\\n\\t-ms-touch-action: manipulation;\\r\\n}\\r\\n\\r\\n.masthead {\\r\\n\\tdisplay: flex;\\r\\n\\tjustify-content: center;\\r\\n\\talign-items: center;\\r\\n\\tpadding: 20px 0 50px;\\r\\n\\tmargin-bottom: -40px;\\r\\n\\tbackground: #e3e3e3;\\r\\n\\tbox-shadow: inset 0 0 30px rgba(0,0,0,0.1), 0 0 1px -.5px #fff;\\r\\n}\\r\\n.masthead img {\\r\\n\\tflex: 0 0 auto;\\r\\n\\twidth: 128px;\\r\\n\\theight: 128px;\\r\\n\\tposition: relative;\\r\\n\\tleft: -20px;\\r\\n}\\r\\n.masthead h1 {\\r\\n\\tflex: 0 0 auto;\\r\\n\\tcolor: #c93f25;\\r\\n\\tfont-size: 300%;\\r\\n\\tfont-weight: 300;\\r\\n\\ttext-shadow: 0 1px 3px rgba(0,0,0,0.2);\\r\\n\\ttext-align: center;\\r\\n}\\r\\n.masthead .github {\\r\\n\\tposition: absolute;\\r\\n\\tright: 0;\\r\\n\\ttop: 0;\\r\\n\\tpadding: 10px 15px 12px;\\r\\n\\tbackground: #c93f25;\\r\\n\\tborder-radius: 0 0 0 5px;\\r\\n\\tcolor: #fff;\\r\\n}\\r\\n\\r\\nbutton {\\r\\n\\tmargin-right: 10px;\\r\\n\\tmargin-bottom: 10px;\\r\\n}\\r\\n\\r\\nh2, h3 {\\r\\n\\tmargin: 0;\\r\\n\\tpadding: 10px 0;\\r\\n\\tfont-weight: 400;\\r\\n}\\r\\n\\r\\nh2 {\\r\\n\\tfont-size: 150%;\\r\\n}\\r\\n\\r\\n.demo {\\r\\n\\tmax-width: 450px;\\r\\n\\tmargin: 10px auto;\\r\\n\\tpadding: 20px;\\r\\n\\tbackground: #FFF;\\r\\n\\tborder-radius: 3px;\\r\\n\\tbox-shadow: 0 5px 20px rgba(0,0,0,0.3);\\r\\n}\\r\\n\\r\\n@media (max-width:530px) {\\r\\n\\t.masthead h1 {\\r\\n\\t\\tfont-size: 200%;\\r\\n\\t}\\r\\n\\t.demo {\\r\\n\\t\\tmargin-left: 20px;\\r\\n\\t\\tmargin-right: 20px;\\r\\n\\t}\\r\\n}\\r\\n\\r\\n.spams {\\r\\n\\tmin-height: 50px;\\r\\n\\tbackground: #f9f9f9;\\r\\n\\tborder: 1px solid #ddd;\\r\\n\\tborder-radius: 3px;\\r\\n}\\r\\n.spam {\\r\\n\\tposition: relative;\\r\\n\\ttop: -1px;\\r\\n\\tpadding: 3px 10px;\\r\\n\\tborder-top: 1px solid #eee;\\r\\n}\", \"\"]);\n// Exports\nmodule.exports = exports;\n\n\n//# sourceURL=webpack:///./src/style.css?C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/css-loader/dist/cjs.js");

/***/ }),

/***/ "../../node_modules/css-loader/dist/runtime/api.js":
/*!******************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/css-loader/dist/runtime/api.js ***!
  \******************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n/*\n  MIT License http://www.opensource.org/licenses/mit-license.php\n  Author Tobias Koppers @sokra\n*/\n// css base code, injected by the css-loader\n// eslint-disable-next-line func-names\nmodule.exports = function (useSourceMap) {\n  var list = []; // return the list of modules as css string\n\n  list.toString = function toString() {\n    return this.map(function (item) {\n      var content = cssWithMappingToString(item, useSourceMap);\n\n      if (item[2]) {\n        return \"@media \".concat(item[2], \" {\").concat(content, \"}\");\n      }\n\n      return content;\n    }).join('');\n  }; // import a list of modules into the list\n  // eslint-disable-next-line func-names\n\n\n  list.i = function (modules, mediaQuery) {\n    if (typeof modules === 'string') {\n      // eslint-disable-next-line no-param-reassign\n      modules = [[null, modules, '']];\n    }\n\n    for (var i = 0; i < modules.length; i++) {\n      var item = [].concat(modules[i]);\n\n      if (mediaQuery) {\n        if (!item[2]) {\n          item[2] = mediaQuery;\n        } else {\n          item[2] = \"\".concat(mediaQuery, \" and \").concat(item[2]);\n        }\n      }\n\n      list.push(item);\n    }\n  };\n\n  return list;\n};\n\nfunction cssWithMappingToString(item, useSourceMap) {\n  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring\n\n  var cssMapping = item[3];\n\n  if (!cssMapping) {\n    return content;\n  }\n\n  if (useSourceMap && typeof btoa === 'function') {\n    var sourceMapping = toComment(cssMapping);\n    var sourceURLs = cssMapping.sources.map(function (source) {\n      return \"/*# sourceURL=\".concat(cssMapping.sourceRoot).concat(source, \" */\");\n    });\n    return [content].concat(sourceURLs).concat([sourceMapping]).join('\\n');\n  }\n\n  return [content].join('\\n');\n} // Adapted from convert-source-map (MIT)\n\n\nfunction toComment(sourceMap) {\n  // eslint-disable-next-line no-undef\n  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));\n  var data = \"sourceMappingURL=data:application/json;charset=utf-8;base64,\".concat(base64);\n  return \"/*# \".concat(data, \" */\");\n}\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/css-loader/dist/runtime/api.js?");

/***/ }),

/***/ "../../node_modules/preact-material-components/Base/MaterialComponent.js":
/*!****************************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact-material-components/Base/MaterialComponent.js ***!
  \****************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ \"../../node_modules/@babel/runtime/helpers/interopRequireDefault.js\");\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = exports.MaterialComponent = void 0;\n\nvar _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ \"../../node_modules/@babel/runtime/helpers/classCallCheck.js\"));\n\nvar _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ \"../../node_modules/@babel/runtime/helpers/createClass.js\"));\n\nvar _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ \"../../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js\"));\n\nvar _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ \"../../node_modules/@babel/runtime/helpers/getPrototypeOf.js\"));\n\nvar _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ \"../../node_modules/@babel/runtime/helpers/inherits.js\"));\n\nvar _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ \"../../node_modules/@babel/runtime/helpers/typeof.js\"));\n\nvar _ripple = __webpack_require__(/*! @material/ripple */ \"../../node_modules/@material/ripple/index.js\");\n\nvar _bindDecorator = __webpack_require__(/*! bind-decorator */ \"../../node_modules/bind-decorator/index.js\");\n\nvar _preact = __webpack_require__(/*! preact */ \"../../node_modules/preact/dist/preact.module.js\");\n\nvar __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {\n  var c = arguments.length,\n      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,\n      d;\n  if ((typeof Reflect === \"undefined\" ? \"undefined\" : (0, _typeof2.default)(Reflect)) === \"object\" && typeof Reflect.decorate === \"function\") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) {\n    if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;\n  }\n  return c > 3 && r && Object.defineProperty(target, key, r), r;\n};\n\nvar doNotRemoveProps = ['disabled'];\n/**\n * Base class for every Material component in this package\n * NOTE: every component should add a ref by the name of `control` to its root dom for autoInit Properties\n *\n * @export\n * @class MaterialComponent\n * @extends {Component}\n */\n\nvar MaterialComponent =\n/*#__PURE__*/\nfunction (_Component) {\n  (0, _inherits2.default)(MaterialComponent, _Component);\n\n  function MaterialComponent() {\n    (0, _classCallCheck2.default)(this, MaterialComponent);\n    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(MaterialComponent).apply(this, arguments));\n  }\n\n  (0, _createClass2.default)(MaterialComponent, [{\n    key: \"render\",\n    value: function render(props) {\n      if (!this.classText) {\n        this.classText = this.buildClassName(props);\n      } // Fetch a VNode\n\n\n      var componentProps = props;\n      var userDefinedClasses = componentProps.className || componentProps.class || ''; // We delete class props and add them later in the final\n      // step so every component does not need to handle user specified classes.\n\n      if (componentProps.class) {\n        delete componentProps.class;\n      }\n\n      if (componentProps.className) {\n        delete componentProps.className;\n      }\n\n      var element = this.materialDom(componentProps);\n      var propName = 'attributes';\n\n      if ('props' in element) {\n        propName = 'props'; // @ts-ignore\n\n        element.props = element.props || {};\n      } else {\n        element.attributes = element.attributes || {};\n      } // @ts-ignore\n\n\n      element[propName].className = \"\".concat(userDefinedClasses, \" \").concat(this.getClassName(element)).split(' ').filter(function (value, index, self) {\n        return self.indexOf(value) === index && value !== '';\n      }) // Unique + exclude empty class names\n      .join(' '); // Clean this shit of proxy attributes\n\n      this.mdcProps.forEach(function (prop) {\n        // TODO: Fix this better\n        if (prop in doNotRemoveProps) {\n          return;\n        } // @ts-ignore\n\n\n        delete element[propName][prop];\n      });\n      return element;\n    }\n    /** Attach the ripple effect */\n\n  }, {\n    key: \"componentDidMount\",\n    value: function componentDidMount() {\n      if (this.props.ripple && this.control) {\n        this.ripple = new _ripple.MDCRipple(this.control);\n      }\n    }\n  }, {\n    key: \"componentWillReceiveProps\",\n    value: function componentWillReceiveProps(nextProps) {\n      if (this.MDComponent && this.mdcNotifyProps) {\n        var _iteratorNormalCompletion = true;\n        var _didIteratorError = false;\n        var _iteratorError = undefined;\n\n        try {\n          for (var _iterator = this.mdcNotifyProps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {\n            var prop = _step.value;\n\n            if (this.props[prop] !== nextProps[prop]) {\n              this.MDComponent[prop] = nextProps[prop];\n            }\n          }\n        } catch (err) {\n          _didIteratorError = true;\n          _iteratorError = err;\n        } finally {\n          try {\n            if (!_iteratorNormalCompletion && _iterator.return != null) {\n              _iterator.return();\n            }\n          } finally {\n            if (_didIteratorError) {\n              throw _iteratorError;\n            }\n          }\n        }\n      }\n\n      var _iteratorNormalCompletion2 = true;\n      var _didIteratorError2 = false;\n      var _iteratorError2 = undefined;\n\n      try {\n        for (var _iterator2 = this.mdcProps[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {\n          var _prop = _step2.value;\n\n          if (this.props[_prop] !== nextProps[_prop]) {\n            this.classText = this.buildClassName(nextProps);\n            break;\n          }\n        }\n      } catch (err) {\n        _didIteratorError2 = true;\n        _iteratorError2 = err;\n      } finally {\n        try {\n          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {\n            _iterator2.return();\n          }\n        } finally {\n          if (_didIteratorError2) {\n            throw _iteratorError2;\n          }\n        }\n      }\n    }\n  }, {\n    key: \"componentWillUnmount\",\n    value: function componentWillUnmount() {\n      if (this.ripple) {\n        this.ripple.destroy();\n      }\n    }\n  }, {\n    key: \"afterComponentDidMount\",\n    value: function afterComponentDidMount() {\n      if (this.MDComponent && this.mdcNotifyProps) {\n        var _iteratorNormalCompletion3 = true;\n        var _didIteratorError3 = false;\n        var _iteratorError3 = undefined;\n\n        try {\n          for (var _iterator3 = this.mdcNotifyProps[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {\n            var prop = _step3.value;\n            this.MDComponent[prop] = this.props[prop];\n          }\n        } catch (err) {\n          _didIteratorError3 = true;\n          _iteratorError3 = err;\n        } finally {\n          try {\n            if (!_iteratorNormalCompletion3 && _iterator3.return != null) {\n              _iterator3.return();\n            }\n          } finally {\n            if (_didIteratorError3) {\n              throw _iteratorError3;\n            }\n          }\n        }\n      }\n    } // Shared setter for the root element ref\n\n  }, {\n    key: \"setControlRef\",\n    value: function setControlRef(control) {\n      this.control = control;\n    }\n    /** Build the className based on component names and mdc props */\n\n  }, {\n    key: \"buildClassName\",\n    value: function buildClassName(props) {\n      // Class name based on component name\n      var classText = 'mdc-' + this.componentName; // Loop over mdcProps to turn them into classNames\n\n      for (var propKey in props) {\n        if (props.hasOwnProperty(propKey)) {\n          var prop = props[propKey];\n\n          if (typeof prop === 'boolean' && prop) {\n            if (this.mdcProps.indexOf(propKey) !== -1) {\n              classText += \" mdc-\".concat(this.componentName, \"--\").concat(propKey);\n            }\n          }\n        }\n      }\n\n      return classText;\n    }\n    /** Returns the class name for element */\n\n  }, {\n    key: \"getClassName\",\n    value: function getClassName(element) {\n      if (!element) {\n        return '';\n      }\n\n      var propName = 'attributes';\n\n      if ('props' in element) {\n        propName = 'props'; // @ts-ignore\n\n        element.props = element.props || {};\n      } else {\n        element.attributes = element.attributes || {};\n      } // @ts-ignore\n\n\n      var attrs = element[propName] = element[propName] || {};\n      var classText = this.classText;\n\n      if (attrs.class) {\n        classText += ' ' + attrs.class;\n      }\n\n      if (attrs.className && attrs.className !== attrs.class) {\n        classText += ' ' + attrs.className;\n      }\n\n      return classText;\n    }\n  }]);\n  return MaterialComponent;\n}(_preact.Component);\n\nexports.MaterialComponent = MaterialComponent;\n\n__decorate([_bindDecorator.bind], MaterialComponent.prototype, \"setControlRef\", null);\n\nvar _default = MaterialComponent;\nexports.default = _default;\n//# sourceMappingURL=MaterialComponent.js.map\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact-material-components/Base/MaterialComponent.js?");

/***/ }),

/***/ "../../node_modules/preact-material-components/Button/index.js":
/*!******************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact-material-components/Button/index.js ***!
  \******************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ \"../../node_modules/@babel/runtime/helpers/interopRequireDefault.js\");\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = exports.Button = exports.ButtonIcon = void 0;\n\nvar _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ \"../../node_modules/@babel/runtime/helpers/createClass.js\"));\n\nvar _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ \"../../node_modules/@babel/runtime/helpers/classCallCheck.js\"));\n\nvar _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ \"../../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js\"));\n\nvar _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ \"../../node_modules/@babel/runtime/helpers/getPrototypeOf.js\"));\n\nvar _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ \"../../node_modules/@babel/runtime/helpers/inherits.js\"));\n\nvar _preact = __webpack_require__(/*! preact */ \"../../node_modules/preact/dist/preact.module.js\");\n\nvar _MaterialComponent2 = _interopRequireDefault(__webpack_require__(/*! ../Base/MaterialComponent */ \"../../node_modules/preact-material-components/Base/MaterialComponent.js\"));\n\nvar _Icon2 = _interopRequireDefault(__webpack_require__(/*! ../Icon */ \"../../node_modules/preact-material-components/Icon/index.js\"));\n\nvar _generateThemeClass = _interopRequireDefault(__webpack_require__(/*! ../themeUtils/generateThemeClass */ \"../../node_modules/preact-material-components/themeUtils/generateThemeClass.js\"));\n\nvar ButtonIcon =\n/*#__PURE__*/\nfunction (_Icon) {\n  (0, _inherits2.default)(ButtonIcon, _Icon);\n\n  function ButtonIcon() {\n    var _this;\n\n    (0, _classCallCheck2.default)(this, ButtonIcon);\n    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ButtonIcon).apply(this, arguments));\n    _this.componentName = 'button__icon';\n    return _this;\n  }\n\n  return ButtonIcon;\n}(_Icon2.default);\n\nexports.ButtonIcon = ButtonIcon;\n\nvar Button =\n/*#__PURE__*/\nfunction (_MaterialComponent) {\n  (0, _inherits2.default)(Button, _MaterialComponent);\n\n  function Button() {\n    var _this2;\n\n    (0, _classCallCheck2.default)(this, Button);\n    _this2 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(Button).apply(this, arguments));\n    _this2.componentName = 'button';\n    _this2.mdcProps = ['dense', 'raised', 'unelevated', 'outlined'];\n    _this2.themeProps = ['primary', 'secondary'];\n    return _this2;\n  }\n\n  (0, _createClass2.default)(Button, [{\n    key: \"materialDom\",\n    value: function materialDom(props) {\n      var ButtonElement = props.href ? 'a' : 'button';\n      var className = '';\n      this.themeProps.forEach(function (themeProp) {\n        if (themeProp in props && props[themeProp] !== false) {\n          className += (0, _generateThemeClass.default)(themeProp) + ' ';\n        }\n      });\n      return (0, _preact.h)(ButtonElement, Object.assign({\n        ref: this.setControlRef\n      }, props, {\n        className: className\n      }), this.props.children);\n    }\n  }]);\n  return Button;\n}(_MaterialComponent2.default);\n\nexports.Button = Button;\n\nvar default_1 =\n/*#__PURE__*/\nfunction (_Button) {\n  (0, _inherits2.default)(default_1, _Button);\n\n  function default_1() {\n    (0, _classCallCheck2.default)(this, default_1);\n    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(default_1).apply(this, arguments));\n  }\n\n  return default_1;\n}(Button);\n\nexports.default = default_1;\ndefault_1.Icon = ButtonIcon;\n//# sourceMappingURL=index.js.map\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact-material-components/Button/index.js?");

/***/ }),

/***/ "../../node_modules/preact-material-components/Icon/index.js":
/*!****************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact-material-components/Icon/index.js ***!
  \****************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ \"../../node_modules/@babel/runtime/helpers/interopRequireDefault.js\");\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = exports.Icon = void 0;\n\nvar _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ \"../../node_modules/@babel/runtime/helpers/classCallCheck.js\"));\n\nvar _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ \"../../node_modules/@babel/runtime/helpers/createClass.js\"));\n\nvar _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ \"../../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js\"));\n\nvar _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ \"../../node_modules/@babel/runtime/helpers/getPrototypeOf.js\"));\n\nvar _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ \"../../node_modules/@babel/runtime/helpers/inherits.js\"));\n\nvar _preact = __webpack_require__(/*! preact */ \"../../node_modules/preact/dist/preact.module.js\");\n\nvar _MaterialComponent2 = _interopRequireDefault(__webpack_require__(/*! ../Base/MaterialComponent */ \"../../node_modules/preact-material-components/Base/MaterialComponent.js\"));\n\nvar Icon =\n/*#__PURE__*/\nfunction (_MaterialComponent) {\n  (0, _inherits2.default)(Icon, _MaterialComponent);\n\n  function Icon() {\n    var _this;\n\n    (0, _classCallCheck2.default)(this, Icon);\n    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(Icon).apply(this, arguments));\n    _this.componentName = 'icon';\n    _this.mdcProps = [];\n    return _this;\n  }\n\n  (0, _createClass2.default)(Icon, [{\n    key: \"materialDom\",\n    value: function materialDom(props) {\n      var classes = ['material-icons']; // CardActionIcon sends className\n\n      if (props.className) {\n        classes.push(props.className);\n      }\n\n      return (0, _preact.h)(\"i\", Object.assign({}, props, {\n        className: classes.join(' ')\n      }), props.children);\n    }\n  }]);\n  return Icon;\n}(_MaterialComponent2.default);\n\nexports.Icon = Icon;\nvar _default = Icon;\nexports.default = _default;\n//# sourceMappingURL=index.js.map\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact-material-components/Icon/index.js?");

/***/ }),

/***/ "../../node_modules/preact-material-components/LinearProgress/index.js":
/*!**************************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact-material-components/LinearProgress/index.js ***!
  \**************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ \"../../node_modules/@babel/runtime/helpers/interopRequireDefault.js\");\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = exports.LinearProgress = void 0;\n\nvar _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ \"../../node_modules/@babel/runtime/helpers/classCallCheck.js\"));\n\nvar _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ \"../../node_modules/@babel/runtime/helpers/createClass.js\"));\n\nvar _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ \"../../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js\"));\n\nvar _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ \"../../node_modules/@babel/runtime/helpers/getPrototypeOf.js\"));\n\nvar _get2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/get */ \"../../node_modules/@babel/runtime/helpers/get.js\"));\n\nvar _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ \"../../node_modules/@babel/runtime/helpers/inherits.js\"));\n\nvar _linearProgress = __webpack_require__(/*! @material/linear-progress */ \"../../node_modules/@material/linear-progress/index.js\");\n\nvar _preact = __webpack_require__(/*! preact */ \"../../node_modules/preact/dist/preact.module.js\");\n\nvar _MaterialComponent2 = _interopRequireDefault(__webpack_require__(/*! ../Base/MaterialComponent */ \"../../node_modules/preact-material-components/Base/MaterialComponent.js\"));\n\nvar LinearProgress =\n/*#__PURE__*/\nfunction (_MaterialComponent) {\n  (0, _inherits2.default)(LinearProgress, _MaterialComponent);\n\n  function LinearProgress() {\n    var _this;\n\n    (0, _classCallCheck2.default)(this, LinearProgress);\n    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(LinearProgress).apply(this, arguments));\n    _this.componentName = 'linear-progress';\n    _this.mdcProps = ['reversed', 'indeterminate'];\n    _this.themeProps = ['primary', 'secondary'];\n    _this.mdcNotifyProps = ['progress'];\n    return _this;\n  }\n\n  (0, _createClass2.default)(LinearProgress, [{\n    key: \"componentDidMount\",\n    value: function componentDidMount() {\n      (0, _get2.default)((0, _getPrototypeOf2.default)(LinearProgress.prototype), \"componentDidMount\", this).call(this);\n\n      if (this.control) {\n        this.MDComponent = new _linearProgress.MDCLinearProgress(this.control);\n        this.MDComponent.determinate = !this.props.indeterminate;\n        this.MDComponent.reverse = !!this.props.reversed;\n      }\n\n      this.afterComponentDidMount();\n    }\n  }, {\n    key: \"componentWillReceiveProps\",\n    value: function componentWillReceiveProps(nextProps) {\n      (0, _get2.default)((0, _getPrototypeOf2.default)(LinearProgress.prototype), \"componentWillReceiveProps\", this).call(this, nextProps);\n\n      if (this.MDComponent) {\n        this.MDComponent.determinate = !this.props.indeterminate;\n        this.MDComponent.reverse = !!nextProps.reversed;\n      }\n    }\n  }, {\n    key: \"componentWillUnmount\",\n    value: function componentWillUnmount() {\n      (0, _get2.default)((0, _getPrototypeOf2.default)(LinearProgress.prototype), \"componentWillUnmount\", this).call(this);\n\n      if (this.MDComponent) {\n        this.MDComponent.destroy();\n      }\n    }\n  }, {\n    key: \"materialDom\",\n    value: function materialDom(props) {\n      // TODO: Fix theme props\n      return (0, _preact.h)(\"div\", Object.assign({\n        role: \"progressbar\"\n      }, props, {\n        ref: this.setControlRef\n      }), (0, _preact.h)(\"div\", {\n        className: \"mdc-linear-progress__buffering-dots\"\n      }), (0, _preact.h)(\"div\", {\n        className: \"mdc-linear-progress__buffer\"\n      }), (0, _preact.h)(\"div\", {\n        className: \"mdc-linear-progress__bar mdc-linear-progress__primary-bar\"\n      }, (0, _preact.h)(\"span\", {\n        className: \"mdc-linear-progress__bar-inner\"\n      })), (0, _preact.h)(\"div\", {\n        className: \"mdc-linear-progress__bar mdc-linear-progress__secondary-bar\"\n      }, (0, _preact.h)(\"span\", {\n        className: \"mdc-linear-progress__bar-inner\"\n      })));\n    }\n  }]);\n  return LinearProgress;\n}(_MaterialComponent2.default);\n\nexports.LinearProgress = LinearProgress;\nvar _default = LinearProgress;\nexports.default = _default;\n//# sourceMappingURL=index.js.map\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact-material-components/LinearProgress/index.js?");

/***/ }),

/***/ "../../node_modules/preact-material-components/themeUtils/generateThemeClass.js":
/*!***********************************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact-material-components/themeUtils/generateThemeClass.js ***!
  \***********************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = _default;\n\nfunction _default(prop) {\n  return \"mdc-theme--\".concat(prop, \"-bg\");\n}\n//# sourceMappingURL=generateThemeClass.js.map\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact-material-components/themeUtils/generateThemeClass.js?");

/***/ }),

/***/ "../../node_modules/preact/compat/dist/compat.module.js":
/*!***********************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact/compat/dist/compat.module.js ***!
  \***********************************************************************************************************************/
/*! exports provided: createElement, createContext, createRef, Fragment, Component, default, version, Children, render, hydrate, unmountComponentAtNode, createPortal, createFactory, cloneElement, isValidElement, findDOMNode, PureComponent, memo, forwardRef, unstable_batchedUpdates, Suspense, SuspenseList, lazy, useState, useReducer, useEffect, useLayoutEffect, useRef, useImperativeHandle, useMemo, useCallback, useContext, useDebugValue */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"version\", function() { return q; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Children\", function() { return F; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"render\", function() { return V; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"hydrate\", function() { return V; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"unmountComponentAtNode\", function() { return K; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createPortal\", function() { return W; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createFactory\", function() { return B; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"cloneElement\", function() { return J; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"isValidElement\", function() { return G; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"findDOMNode\", function() { return Q; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"PureComponent\", function() { return C; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"memo\", function() { return _; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"forwardRef\", function() { return S; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"unstable_batchedUpdates\", function() { return X; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Suspense\", function() { return M; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"SuspenseList\", function() { return j; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"lazy\", function() { return O; });\n/* harmony import */ var preact_hooks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact/hooks */ \"../../node_modules/preact/hooks/dist/hooks.module.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"useState\", function() { return preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useState\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"useReducer\", function() { return preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useReducer\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"useEffect\", function() { return preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useEffect\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"useLayoutEffect\", function() { return preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useLayoutEffect\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"useRef\", function() { return preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useRef\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"useImperativeHandle\", function() { return preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useImperativeHandle\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"useMemo\", function() { return preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useMemo\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"useCallback\", function() { return preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useCallback\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"useContext\", function() { return preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useContext\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"useDebugValue\", function() { return preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useDebugValue\"]; });\n\n/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! preact */ \"../../node_modules/preact/dist/preact.module.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"createElement\", function() { return preact__WEBPACK_IMPORTED_MODULE_1__[\"createElement\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"createContext\", function() { return preact__WEBPACK_IMPORTED_MODULE_1__[\"createContext\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"createRef\", function() { return preact__WEBPACK_IMPORTED_MODULE_1__[\"createRef\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"Fragment\", function() { return preact__WEBPACK_IMPORTED_MODULE_1__[\"Fragment\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"Component\", function() { return preact__WEBPACK_IMPORTED_MODULE_1__[\"Component\"]; });\n\nfunction E(n,t){for(var e in t)n[e]=t[e];return n}function w(n,t){for(var e in n)if(\"__source\"!==e&&!(e in t))return!0;for(var r in t)if(\"__source\"!==r&&n[r]!==t[r])return!0;return!1}var C=function(n){var t,e;function r(t){var e;return(e=n.call(this,t)||this).isPureReactComponent=!0,e}return e=n,(t=r).prototype=Object.create(e.prototype),t.prototype.constructor=t,t.__proto__=e,r.prototype.shouldComponentUpdate=function(n,t){return w(this.props,n)||w(this.state,t)},r}(preact__WEBPACK_IMPORTED_MODULE_1__[\"Component\"]);function _(n,t){function e(n){var e=this.props.ref,r=e==n.ref;return!r&&e&&(e.call?e(null):e.current=null),t?!t(this.props,n)||!r:w(this.props,n)}function r(t){return this.shouldComponentUpdate=e,Object(preact__WEBPACK_IMPORTED_MODULE_1__[\"createElement\"])(n,E({},t))}return r.prototype.isReactComponent=!0,r.displayName=\"Memo(\"+(n.displayName||n.name)+\")\",r.t=!0,r}var A=preact__WEBPACK_IMPORTED_MODULE_1__[\"options\"].vnode;function S(n){function t(t){var e=E({},t);return delete e.ref,n(e,t.ref)}return t.prototype.isReactComponent=!0,t.t=!0,t.displayName=\"ForwardRef(\"+(n.displayName||n.name)+\")\",t}preact__WEBPACK_IMPORTED_MODULE_1__[\"options\"].vnode=function(n){n.type&&n.type.t&&n.ref&&(n.props.ref=n.ref,n.ref=null),A&&A(n)};var k=function(n,t){return n?Object(preact__WEBPACK_IMPORTED_MODULE_1__[\"toChildArray\"])(n).map(t):null},F={map:k,forEach:k,count:function(n){return n?Object(preact__WEBPACK_IMPORTED_MODULE_1__[\"toChildArray\"])(n).length:0},only:function(n){if(1!==(n=Object(preact__WEBPACK_IMPORTED_MODULE_1__[\"toChildArray\"])(n)).length)throw new Error(\"Children.only() expects only one child.\");return n[0]},toArray:preact__WEBPACK_IMPORTED_MODULE_1__[\"toChildArray\"]},N=preact__WEBPACK_IMPORTED_MODULE_1__[\"options\"].__e;function R(n){return n&&((n=E({},n)).__c=null,n.__k=n.__k&&n.__k.map(R)),n}function M(n){this.__u=0,this.__b=null}function U(n){var t=n.__.__c;return t&&t.o&&t.o(n)}function O(n){var t,e,r;function o(o){if(t||(t=n()).then(function(n){e=n.default},function(n){r=n}),r)throw r;if(!e)throw t;return Object(preact__WEBPACK_IMPORTED_MODULE_1__[\"createElement\"])(e,o)}return o.displayName=\"Lazy\",o.t=!0,o}function j(){this.u=null,this.i=null}preact__WEBPACK_IMPORTED_MODULE_1__[\"options\"].__e=function(n,t,e){if(n.then)for(var r,o=t;o=o.__;)if((r=o.__c)&&r.l)return r.l(n,t.__c);N(n,t,e)},(M.prototype=new preact__WEBPACK_IMPORTED_MODULE_1__[\"Component\"]).l=function(n,t){var e=this,r=U(e.__v),o=!1,u=function(){o||(o=!0,r?r(i):i())};t.__c=t.componentWillUnmount,t.componentWillUnmount=function(){u(),t.__c&&t.__c()};var i=function(){--e.__u||(e.__v.__k[0]=e.state.o,e.setState({o:e.__b=null}))};e.__u++||e.setState({o:e.__b=e.__v.__k[0]}),n.then(u,u)},M.prototype.render=function(n,t){return this.__b&&(this.__v.__k[0]=R(this.__b),this.__b=null),[Object(preact__WEBPACK_IMPORTED_MODULE_1__[\"createElement\"])(preact__WEBPACK_IMPORTED_MODULE_1__[\"Component\"],null,t.o?null:n.children),t.o&&n.fallback]};var z=function(n,t,e){if(++e[1]===e[0]&&n.i.delete(t),n.props.revealOrder&&(\"t\"!==n.props.revealOrder[0]||!n.i.size))for(e=n.u;e;){for(;e.length>3;)e.pop()();if(e[1]<e[0])break;n.u=e=e[2]}};(j.prototype=new preact__WEBPACK_IMPORTED_MODULE_1__[\"Component\"]).o=function(n){var t=this,e=U(t.__v),r=t.i.get(n);return r[0]++,function(o){var u=function(){t.props.revealOrder?(r.push(o),z(t,n,r)):o()};e?e(u):u()}},j.prototype.render=function(n){this.u=null,this.i=new Map;var t=Object(preact__WEBPACK_IMPORTED_MODULE_1__[\"toChildArray\"])(n.children);n.revealOrder&&\"b\"===n.revealOrder[0]&&t.reverse();for(var e=t.length;e--;)this.i.set(t[e],this.u=[1,0,this.u]);return n.children},j.prototype.componentDidUpdate=j.prototype.componentDidMount=function(){var n=this;n.i.forEach(function(t,e){z(n,e,t)})};var L=function(){function n(){}var t=n.prototype;return t.getChildContext=function(){return this.props.context},t.render=function(n){return n.children},n}();function P(n){var t=this,e=n.container,r=Object(preact__WEBPACK_IMPORTED_MODULE_1__[\"createElement\"])(L,{context:t.context},n.vnode);return t.s&&t.s!==e&&(t.h.parentNode&&t.s.removeChild(t.h),Object(preact__WEBPACK_IMPORTED_MODULE_1__[\"_unmount\"])(t.v),t.p=!1),n.vnode?t.p?(e.__k=t.__k,Object(preact__WEBPACK_IMPORTED_MODULE_1__[\"render\"])(r,e),t.__k=e.__k):(t.h=document.createTextNode(\"\"),Object(preact__WEBPACK_IMPORTED_MODULE_1__[\"hydrate\"])(\"\",e),e.appendChild(t.h),t.p=!0,t.s=e,Object(preact__WEBPACK_IMPORTED_MODULE_1__[\"render\"])(r,e,t.h),t.__k=this.h.__k):t.p&&(t.h.parentNode&&t.s.removeChild(t.h),Object(preact__WEBPACK_IMPORTED_MODULE_1__[\"_unmount\"])(t.v)),t.v=r,t.componentWillUnmount=function(){t.h.parentNode&&t.s.removeChild(t.h),Object(preact__WEBPACK_IMPORTED_MODULE_1__[\"_unmount\"])(t.v)},null}function W(n,t){return Object(preact__WEBPACK_IMPORTED_MODULE_1__[\"createElement\"])(P,{vnode:n,container:t})}var D=/^(?:accent|alignment|arabic|baseline|cap|clip|color|fill|flood|font|glyph|horiz|marker|overline|paint|stop|strikethrough|stroke|text|underline|unicode|units|v|vector|vert|word|writing|x)[A-Z]/;preact__WEBPACK_IMPORTED_MODULE_1__[\"Component\"].prototype.isReactComponent={};var T=\"undefined\"!=typeof Symbol&&Symbol.for&&Symbol.for(\"react.element\")||60103;function V(n,t,e){if(null==t.__k)for(;t.firstChild;)t.removeChild(t.firstChild);return Object(preact__WEBPACK_IMPORTED_MODULE_1__[\"render\"])(n,t),\"function\"==typeof e&&e(),n?n.__c:null}var Z=preact__WEBPACK_IMPORTED_MODULE_1__[\"options\"].event;function H(n,t){n[\"UNSAFE_\"+t]&&!n[t]&&Object.defineProperty(n,t,{configurable:!1,get:function(){return this[\"UNSAFE_\"+t]},set:function(n){this[\"UNSAFE_\"+t]=n}})}preact__WEBPACK_IMPORTED_MODULE_1__[\"options\"].event=function(n){return Z&&(n=Z(n)),n.persist=function(){},n.nativeEvent=n};var I={configurable:!0,get:function(){return this.class}},$=preact__WEBPACK_IMPORTED_MODULE_1__[\"options\"].vnode;preact__WEBPACK_IMPORTED_MODULE_1__[\"options\"].vnode=function(n){n.$$typeof=T;var t=n.type,e=n.props;if(\"function\"!=typeof t){var r,o,u;for(u in e.defaultValue&&(e.value||0===e.value||(e.value=e.defaultValue),delete e.defaultValue),Array.isArray(e.value)&&e.multiple&&\"select\"===t&&(Object(preact__WEBPACK_IMPORTED_MODULE_1__[\"toChildArray\"])(e.children).forEach(function(n){-1!=e.value.indexOf(n.props.value)&&(n.props.selected=!0)}),delete e.value),e)if(r=D.test(u))break;if(r)for(u in o=n.props={},e)o[D.test(u)?u.replace(/([A-Z0-9])/,\"-$1\").toLowerCase():u]=e[u]}(e.class||e.className)&&(I.enumerable=\"className\"in e,e.className&&(e.class=e.className),Object.defineProperty(e,\"className\",I)),function(t){var e=n.type,r=n.props;if(r&&\"string\"==typeof e){var o={};for(var u in r)/^on(Ani|Tra|Tou)/.test(u)&&(r[u.toLowerCase()]=r[u],delete r[u]),o[u.toLowerCase()]=u;if(o.ondoubleclick&&(r.ondblclick=r[o.ondoubleclick],delete r[o.ondoubleclick]),o.onbeforeinput&&(r.onbeforeinput=r[o.onbeforeinput],delete r[o.onbeforeinput]),o.onchange&&(\"textarea\"===e||\"input\"===e.toLowerCase()&&!/^fil|che|ra/i.test(r.type))){var i=o.oninput||\"oninput\";r[i]||(r[i]=r[o.onchange],delete r[o.onchange])}}}(),\"function\"==typeof t&&!t.m&&t.prototype&&(H(t.prototype,\"componentWillMount\"),H(t.prototype,\"componentWillReceiveProps\"),H(t.prototype,\"componentWillUpdate\"),t.m=!0),$&&$(n)};var q=\"16.8.0\";function B(n){return preact__WEBPACK_IMPORTED_MODULE_1__[\"createElement\"].bind(null,n)}function G(n){return!!n&&n.$$typeof===T}function J(n){return G(n)?preact__WEBPACK_IMPORTED_MODULE_1__[\"cloneElement\"].apply(null,arguments):n}function K(n){return!!n.__k&&(Object(preact__WEBPACK_IMPORTED_MODULE_1__[\"render\"])(null,n),!0)}function Q(n){return n&&(n.base||1===n.nodeType&&n)||null}var X=function(n,t){return n(t)};/* harmony default export */ __webpack_exports__[\"default\"] = ({useState:preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useState\"],useReducer:preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useReducer\"],useEffect:preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useEffect\"],useLayoutEffect:preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useLayoutEffect\"],useRef:preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useRef\"],useImperativeHandle:preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useImperativeHandle\"],useMemo:preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useMemo\"],useCallback:preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useCallback\"],useContext:preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useContext\"],useDebugValue:preact_hooks__WEBPACK_IMPORTED_MODULE_0__[\"useDebugValue\"],version:\"16.8.0\",Children:F,render:V,hydrate:V,unmountComponentAtNode:K,createPortal:W,createElement:preact__WEBPACK_IMPORTED_MODULE_1__[\"createElement\"],createContext:preact__WEBPACK_IMPORTED_MODULE_1__[\"createContext\"],createFactory:B,cloneElement:J,createRef:preact__WEBPACK_IMPORTED_MODULE_1__[\"createRef\"],Fragment:preact__WEBPACK_IMPORTED_MODULE_1__[\"Fragment\"],isValidElement:G,findDOMNode:Q,Component:preact__WEBPACK_IMPORTED_MODULE_1__[\"Component\"],PureComponent:C,memo:_,forwardRef:S,unstable_batchedUpdates:X,Suspense:M,SuspenseList:j,lazy:O});\n//# sourceMappingURL=compat.module.js.map\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact/compat/dist/compat.module.js?");

/***/ }),

/***/ "../../node_modules/preact/dist/preact.module.js":
/*!****************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact/dist/preact.module.js ***!
  \****************************************************************************************************************/
/*! exports provided: render, hydrate, createElement, h, Fragment, createRef, isValidElement, Component, cloneElement, createContext, toChildArray, _unmount, options */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"render\", function() { return E; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"hydrate\", function() { return H; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createElement\", function() { return h; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"h\", function() { return h; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Fragment\", function() { return y; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createRef\", function() { return p; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"isValidElement\", function() { return l; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Component\", function() { return d; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"cloneElement\", function() { return I; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createContext\", function() { return L; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"toChildArray\", function() { return b; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"_unmount\", function() { return A; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"options\", function() { return n; });\nvar n,l,u,i,t,o,f,r={},e=[],c=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord/i;function s(n,l){for(var u in l)n[u]=l[u];return n}function a(n){var l=n.parentNode;l&&l.removeChild(n)}function h(n,l,u){var i,t=arguments,o={};for(i in l)\"key\"!==i&&\"ref\"!==i&&(o[i]=l[i]);if(arguments.length>3)for(u=[u],i=3;i<arguments.length;i++)u.push(t[i]);if(null!=u&&(o.children=u),\"function\"==typeof n&&null!=n.defaultProps)for(i in n.defaultProps)void 0===o[i]&&(o[i]=n.defaultProps[i]);return v(n,o,l&&l.key,l&&l.ref)}function v(l,u,i,t){var o={type:l,props:u,key:i,ref:t,__k:null,__:null,__b:0,__e:null,__d:null,__c:null,constructor:void 0};return n.vnode&&n.vnode(o),o}function p(){return{}}function y(n){return n.children}function d(n,l){this.props=n,this.context=l}function m(n,l){if(null==l)return n.__?m(n.__,n.__.__k.indexOf(n)+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return\"function\"==typeof n.type?m(n):null}function w(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return w(n)}}function g(l){(!l.__d&&(l.__d=!0)&&1===u.push(l)||t!==n.debounceRendering)&&((t=n.debounceRendering)||i)(k)}function k(){var n,l,i,t,o,f,r;for(u.sort(function(n,l){return l.__v.__b-n.__v.__b});n=u.pop();)n.__d&&(i=void 0,t=void 0,f=(o=(l=n).__v).__e,(r=l.__P)&&(i=[],t=T(r,o,s({},o),l.__n,void 0!==r.ownerSVGElement,null,i,null==f?m(o):f),$(i,o),t!=f&&w(o)))}function _(n,l,u,i,t,o,f,c,s){var h,v,p,y,d,w,g,k=u&&u.__k||e,_=k.length;if(c==r&&(c=null!=o?o[0]:_?m(u,0):null),h=0,l.__k=b(l.__k,function(u){if(null!=u){if(u.__=l,u.__b=l.__b+1,null===(p=k[h])||p&&u.key==p.key&&u.type===p.type)k[h]=void 0;else for(v=0;v<_;v++){if((p=k[v])&&u.key==p.key&&u.type===p.type){k[v]=void 0;break}p=null}if(y=T(n,u,p=p||r,i,t,o,f,c,s),(v=u.ref)&&p.ref!=v&&(g||(g=[]),p.ref&&g.push(p.ref,null,u),g.push(v,u.__c||y,u)),null!=y){if(null==w&&(w=y),null!=u.__d)y=u.__d,u.__d=null;else if(o==p||y!=c||null==y.parentNode){n:if(null==c||c.parentNode!==n)n.appendChild(y);else{for(d=c,v=0;(d=d.nextSibling)&&v<_;v+=2)if(d==y)break n;n.insertBefore(y,c)}\"option\"==l.type&&(n.value=\"\")}c=y.nextSibling,\"function\"==typeof l.type&&(l.__d=y)}}return h++,u}),l.__e=w,null!=o&&\"function\"!=typeof l.type)for(h=o.length;h--;)null!=o[h]&&a(o[h]);for(h=_;h--;)null!=k[h]&&A(k[h],k[h]);if(g)for(h=0;h<g.length;h++)z(g[h],g[++h],g[++h])}function b(n,l,u){if(null==u&&(u=[]),null==n||\"boolean\"==typeof n)l&&u.push(l(null));else if(Array.isArray(n))for(var i=0;i<n.length;i++)b(n[i],l,u);else u.push(l?l(\"string\"==typeof n||\"number\"==typeof n?v(null,n,null,null):null!=n.__e||null!=n.__c?v(n.type,n.props,n.key,null):n):n);return u}function x(n,l,u,i,t){var o;for(o in u)o in l||P(n,o,null,u[o],i);for(o in l)t&&\"function\"!=typeof l[o]||\"value\"===o||\"checked\"===o||u[o]===l[o]||P(n,o,l[o],u[o],i)}function C(n,l,u){\"-\"===l[0]?n.setProperty(l,u):n[l]=\"number\"==typeof u&&!1===c.test(l)?u+\"px\":null==u?\"\":u}function P(n,l,u,i,t){var o,f,r,e,c;if(t?\"className\"===l&&(l=\"class\"):\"class\"===l&&(l=\"className\"),\"key\"===l||\"children\"===l);else if(\"style\"===l)if(o=n.style,\"string\"==typeof u)o.cssText=u;else{if(\"string\"==typeof i&&(o.cssText=\"\",i=null),i)for(f in i)u&&f in u||C(o,f,\"\");if(u)for(r in u)i&&u[r]===i[r]||C(o,r,u[r])}else\"o\"===l[0]&&\"n\"===l[1]?(e=l!==(l=l.replace(/Capture$/,\"\")),c=l.toLowerCase(),l=(c in n?c:l).slice(2),u?(i||n.addEventListener(l,N,e),(n.l||(n.l={}))[l]=u):n.removeEventListener(l,N,e)):\"list\"!==l&&\"tagName\"!==l&&\"form\"!==l&&\"type\"!==l&&!t&&l in n?n[l]=null==u?\"\":u:\"function\"!=typeof u&&\"dangerouslySetInnerHTML\"!==l&&(l!==(l=l.replace(/^xlink:?/,\"\"))?null==u||!1===u?n.removeAttributeNS(\"http://www.w3.org/1999/xlink\",l.toLowerCase()):n.setAttributeNS(\"http://www.w3.org/1999/xlink\",l.toLowerCase(),u):null==u||!1===u?n.removeAttribute(l):n.setAttribute(l,u))}function N(l){this.l[l.type](n.event?n.event(l):l)}function T(l,u,i,t,o,f,r,e,c){var a,h,v,p,m,w,g,k,x,C,P=u.type;if(void 0!==u.constructor)return null;(a=n.__b)&&a(u);try{n:if(\"function\"==typeof P){if(k=u.props,x=(a=P.contextType)&&t[a.__c],C=a?x?x.props.value:a.__:t,i.__c?g=(h=u.__c=i.__c).__=h.__E:(\"prototype\"in P&&P.prototype.render?u.__c=h=new P(k,C):(u.__c=h=new d(k,C),h.constructor=P,h.render=D),x&&x.sub(h),h.props=k,h.state||(h.state={}),h.context=C,h.__n=t,v=h.__d=!0,h.__h=[]),null==h.__s&&(h.__s=h.state),null!=P.getDerivedStateFromProps&&(h.__s==h.state&&(h.__s=s({},h.__s)),s(h.__s,P.getDerivedStateFromProps(k,h.__s))),p=h.props,m=h.state,v)null==P.getDerivedStateFromProps&&null!=h.componentWillMount&&h.componentWillMount(),null!=h.componentDidMount&&h.__h.push(h.componentDidMount);else{if(null==P.getDerivedStateFromProps&&k!==p&&null!=h.componentWillReceiveProps&&h.componentWillReceiveProps(k,C),!h.__e&&null!=h.shouldComponentUpdate&&!1===h.shouldComponentUpdate(k,h.__s,C)){for(h.props=k,h.state=h.__s,h.__d=!1,h.__v=u,u.__e=i.__e,u.__k=i.__k,h.__h.length&&r.push(h),a=0;a<u.__k.length;a++)u.__k[a]&&(u.__k[a].__=u);break n}null!=h.componentWillUpdate&&h.componentWillUpdate(k,h.__s,C),null!=h.componentDidUpdate&&h.__h.push(function(){h.componentDidUpdate(p,m,w)})}h.context=C,h.props=k,h.state=h.__s,(a=n.__r)&&a(u),h.__d=!1,h.__v=u,h.__P=l,a=h.render(h.props,h.state,h.context),u.__k=b(null!=a&&a.type==y&&null==a.key?a.props.children:a),null!=h.getChildContext&&(t=s(s({},t),h.getChildContext())),v||null==h.getSnapshotBeforeUpdate||(w=h.getSnapshotBeforeUpdate(p,m)),_(l,u,i,t,o,f,r,e,c),h.base=u.__e,h.__h.length&&r.push(h),g&&(h.__E=h.__=null),h.__e=null}else u.__e=j(i.__e,u,i,t,o,f,r,c);(a=n.diffed)&&a(u)}catch(l){n.__e(l,u,i)}return u.__e}function $(l,u){n.__c&&n.__c(u,l),l.some(function(u){try{l=u.__h,u.__h=[],l.some(function(n){n.call(u)})}catch(l){n.__e(l,u.__v)}})}function j(n,l,u,i,t,o,f,c){var s,a,h,v,p,y=u.props,d=l.props;if(t=\"svg\"===l.type||t,null==n&&null!=o)for(s=0;s<o.length;s++)if(null!=(a=o[s])&&(null===l.type?3===a.nodeType:a.localName===l.type)){n=a,o[s]=null;break}if(null==n){if(null===l.type)return document.createTextNode(d);n=t?document.createElementNS(\"http://www.w3.org/2000/svg\",l.type):document.createElement(l.type),o=null}if(null===l.type)null!=o&&(o[o.indexOf(n)]=null),y!==d&&(n.data=d);else if(l!==u){if(null!=o&&(o=e.slice.call(n.childNodes)),h=(y=u.props||r).dangerouslySetInnerHTML,v=d.dangerouslySetInnerHTML,!c){if(y===r)for(y={},p=0;p<n.attributes.length;p++)y[n.attributes[p].name]=n.attributes[p].value;(v||h)&&(v&&h&&v.__html==h.__html||(n.innerHTML=v&&v.__html||\"\"))}x(n,d,y,t,c),l.__k=l.props.children,v||_(n,l,u,i,\"foreignObject\"!==l.type&&t,o,f,r,c),c||(\"value\"in d&&void 0!==d.value&&d.value!==n.value&&(n.value=null==d.value?\"\":d.value),\"checked\"in d&&void 0!==d.checked&&d.checked!==n.checked&&(n.checked=d.checked))}return n}function z(l,u,i){try{\"function\"==typeof l?l(u):l.current=u}catch(l){n.__e(l,i)}}function A(l,u,i){var t,o,f;if(n.unmount&&n.unmount(l),(t=l.ref)&&z(t,null,u),i||\"function\"==typeof l.type||(i=null!=(o=l.__e)),l.__e=l.__d=null,null!=(t=l.__c)){if(t.componentWillUnmount)try{t.componentWillUnmount()}catch(l){n.__e(l,u)}t.base=t.__P=null}if(t=l.__k)for(f=0;f<t.length;f++)t[f]&&A(t[f],u,i);null!=o&&a(o)}function D(n,l,u){return this.constructor(n,u)}function E(l,u,i){var t,f,c;n.__&&n.__(l,u),f=(t=i===o)?null:i&&i.__k||u.__k,l=h(y,null,[l]),c=[],T(u,(t?u:i||u).__k=l,f||r,r,void 0!==u.ownerSVGElement,i&&!t?[i]:f?null:e.slice.call(u.childNodes),c,i||r,t),$(c,l)}function H(n,l){E(n,l,o)}function I(n,l){return l=s(s({},n.props),l),arguments.length>2&&(l.children=e.slice.call(arguments,2)),v(n.type,l,l.key||n.key,l.ref||n.ref)}function L(n){var l={},u={__c:\"__cC\"+f++,__:n,Consumer:function(n,l){return n.children(l)},Provider:function(n){var i,t=this;return this.getChildContext||(i=[],this.getChildContext=function(){return l[u.__c]=t,l},this.shouldComponentUpdate=function(l){n.value!==l.value&&i.some(function(n){n.context=l.value,g(n)})},this.sub=function(n){i.push(n);var l=n.componentWillUnmount;n.componentWillUnmount=function(){i.splice(i.indexOf(n),1),l&&l.call(n)}}),n.children}};return u.Consumer.contextType=u,u}n={__e:function(n,l){for(var u;l=l.__;)if((u=l.__c)&&!u.__)try{if(u.constructor&&null!=u.constructor.getDerivedStateFromError)u.setState(u.constructor.getDerivedStateFromError(n));else{if(null==u.componentDidCatch)continue;u.componentDidCatch(n)}return g(u.__E=u)}catch(l){n=l}throw n}},l=function(n){return null!=n&&void 0===n.constructor},d.prototype.setState=function(n,l){var u;u=this.__s!==this.state?this.__s:this.__s=s({},this.state),\"function\"==typeof n&&(n=n(u,this.props)),n&&s(u,n),null!=n&&this.__v&&(this.__e=!1,l&&this.__h.push(l),g(this))},d.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),g(this))},d.prototype.render=y,u=[],i=\"function\"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,o=r,f=0;\n//# sourceMappingURL=preact.module.js.map\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact/dist/preact.module.js?");

/***/ }),

/***/ "../../node_modules/preact/hooks/dist/hooks.module.js":
/*!*********************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact/hooks/dist/hooks.module.js ***!
  \*********************************************************************************************************************/
/*! exports provided: useState, useReducer, useEffect, useLayoutEffect, useRef, useImperativeHandle, useMemo, useCallback, useContext, useDebugValue */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"useState\", function() { return v; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"useReducer\", function() { return m; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"useEffect\", function() { return p; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"useLayoutEffect\", function() { return l; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"useRef\", function() { return d; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"useImperativeHandle\", function() { return s; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"useMemo\", function() { return y; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"useCallback\", function() { return T; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"useContext\", function() { return w; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"useDebugValue\", function() { return A; });\n/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ \"../../node_modules/preact/dist/preact.module.js\");\nvar t,u,r,i=[],o=preact__WEBPACK_IMPORTED_MODULE_0__[\"options\"].__r,f=preact__WEBPACK_IMPORTED_MODULE_0__[\"options\"].diffed,c=preact__WEBPACK_IMPORTED_MODULE_0__[\"options\"].__c,e=preact__WEBPACK_IMPORTED_MODULE_0__[\"options\"].unmount;function a(t){preact__WEBPACK_IMPORTED_MODULE_0__[\"options\"].__h&&preact__WEBPACK_IMPORTED_MODULE_0__[\"options\"].__h(u);var r=u.__H||(u.__H={t:[],u:[]});return t>=r.t.length&&r.t.push({}),r.t[t]}function v(n){return m(x,n)}function m(n,r,i){var o=a(t++);return o.__c||(o.__c=u,o.i=[i?i(r):x(void 0,r),function(t){var u=n(o.i[0],t);o.i[0]!==u&&(o.i[0]=u,o.__c.setState({}))}]),o.i}function p(n,r){var i=a(t++);q(i.o,r)&&(i.i=n,i.o=r,u.__H.u.push(i))}function l(n,r){var i=a(t++);q(i.o,r)&&(i.i=n,i.o=r,u.__h.push(i))}function d(n){return y(function(){return{current:n}},[])}function s(n,t,u){l(function(){\"function\"==typeof n?n(t()):n&&(n.current=t())},null==u?u:u.concat(n))}function y(n,u){var r=a(t++);return q(r.o,u)?(r.o=u,r.v=n,r.i=n()):r.i}function T(n,t){return y(function(){return n},t)}function w(n){var r=u.context[n.__c];if(!r)return n.__;var i=a(t++);return null==i.i&&(i.i=!0,r.sub(u)),r.props.value}function A(t,u){preact__WEBPACK_IMPORTED_MODULE_0__[\"options\"].useDebugValue&&preact__WEBPACK_IMPORTED_MODULE_0__[\"options\"].useDebugValue(u?u(t):t)}function F(){i.some(function(n){n.__P&&(n.__H.u.forEach(_),n.__H.u.forEach(g),n.__H.u=[])}),i=[]}function _(n){n.m&&n.m()}function g(n){var t=n.i();\"function\"==typeof t&&(n.m=t)}function q(n,t){return!n||t.some(function(t,u){return t!==n[u]})}function x(n,t){return\"function\"==typeof t?t(n):t}preact__WEBPACK_IMPORTED_MODULE_0__[\"options\"].__r=function(n){o&&o(n),t=0,(u=n.__c).__H&&(u.__H.u.forEach(_),u.__H.u.forEach(g),u.__H.u=[])},preact__WEBPACK_IMPORTED_MODULE_0__[\"options\"].diffed=function(t){f&&f(t);var u=t.__c;if(u){var o=u.__H;o&&o.u.length&&(1!==i.push(u)&&r===preact__WEBPACK_IMPORTED_MODULE_0__[\"options\"].requestAnimationFrame||((r=preact__WEBPACK_IMPORTED_MODULE_0__[\"options\"].requestAnimationFrame)||function(n){var t,u=function(){clearTimeout(r),cancelAnimationFrame(t),setTimeout(n)},r=setTimeout(u,100);\"undefined\"!=typeof window&&(t=requestAnimationFrame(u))})(F))}},preact__WEBPACK_IMPORTED_MODULE_0__[\"options\"].__c=function(n,t){t.some(function(n){n.__h.forEach(_),n.__h=n.__h.filter(function(n){return!n.i||g(n)})}),c&&c(n,t)},preact__WEBPACK_IMPORTED_MODULE_0__[\"options\"].unmount=function(n){e&&e(n);var t=n.__c;if(t){var u=t.__H;u&&u.t.forEach(function(n){return n.m&&n.m()})}};\n//# sourceMappingURL=hooks.module.js.map\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/preact/hooks/dist/hooks.module.js?");

/***/ }),

/***/ "../../node_modules/stockroom/dist/stockroom.es.js":
/*!******************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/stockroom/dist/stockroom.es.js ***!
  \******************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nfunction t(t,n){for(var e in n)t[e]=n[e];return t}function n(n,r){if(Array.isArray(n)){n=n.slice(0,r.length);for(var o=0;o<r.length;o++)void 0!==r[o]&&(n[o]=e(r[o],n[o]))}else for(var i in n=t({},n),r)r.hasOwnProperty(i)&&(void 0===r[i]?delete n[i]:n[i]=e(r[i],n[i]));return n}function e(t,e){return null!=e&&null!=t&&\"object\"==typeof e&&\"object\"==typeof t?n(e,t):t}function r(t,n){var e,r;if(Array.isArray(t))for(e=new Array(t.length),r=0;r<t.length;r++)t[r]!==n[r]&&(e[r]=o(t[r],n[r]));else for(r in e={},t)t.hasOwnProperty(r)&&t[r]!==n[r]&&(e[r]=o(t[r],n[r]));return e}function o(t,n){return\"object\"==typeof t&&\"object\"==typeof n?r(t,n):t}var i=function(t){return!(t instanceof Event)};/* harmony default export */ __webpack_exports__[\"default\"] = (function(e){var o=[],a={},f=[],u=!1;function c(t){var e=t.overwrite,r=t.update,o=t.action,i=t.initial;\"@@STATE\"===t.type&&(!0===t.partial&&(r=n(a,r),e=!0),l(r,!0===e,o,!1),i&&(u=!0,s()))}function l(n,e,i,f){var u=a;a=t(e?{}:t({},a),n),f&&p({type:\"@@STATE\",overwrite:e,update:e?a:r(a,u),action:i,partial:!e});for(var c=o,l=0;l<c.length;l++)c[l](a,i)}function p(t){1===f.push(t)&&setTimeout(s)}function s(){u&&f.length>0&&(e.postMessage(f),f.length=0)}function v(t){for(var n=[],e=0;e<o.length;e++)o[e]===t?t=null:n.push(o[e]);o=n}return e.addEventListener(\"message\",function(t){var n=t.data;if(\"object\"!=typeof n);else if(\"pop\"in n)if(1===n.length)c(n[0]);else for(var e=0;e<n.length;e++)c(n[e]);else c(n)}),{action:function(t){return function(){for(var n=[],e=arguments.length;e--;)n[e]=arguments[e];var r=\"function\"==typeof t?t.apply(void 0,n):t;\"string\"==typeof r&&(r={type:r,params:n.filter(i)}),r&&!r.type?l(r,!1,t.name,!0):p({type:\"@@ACTION\",action:r})}},setState:function(t,n,e){return l(t,n,e,!0)},getState:function(){return a},subscribe:function(t){return o.push(t),function(){v(t)}},unsubscribe:v}});;\n//# sourceMappingURL=stockroom.es.js.map\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/stockroom/dist/stockroom.es.js?");

/***/ }),

/***/ "../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!*****************************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \*****************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar stylesInDom = {};\n\nvar isOldIE = function isOldIE() {\n  var memo;\n  return function memorize() {\n    if (typeof memo === 'undefined') {\n      // Test for IE <= 9 as proposed by Browserhacks\n      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805\n      // Tests for existence of standard globals is to allow style-loader\n      // to operate correctly into non-standard environments\n      // @see https://github.com/webpack-contrib/style-loader/issues/177\n      memo = Boolean(window && document && document.all && !window.atob);\n    }\n\n    return memo;\n  };\n}();\n\nvar getTarget = function getTarget() {\n  var memo = {};\n  return function memorize(target) {\n    if (typeof memo[target] === 'undefined') {\n      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself\n\n      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {\n        try {\n          // This will throw an exception if access to iframe is blocked\n          // due to cross-origin restrictions\n          styleTarget = styleTarget.contentDocument.head;\n        } catch (e) {\n          // istanbul ignore next\n          styleTarget = null;\n        }\n      }\n\n      memo[target] = styleTarget;\n    }\n\n    return memo[target];\n  };\n}();\n\nfunction listToStyles(list, options) {\n  var styles = [];\n  var newStyles = {};\n\n  for (var i = 0; i < list.length; i++) {\n    var item = list[i];\n    var id = options.base ? item[0] + options.base : item[0];\n    var css = item[1];\n    var media = item[2];\n    var sourceMap = item[3];\n    var part = {\n      css: css,\n      media: media,\n      sourceMap: sourceMap\n    };\n\n    if (!newStyles[id]) {\n      styles.push(newStyles[id] = {\n        id: id,\n        parts: [part]\n      });\n    } else {\n      newStyles[id].parts.push(part);\n    }\n  }\n\n  return styles;\n}\n\nfunction addStylesToDom(styles, options) {\n  for (var i = 0; i < styles.length; i++) {\n    var item = styles[i];\n    var domStyle = stylesInDom[item.id];\n    var j = 0;\n\n    if (domStyle) {\n      domStyle.refs++;\n\n      for (; j < domStyle.parts.length; j++) {\n        domStyle.parts[j](item.parts[j]);\n      }\n\n      for (; j < item.parts.length; j++) {\n        domStyle.parts.push(addStyle(item.parts[j], options));\n      }\n    } else {\n      var parts = [];\n\n      for (; j < item.parts.length; j++) {\n        parts.push(addStyle(item.parts[j], options));\n      }\n\n      stylesInDom[item.id] = {\n        id: item.id,\n        refs: 1,\n        parts: parts\n      };\n    }\n  }\n}\n\nfunction insertStyleElement(options) {\n  var style = document.createElement('style');\n\n  if (typeof options.attributes.nonce === 'undefined') {\n    var nonce =  true ? __webpack_require__.nc : undefined;\n\n    if (nonce) {\n      options.attributes.nonce = nonce;\n    }\n  }\n\n  Object.keys(options.attributes).forEach(function (key) {\n    style.setAttribute(key, options.attributes[key]);\n  });\n\n  if (typeof options.insert === 'function') {\n    options.insert(style);\n  } else {\n    var target = getTarget(options.insert || 'head');\n\n    if (!target) {\n      throw new Error(\"Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.\");\n    }\n\n    target.appendChild(style);\n  }\n\n  return style;\n}\n\nfunction removeStyleElement(style) {\n  // istanbul ignore if\n  if (style.parentNode === null) {\n    return false;\n  }\n\n  style.parentNode.removeChild(style);\n}\n/* istanbul ignore next  */\n\n\nvar replaceText = function replaceText() {\n  var textStore = [];\n  return function replace(index, replacement) {\n    textStore[index] = replacement;\n    return textStore.filter(Boolean).join('\\n');\n  };\n}();\n\nfunction applyToSingletonTag(style, index, remove, obj) {\n  var css = remove ? '' : obj.css; // For old IE\n\n  /* istanbul ignore if  */\n\n  if (style.styleSheet) {\n    style.styleSheet.cssText = replaceText(index, css);\n  } else {\n    var cssNode = document.createTextNode(css);\n    var childNodes = style.childNodes;\n\n    if (childNodes[index]) {\n      style.removeChild(childNodes[index]);\n    }\n\n    if (childNodes.length) {\n      style.insertBefore(cssNode, childNodes[index]);\n    } else {\n      style.appendChild(cssNode);\n    }\n  }\n}\n\nfunction applyToTag(style, options, obj) {\n  var css = obj.css;\n  var media = obj.media;\n  var sourceMap = obj.sourceMap;\n\n  if (media) {\n    style.setAttribute('media', media);\n  }\n\n  if (sourceMap && btoa) {\n    css += \"\\n/*# sourceMappingURL=data:application/json;base64,\".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), \" */\");\n  } // For old IE\n\n  /* istanbul ignore if  */\n\n\n  if (style.styleSheet) {\n    style.styleSheet.cssText = css;\n  } else {\n    while (style.firstChild) {\n      style.removeChild(style.firstChild);\n    }\n\n    style.appendChild(document.createTextNode(css));\n  }\n}\n\nvar singleton = null;\nvar singletonCounter = 0;\n\nfunction addStyle(obj, options) {\n  var style;\n  var update;\n  var remove;\n\n  if (options.singleton) {\n    var styleIndex = singletonCounter++;\n    style = singleton || (singleton = insertStyleElement(options));\n    update = applyToSingletonTag.bind(null, style, styleIndex, false);\n    remove = applyToSingletonTag.bind(null, style, styleIndex, true);\n  } else {\n    style = insertStyleElement(options);\n    update = applyToTag.bind(null, style, options);\n\n    remove = function remove() {\n      removeStyleElement(style);\n    };\n  }\n\n  update(obj);\n  return function updateStyle(newObj) {\n    if (newObj) {\n      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {\n        return;\n      }\n\n      update(obj = newObj);\n    } else {\n      remove();\n    }\n  };\n}\n\nmodule.exports = function (list, options) {\n  options = options || {};\n  options.attributes = typeof options.attributes === 'object' ? options.attributes : {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>\n  // tags it will allow on a page\n\n  if (!options.singleton && typeof options.singleton !== 'boolean') {\n    options.singleton = isOldIE();\n  }\n\n  var styles = listToStyles(list, options);\n  addStylesToDom(styles, options);\n  return function update(newList) {\n    var mayRemove = [];\n\n    for (var i = 0; i < styles.length; i++) {\n      var item = styles[i];\n      var domStyle = stylesInDom[item.id];\n\n      if (domStyle) {\n        domStyle.refs--;\n        mayRemove.push(domStyle);\n      }\n    }\n\n    if (newList) {\n      var newStyles = listToStyles(newList, options);\n      addStylesToDom(newStyles, options);\n    }\n\n    for (var _i = 0; _i < mayRemove.length; _i++) {\n      var _domStyle = mayRemove[_i];\n\n      if (_domStyle.refs === 0) {\n        for (var j = 0; j < _domStyle.parts.length; j++) {\n          _domStyle.parts[j]();\n        }\n\n        delete stylesInDom[_domStyle.id];\n      }\n    }\n  };\n};\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js?");

/***/ }),

/***/ "../../node_modules/unistore/preact.js":
/*!******************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/unistore/preact.js ***!
  \******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var t=__webpack_require__(/*! preact */ \"../../node_modules/preact/dist/preact.module.js\");function n(t,n){for(var r in n)t[r]=n[r];return t}function r(t){this.getChildContext=function(){return{store:t.store}}}r.prototype.render=function(t){return t.children&&t.children[0]||t.children},exports.connect=function(r,e){var o;return\"function\"!=typeof r&&(\"string\"==typeof(o=r||{})&&(o=o.split(/\\s*,\\s*/)),r=function(t){for(var n={},r=0;r<o.length;r++)n[o[r]]=t[o[r]];return n}),function(o){function i(i,u){var c=this,f=u.store,s=r(f?f.getState():{},i),a=e?function(t,n){\"function\"==typeof t&&(t=t(n));var r={};for(var e in t)r[e]=n.action(t[e]);return r}(e,f):{store:f},p=function(){var t=r(f?f.getState():{},i);for(var n in t)if(t[n]!==s[n])return s=t,c.setState({});for(var e in s)if(!(e in t))return s=t,c.setState({})};this.componentWillReceiveProps=function(t){i=t,p()},this.componentDidMount=function(){f.subscribe(p)},this.componentWillUnmount=function(){f.unsubscribe(p)},this.render=function(r){return t.h(o,n(n(n({},a),r),s))}}return(i.prototype=new t.Component).constructor=i}},exports.Provider=r;\n//# sourceMappingURL=preact.js.map\n\n\n//# sourceURL=webpack:///C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/unistore/preact.js?");

/***/ }),

/***/ "../../node_modules/webpack-plugin-serve/client.js":
/*!****************************************!*\
  !*** (webpack)-plugin-serve/client.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*\n  Copyright © 2018 Andrew Powell\n\n  This Source Code Form is subject to the terms of the Mozilla Public\n  License, v. 2.0. If a copy of the MPL was not distributed with this\n  file, You can obtain one at http://mozilla.org/MPL/2.0/.\n\n  The above copyright notice and this permission notice shall be\n  included in all copies or substantial portions of this Source Code Form.\n*/\n\n/**\n * @note This file exists merely as an easy reference for folks adding it to their configuration entries\n */\n\n(() => {\n  /* eslint-disable global-require */\n  const { run } = __webpack_require__(/*! ./lib/client/client */ \"../../node_modules/webpack-plugin-serve/lib/client/client.js\");\n  let hash = '<unknown>';\n  let options;\n  try {\n    options = {\"compress\":null,\"headers\":null,\"historyFallback\":false,\"hmr\":true,\"host\":\"localhost\",\"liveReload\":false,\"log\":{\"level\":\"info\",\"prefix\":{\"template\":\"{{level}}\"},\"name\":\"webpack-plugin-serve\"},\"open\":true,\"port\":3000,\"progress\":\"minimal\",\"ramdisk\":false,\"secure\":false,\"static\":\"public\",\"status\":true,\"address\":\"localhost:3000\",\"compilerName\":null,\"wpsId\":\"17b3170\"};\n  } catch (e) {\n    const { log } = __webpack_require__(/*! ./lib/client/log */ \"../../node_modules/webpack-plugin-serve/lib/client/log.js\");\n    log.error(\n      'The entry for webpack-plugin-serve was included in your build, but it does not appear that the plugin was. Please check your configuration.'\n    );\n  }\n\n  try {\n    // eslint-disable-next-line camelcase\n    hash = __webpack_require__.h();\n  } catch (e) {} // eslint-disable-line no-empty\n\n  run(hash, options);\n})();\n\n\n//# sourceURL=webpack:///(webpack)-plugin-serve/client.js?");

/***/ }),

/***/ "../../node_modules/webpack-plugin-serve/lib/client/ClientSocket.js":
/*!*********************************************************!*\
  !*** (webpack)-plugin-serve/lib/client/ClientSocket.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*\n  Copyright © 2018 Andrew Powell\n\n  This Source Code Form is subject to the terms of the Mozilla Public\n  License, v. 2.0. If a copy of the MPL was not distributed with this\n  file, You can obtain one at http://mozilla.org/MPL/2.0/.\n\n  The above copyright notice and this permission notice shall be\n  included in all copies or substantial portions of this Source Code Form.\n*/\nconst { error, refresh, warn } = __webpack_require__(/*! ./log */ \"../../node_modules/webpack-plugin-serve/lib/client/log.js\")();\n\n// ignore 1008 (HTTP 400 equivalent) and 1011 (HTTP 500 equivalent)\nconst ignoreCodes = [1008, 1011];\nconst maxAttempts = 10;\n\nclass ClientSocket {\n  constructor(options, ...args) {\n    this.args = args;\n    this.attempts = 0;\n    this.eventHandlers = [];\n    this.options = options;\n    this.retrying = false;\n\n    this.connect();\n  }\n\n  addEventListener(...args) {\n    this.eventHandlers.push(args);\n    this.socket.addEventListener(...args);\n  }\n\n  close() {\n    this.socket.close();\n  }\n\n  connect() {\n    if (this.socket) {\n      delete this.socket;\n    }\n\n    this.connecting = true;\n\n    this.socket = new WebSocket(...this.args);\n\n    if (this.options.retry) {\n      this.socket.addEventListener('close', (event) => {\n        if (ignoreCodes.includes(event.code)) {\n          return;\n        }\n\n        if (!this.retrying) {\n          warn(`The WebSocket was closed and will attempt to reconnect`);\n        }\n\n        this.reconnect();\n      });\n    } else {\n      this.socket.onclose = () => warn(`The client WebSocket was closed. ${refresh}`);\n    }\n\n    this.socket.addEventListener('open', () => {\n      this.attempts = 0;\n      this.retrying = false;\n    });\n\n    if (this.eventHandlers.length) {\n      for (const [name, fn] of this.eventHandlers) {\n        this.socket.addEventListener(name, fn);\n      }\n    }\n  }\n\n  reconnect() {\n    this.attempts += 1;\n    this.retrying = true;\n\n    if (this.attempts > maxAttempts) {\n      error(`The WebSocket could not be reconnected. ${refresh}`);\n      this.retrying = false;\n      return;\n    }\n\n    const timeout = 1000 * this.attempts ** 2;\n\n    setTimeout(() => this.connect(this.args), timeout);\n  }\n\n  removeEventListener(...args) {\n    const [, handler] = args;\n    this.eventHandlers = this.eventHandlers.filter(([, fn]) => fn === handler);\n    this.socket.removeEventListener(...args);\n  }\n}\n\nmodule.exports = { ClientSocket };\n\n\n//# sourceURL=webpack:///(webpack)-plugin-serve/lib/client/ClientSocket.js?");

/***/ }),

/***/ "../../node_modules/webpack-plugin-serve/lib/client/client.js":
/*!***************************************************!*\
  !*** (webpack)-plugin-serve/lib/client/client.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*\n  Copyright © 2018 Andrew Powell\n\n  This Source Code Form is subject to the terms of the Mozilla Public\n  License, v. 2.0. If a copy of the MPL was not distributed with this\n  file, You can obtain one at http://mozilla.org/MPL/2.0/.\n\n  The above copyright notice and this permission notice shall be\n  included in all copies or substantial portions of this Source Code Form.\n*/\n/* eslint-disable global-require */\nconst run = (buildHash, options) => {\n  const { address, client = {}, progress, secure, status } = options;\n\n  options.firstInstance = !window.webpackPluginServe; // eslint-disable-line no-param-reassign\n\n  window.webpackPluginServe = window.webpackPluginServe || {\n    compilers: {}\n  };\n  window.webpackPluginServe.silent = !!client.silent;\n\n  const { ClientSocket } = __webpack_require__(/*! ./ClientSocket */ \"../../node_modules/webpack-plugin-serve/lib/client/ClientSocket.js\");\n  const { replace } = __webpack_require__(/*! ./hmr */ \"../../node_modules/webpack-plugin-serve/lib/client/hmr.js\");\n  const { error, info, warn } = __webpack_require__(/*! ./log */ \"../../node_modules/webpack-plugin-serve/lib/client/log.js\")();\n\n  const protocol = secure ? 'wss' : 'ws';\n  const socket = new ClientSocket(client, `${protocol}://${client.address || address}/wps`);\n\n  const { compilerName } = options;\n\n  window.webpackPluginServe.compilers[compilerName] = {};\n\n  // prevents ECONNRESET errors on the server\n  window.addEventListener('beforeunload', () => socket.close());\n\n  socket.addEventListener('message', (message) => {\n    const { action, data = {} } = JSON.parse(message.data);\n    const { errors, hash = '<?>', warnings } = data || {};\n    const shortHash = hash.slice(0, 7);\n    const identifier = options.compilerName ? `(Compiler: ${options.compilerName}) ` : '';\n    const compiler = window.webpackPluginServe.compilers[compilerName];\n    const { wpsId } = data;\n\n    switch (action) {\n      case 'build':\n        compiler.done = false;\n        break;\n      case 'connected':\n        info(`WebSocket connected ${identifier}`);\n        break;\n      case 'done':\n        compiler.done = true;\n        break;\n      case 'problems':\n        if (data.errors.length) {\n          error(`${identifier}Build ${shortHash} produced errors:\\n`, errors);\n        }\n        if (data.warnings.length) {\n          warn(`${identifier}Build ${shortHash} produced warnings:\\n`, warnings);\n        }\n        break;\n      case 'reload':\n        window.location.reload();\n        break;\n      case 'replace':\n        // actions with a wpsId in tow indicate actions that should only be executed when the wpsId sent\n        // matches the wpsId set in options. this is how we can identify multiple compilers in the\n        // client.\n        if (wpsId && wpsId === options.wpsId) {\n          replace(buildHash, hash);\n        }\n        break;\n      default:\n    }\n  });\n\n  if (options.firstInstance) {\n    if (progress === 'minimal') {\n      const { init } = __webpack_require__(/*! ./overlays/progress-minimal */ \"../../node_modules/webpack-plugin-serve/lib/client/overlays/progress-minimal.js\");\n      init(options, socket);\n    } else if (progress) {\n      const { init } = __webpack_require__(/*! ./overlays/progress */ \"../../node_modules/webpack-plugin-serve/lib/client/overlays/progress.js\");\n      init(options, socket);\n    }\n\n    if (status) {\n      const { init } = __webpack_require__(/*! ./overlays/status */ \"../../node_modules/webpack-plugin-serve/lib/client/overlays/status.js\");\n      init(options, socket);\n    }\n\n    if (true) {\n      info('Hot Module Replacement is active');\n\n      if (options.liveReload) {\n        info('Live Reload taking precedence over Hot Module Replacement');\n      }\n    } else {}\n\n    if (false) {}\n  }\n};\n\nmodule.exports = { run };\n\n\n//# sourceURL=webpack:///(webpack)-plugin-serve/lib/client/client.js?");

/***/ }),

/***/ "../../node_modules/webpack-plugin-serve/lib/client/hmr.js":
/*!************************************************!*\
  !*** (webpack)-plugin-serve/lib/client/hmr.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*\n  Copyright © 2018 Andrew Powell\n\n  This Source Code Form is subject to the terms of the Mozilla Public\n  License, v. 2.0. If a copy of the MPL was not distributed with this\n  file, You can obtain one at http://mozilla.org/MPL/2.0/.\n\n  The above copyright notice and this permission notice shall be\n  included in all copies or substantial portions of this Source Code Form.\n*/\nconst { error, info, refresh, warn } = __webpack_require__(/*! ./log */ \"../../node_modules/webpack-plugin-serve/lib/client/log.js\")();\n\nlet latest = true;\n\nconst hmr = {\n  onUnaccepted(data) {\n    warn('Change in unaccepted module(s):\\n', data);\n    warn(data);\n  },\n  onDeclined(data) {\n    warn('Change in declined module(s):\\n', data);\n  },\n  onErrored(data) {\n    error('Error in module(s):\\n', data);\n  }\n};\n\nconst replace = async (buildHash, hash) => {\n  const { apply, check, status } = module.hot;\n\n  if (hash) {\n    // eslint-disable-next-line no-undef\n    latest = hash.includes(buildHash);\n  }\n\n  if (!latest) {\n    const hmrStatus = status();\n\n    if (hmrStatus === 'abort' || hmrStatus === 'fail') {\n      warn(`An HMR update was triggered, but ${hmrStatus}ed. ${refresh}`);\n      return;\n    }\n\n    let modules;\n\n    try {\n      modules = await check(false);\n    } catch (e) {\n      // noop. this typically happens when a MultiCompiler has more than one compiler that includes\n      // this script, and an update happens with a hash that isn't part of the compiler/module this\n      // instance was loaded for.\n      return;\n    }\n\n    if (!modules) {\n      warn(`No modules found for replacement. ${refresh}`);\n      return;\n    }\n\n    modules = await apply(hmr);\n\n    if (modules) {\n      latest = true;\n      info(`Build ${hash.slice(0, 7)} replaced:\\n`, modules);\n    }\n  }\n};\n\nmodule.exports = { replace };\n\n\n//# sourceURL=webpack:///(webpack)-plugin-serve/lib/client/hmr.js?");

/***/ }),

/***/ "../../node_modules/webpack-plugin-serve/lib/client/log.js":
/*!************************************************!*\
  !*** (webpack)-plugin-serve/lib/client/log.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/*\n  Copyright © 2018 Andrew Powell\n\n  This Source Code Form is subject to the terms of the Mozilla Public\n  License, v. 2.0. If a copy of the MPL was not distributed with this\n  file, You can obtain one at http://mozilla.org/MPL/2.0/.\n\n  The above copyright notice and this permission notice shall be\n  included in all copies or substantial portions of this Source Code Form.\n*/\nconst { error, info, warn } = console;\nconst log = {\n  error: error.bind(console, '⬡ wps:'),\n  info: info.bind(console, '⬡ wps:'),\n  refresh: 'Please refresh the page',\n  warn: warn.bind(console, '⬡ wps:')\n};\nconst noop = () => {};\nconst silent = {\n  error: noop,\n  info: noop,\n  warn: noop\n};\n\nmodule.exports = () => (window.webpackPluginServe.silent ? silent : log);\n\n\n//# sourceURL=webpack:///(webpack)-plugin-serve/lib/client/log.js?");

/***/ }),

/***/ "../../node_modules/webpack-plugin-serve/lib/client/overlays/progress-minimal.js":
/*!**********************************************************************!*\
  !*** (webpack)-plugin-serve/lib/client/overlays/progress-minimal.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*\n  Copyright © 2018 Andrew Powell, Matheus Gonçalves da Silva\n\n  This Source Code Form is subject to the terms of the Mozilla Public\n  License, v. 2.0. If a copy of the MPL was not distributed with this\n  file, You can obtain one at http://mozilla.org/MPL/2.0/.\n\n  The above copyright notice and this permission notice shall be\n  included in all copies or substantial portions of this Source Code Form.\n*/\nconst { addCss, addHtml } = __webpack_require__(/*! ./util */ \"../../node_modules/webpack-plugin-serve/lib/client/overlays/util.js\");\n\nconst ns = 'wps-progress-minimal';\nconst html = `\n<div id=\"${ns}\" class=\"${ns}-hidden\">\n  <div id=\"${ns}-bar\"></div>\n</div>\n`;\nconst css = `\n#${ns} {\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 4px;\n  width: 100vw;\n  z-index: 2147483645;\n}\n\n#${ns}-bar {\n  width: 0%;\n  height: 4px;\n  background-color: rgb(186, 223, 172);\n  transition: width 1s ease-in-out;\n}\n\n.${ns}-hidden{\n  display: none;\n}\n`;\n\nconst update = (percent) => {\n  const bar = document.querySelector(`#${ns}-bar`);\n  bar.style.width = `${percent}%`;\n};\n\nconst reset = (wrapper) => {\n  wrapper.classList.add(`${ns}-hidden`);\n  setTimeout(() => update(0), 1e3);\n};\n\nconst init = (options, socket) => {\n  if (options.firstInstance) {\n    document.addEventListener('DOMContentLoaded', () => {\n      addCss(css);\n      addHtml(html);\n    });\n  }\n\n  socket.addEventListener('message', (message) => {\n    const { action, data } = JSON.parse(message.data);\n\n    if (action !== 'progress') {\n      return;\n    }\n\n    const percent = Math.floor(data.percent * 100);\n    const wrapper = document.querySelector(`#${ns}`);\n\n    wrapper.classList.remove(`${ns}-hidden`);\n\n    if (data.percent === 1) {\n      setTimeout(() => reset(wrapper), 5e3);\n    }\n\n    update(percent);\n  });\n};\n\nmodule.exports = {\n  init\n};\n\n\n//# sourceURL=webpack:///(webpack)-plugin-serve/lib/client/overlays/progress-minimal.js?");

/***/ }),

/***/ "../../node_modules/webpack-plugin-serve/lib/client/overlays/progress.js":
/*!**************************************************************!*\
  !*** (webpack)-plugin-serve/lib/client/overlays/progress.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*\n  Copyright © 2018 Andrew Powell, Matheus Gonçalves da Silva\n\n  This Source Code Form is subject to the terms of the Mozilla Public\n  License, v. 2.0. If a copy of the MPL was not distributed with this\n  file, You can obtain one at http://mozilla.org/MPL/2.0/.\n\n  The above copyright notice and this permission notice shall be\n  included in all copies or substantial portions of this Source Code Form.\n*/\nconst { addCss, addHtml } = __webpack_require__(/*! ./util */ \"../../node_modules/webpack-plugin-serve/lib/client/overlays/util.js\");\n\nconst ns = 'wps-progress';\nconst css = `\n@import url('https://fonts.googleapis.com/css?family=Open+Sans:400,700');\n\n#${ns}{\n  width: 200px;\n  height: 200px;\n  position: absolute;\n  right: 5%;\n  top: 5%;\n  transition: opacity .25s ease-in-out;\n  z-index: 2147483645;\n}\n\n#${ns}-bg {\n  fill: #282d35;\n}\n\n#${ns}-fill {\n  fill: rgba(0, 0, 0, 0);\n  stroke: rgb(186, 223, 172);\n  stroke-dasharray: 219.99078369140625;\n  stroke-dashoffset: -219.99078369140625;\n  stroke-width: 10;\n  transform: rotate(90deg)translate(0px, -80px);\n  transition: stroke-dashoffset 1s;\n}\n\n#${ns}-percent {\n  font-family: 'Open Sans';\n  font-size: 18px;\n  fill: #ffffff;\n}\n\n#${ns}-percent-value {\n  dominant-baseline: middle;\n  text-anchor: middle;\n}\n\n#${ns}-percent-super {\n  fill: #bdc3c7;\n  font-size: .45em;\n  baseline-shift: 10%;\n}\n\n.${ns}-noselect {\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -khtml-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  cursor: default;\n}\n\n@keyframes ${ns}-hidden-display {\n\t0% {\n\t\topacity: 1;\n\t\ttransform: scale(1);\n\t\t-webkit-transform: scale(1);\n\t}\n\t99% {\n\t\tdisplay: inline-flex;\n\t\topacity: 0;\n\t\ttransform: scale(0);\n\t\t-webkit-transform: scale(0);\n\t}\n\t100% {\n\t\tdisplay: none;\n\t\topacity: 0;\n\t\ttransform: scale(0);\n\t\t-webkit-transform: scale(0);\n\t}\n}\n\n.${ns}-hidden {\n  animation: ${ns}-hidden-display .3s;\n  animation-fill-mode:forwards;\n  display: inline-flex;\n}\n\n.${ns}-hidden-onload {\n  display: none;\n}\n`;\n\nconst html = `\n<svg id=\"${ns}\" class=\"${ns}-noselect ${ns}-hidden-onload\" x=\"0px\" y=\"0px\" viewBox=\"0 0 80 80\">\n  <circle id=\"${ns}-bg\" cx=\"50%\" cy=\"50%\" r=\"35\"></circle>\n  <path id=\"${ns}-fill\" d=\"M5,40a35,35 0 1,0 70,0a35,35 0 1,0 -70,0\" />\n  <text id=\"${ns}-percent\" x=\"50%\" y=\"51%\"><tspan id=\"${ns}-percent-value\">0</tspan><tspan id=\"${ns}-percent-super\">%</tspan></text>\n</svg>\n`;\n\nconst update = (percent) => {\n  const max = -219.99078369140625;\n  const value = document.querySelector(`#${ns}-percent-value`);\n  const track = document.querySelector(`#${ns}-fill`);\n  const offset = ((100 - percent) / 100) * max;\n\n  track.setAttribute('style', `stroke-dashoffset: ${offset}`);\n  value.innerHTML = percent.toString();\n};\n\nconst reset = (svg) => {\n  svg.classList.add(`${ns}-hidden`);\n  setTimeout(() => update(0), 1e3);\n};\n\nconst init = (options, socket) => {\n  if (options.firstInstance) {\n    document.addEventListener('DOMContentLoaded', () => {\n      addCss(css);\n      addHtml(html);\n    });\n  }\n\n  socket.addEventListener('message', (message) => {\n    const { action, data } = JSON.parse(message.data);\n\n    if (action !== 'progress') {\n      return;\n    }\n\n    const percent = Math.floor(data.percent * 100);\n    const svg = document.querySelector(`#${ns}`);\n\n    if (!svg) {\n      return;\n    }\n\n    // we can safely call this even if it doesn't have the class\n    svg.classList.remove(`${ns}-hidden`, `${ns}-hidden-onload`);\n\n    if (data.percent === 1) {\n      setTimeout(() => reset(svg), 5e3);\n    }\n\n    update(percent);\n  });\n};\n\nmodule.exports = { init };\n\n\n//# sourceURL=webpack:///(webpack)-plugin-serve/lib/client/overlays/progress.js?");

/***/ }),

/***/ "../../node_modules/webpack-plugin-serve/lib/client/overlays/status.js":
/*!************************************************************!*\
  !*** (webpack)-plugin-serve/lib/client/overlays/status.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*\n  Copyright © 2018 Andrew Powell\n\n  This Source Code Form is subject to the terms of the Mozilla Public\n  License, v. 2.0. If a copy of the MPL was not distributed with this\n  file, You can obtain one at http://mozilla.org/MPL/2.0/.\n\n  The above copyright notice and this permission notice shall be\n  included in all copies or substantial portions of this Source Code Form.\n*/\nconst { addCss, addHtml, socketMessage } = __webpack_require__(/*! ./util */ \"../../node_modules/webpack-plugin-serve/lib/client/overlays/util.js\");\n\nconst ns = 'wps-status';\nconst css = `\n@import url('https://fonts.googleapis.com/css?family=Open+Sans:400,700');\n\n#${ns} {\n  background: #282d35;\n  border-radius: 0.6em;\n  display: flex;\n  flex-direction: column;\n\tfont-family: 'Open Sans', Helvetica, Arial, sans-serif;\n\tfont-size: 10px;\n  height: 90%;\n  min-height: 20em;\n  left: 50%;\n  opacity: 1;\n  overflow: hidden;\n  padding-bottom: 3em;\n  position: absolute;\n  top: 2rem;\n  transform: translateX(-50%);\n  transition: opacity .25s ease-in-out;\n  width: 95%;\n  z-index: 2147483645;\n}\n\n@keyframes ${ns}-hidden-display {\n\t0% {\n\t\topacity: 1;\n\t}\n\t99% {\n\t\tdisplay: inline-flex;\n\t\topacity: 0;\n\t}\n\t100% {\n\t\tdisplay: none;\n\t\topacity: 0;\n\t}\n}\n\n#${ns}.${ns}-hidden {\n  animation: ${ns}-hidden-display .3s;\n  animation-fill-mode:forwards;\n  display: none;\n}\n\n#${ns}.${ns}-min {\n  animation: minimize 10s;\n  bottom: 2em;\n  cursor: pointer;\n  height: 6em;\n  left: auto;\n  min-height: 6em;\n  padding-bottom: 0;\n  position: absolute;\n  right: 2em;\n  top: auto;\n  transform: none;\n  width: 6em;\n}\n\n#${ns}.${ns}-min #${ns}-beacon {\n  display: block;\n}\n\n#${ns}-title {\n  color: #fff;\n  font-size: 1.2em;\n  font-weight: normal;\n  margin: 0;\n  padding: 0.6em 0;\n  text-align: center;\n  width: 100%;\n}\n\n#${ns}.${ns}-min #${ns}-title {\n  display: none;\n}\n\n#${ns}-title-errors {\n  color: #ff5f58;\n  font-style: normal;\n  padding-left: 1em;\n}\n\n#${ns}-title-warnings {\n  color: #ffbd2e;\n  font-style: normal;\n  padding-left: 1em;\n}\n\n#${ns}-problems {\n  overflow-y: auto;\n  padding: 1em 2em;\n}\n\n#${ns}-problems pre {\n  color: #ddd;\n  background: #282d35;\n  display: block;\n  font-size: 1.3em;\n\tfont-family: 'Open Sans', Helvetica, Arial, sans-serif;\n  white-space: pre-wrap;\n}\n\n#${ns}-problems pre em {\n  background: #ff5f58;\n  border-radius: 0.3em;\n  color: #641e16;\n  font-style: normal;\n  line-height: 3em;\n  margin-right: 0.4em;\n  padding: 0.1em 0.4em;\n  text-transform: uppercase;\n}\n\npre#${ns}-warnings em {\n  background: #ffbd2e;\n  color: #3e2723;\n}\n\npre#${ns}-success {\n  display: none;\n  text-align: center;\n}\n\npre#${ns}-success em {\n  background: #7fb900;\n  color: #004d40;\n}\n\n#${ns}-problems.${ns}-success #${ns}-success {\n  display: block;\n}\n\n#${ns}.${ns}-min #${ns}-problems {\n  display: none;\n}\n\n#${ns}-nav {\n  opacity: 0.5;\n  padding: 1.2em;\n  position: absolute;\n}\n\n#${ns}.${ns}-min #${ns}-nav {\n  display: none;\n}\n\n#${ns}-nav:hover {\n  opacity: 1;\n}\n\n#${ns}-nav div {\n  background: #ff5f58;\n  border-radius: 1.2em;\n  cursor: pointer;\n  display: inline-block;\n  height: 1.2em;\n  position: relative;\n  width: 1.2em;\n}\n\ndiv#${ns}-min {\n  background: #ffbd2e;\n  margin-left: 0.8em;\n}\n\n#${ns}-beacon {\n  border-radius: 3em;\n  display: none;\n  font-size: 10px;\n  height: 3em;\n  margin: 1.6em auto;\n  position: relative;\n  width: 3em;\n}\n\n#${ns}-beacon:before, #${ns}-beacon:after {\n  content: '';\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background: rgba(127,185,0, 0.2);\n  border-radius: 3em;\n  opacity: 0;\n}\n\n#${ns}-beacon:before {\n  animation: ${ns}-pulse 3s infinite linear;\n  transform: scale(1);\n}\n\n#${ns}-beacon:after {\n  animation: ${ns}-pulse 3s 2s infinite linear;\n}\n\n\n@keyframes ${ns}-pulse {\n  0% {\n    opacity: 0;\n    transform: scale(0.6);\n  }\n  33% {\n    opacity: 1;\n    transform: scale(1);\n  }\n  100% {\n    opacity: 0;\n    transform: scale(1.4);\n  }\n}\n\n#${ns}-beacon mark {\n  background: rgba(127, 185, 0, 1);\n  border-radius: 100% 100%;\n  height: 1em;\n  left: 1em;\n  position: absolute;\n  top: 1em;\n  width: 1em;\n}\n\n#${ns}-beacon.${ns}-error mark {\n  background: #ff5f58;\n}\n\n#${ns}-beacon.${ns}-error:before, #${ns}-beacon.error:after {\n  background: rgba(255, 95, 88, 0.2);\n}\n\n#${ns}-beacon.${ns}-warning mark {\n  background: #ffbd2e;\n}\n\n#${ns}-beacon.${ns}-warning:before, #${ns}-beacon.warning:after {\n  background: rgba(255, 189, 46, 0.2);\n}\n`;\n\nconst html = `\n<aside id=\"${ns}\" class=\"${ns}-hidden\" title=\"build status\">\n  <figure id=\"${ns}-beacon\">\n    <mark/>\n  </figure>\n  <nav id=\"${ns}-nav\">\n    <div id=\"${ns}-close\" title=\"close\"></div>\n    <div id=\"${ns}-min\" title=\"minmize\"></div>\n  </nav>\n  <h1 id=\"${ns}-title\">\n    build status\n    <em id=\"${ns}-title-errors\"></em>\n    <em id=\"${ns}-title-warnings\"></em>\n  </h1>\n  <article id=\"${ns}-problems\">\n    <pre id=\"${ns}-success\"><em>Build Successful</em></pre>\n    <pre id=\"${ns}-errors\"></pre>\n    <pre id=\"${ns}-warnings\"></pre>\n  </article>\n</aside>\n`;\n\nconst init = (options, socket) => {\n  const hidden = `${ns}-hidden`;\n  let hasProblems = false;\n  let aside;\n  let beacon;\n  let problems;\n  let preErrors;\n  let preWarnings;\n  let titleErrors;\n  let titleWarnings;\n\n  const reset = () => {\n    preErrors.innerHTML = '';\n    preWarnings.innerHTML = '';\n    problems.classList.remove(`${ns}-success`);\n    beacon.className = '';\n    titleErrors.innerText = '';\n    titleWarnings.innerText = '';\n  };\n\n  const addErrors = (errors) => {\n    if (errors.length) {\n      problems.classList.remove(`${ns}-success`);\n      beacon.classList.add(`${ns}-error`);\n\n      for (const error of errors) {\n        const markup = `<div><em>Error</em> in ${error}</div>`;\n        addHtml(markup, preErrors);\n      }\n\n      titleErrors.innerText = `${errors.length} Error(s)`;\n    } else {\n      titleErrors.innerText = '';\n    }\n    aside.classList.remove(hidden);\n  };\n\n  const addWarnings = (warnings) => {\n    if (warnings.length) {\n      problems.classList.remove(`${ns}-success`);\n\n      if (!beacon.classList.contains(`${ns}-error`)) {\n        beacon.classList.add(`${ns}-warning`);\n      }\n\n      for (const warning of warnings) {\n        const markup = `<div><em>Warning</em> in ${warning}</div>`;\n        addHtml(markup, preWarnings);\n      }\n\n      titleWarnings.innerText = `${warnings.length} Warning(s)`;\n    } else {\n      titleWarnings.innerText = '';\n    }\n\n    aside.classList.remove(hidden);\n  };\n\n  if (options.firstInstance) {\n    document.addEventListener('DOMContentLoaded', () => {\n      addCss(css);\n      [aside] = addHtml(html);\n      beacon = document.querySelector(`#${ns}-beacon`);\n      problems = document.querySelector(`#${ns}-problems`);\n      preErrors = document.querySelector(`#${ns}-errors`);\n      preWarnings = document.querySelector(`#${ns}-warnings`);\n      titleErrors = document.querySelector(`#${ns}-title-errors`);\n      titleWarnings = document.querySelector(`#${ns}-title-warnings`);\n\n      const close = document.querySelector(`#${ns}-close`);\n      const min = document.querySelector(`#${ns}-min`);\n\n      aside.addEventListener('click', () => {\n        aside.classList.remove(`${ns}-min`);\n      });\n\n      close.addEventListener('click', () => {\n        aside.classList.add(`${ns}-hidden`);\n      });\n\n      min.addEventListener('click', (e) => {\n        aside.classList.add(`${ns}-min`);\n        e.stopImmediatePropagation();\n      });\n    });\n  }\n\n  socketMessage(socket, (action, data) => {\n    if (!aside) {\n      return;\n    }\n\n    const { compilers } = window.webpackPluginServe;\n\n    switch (action) {\n      case 'build':\n        // clear errors and warnings when a new build begins\n        reset();\n        break;\n      case 'problems':\n        addErrors(data.errors);\n        addWarnings(data.warnings);\n        aside.classList.remove(hidden);\n        hasProblems = data.errors.length || data.warnings.length;\n        break;\n      case 'replace':\n        // if there's a compiler that isn't done yet, hold off and let it run the show\n        for (const compilerName of Object.keys(compilers)) {\n          if (!compilers[compilerName]) {\n            return;\n          }\n        }\n\n        if (hasProblems && !preErrors.children.length && !preWarnings.children.length) {\n          reset();\n          hasProblems = false;\n          problems.classList.add(`${ns}-success`);\n          aside.classList.remove(hidden);\n\n          setTimeout(() => aside.classList.add(hidden), 3e3);\n        }\n        break;\n      default:\n    }\n  });\n};\n\nmodule.exports = { init };\n\n\n//# sourceURL=webpack:///(webpack)-plugin-serve/lib/client/overlays/status.js?");

/***/ }),

/***/ "../../node_modules/webpack-plugin-serve/lib/client/overlays/util.js":
/*!**********************************************************!*\
  !*** (webpack)-plugin-serve/lib/client/overlays/util.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/*\n  Copyright © 2018 Andrew Powell\n\n  This Source Code Form is subject to the terms of the Mozilla Public\n  License, v. 2.0. If a copy of the MPL was not distributed with this\n  file, You can obtain one at http://mozilla.org/MPL/2.0/.\n\n  The above copyright notice and this permission notice shall be\n  included in all copies or substantial portions of this Source Code Form.\n*/\nconst addHtml = (html, parent) => {\n  const div = document.createElement('div');\n  const nodes = [];\n\n  div.innerHTML = html.trim();\n\n  while (div.firstChild) {\n    nodes.push((parent || document.body).appendChild(div.firstChild));\n  }\n\n  return nodes;\n};\n\nconst addCss = (css) => {\n  const style = document.createElement('style');\n\n  style.type = 'text/css';\n\n  if (css.styleSheet) {\n    style.styleSheet.cssText = css;\n  } else {\n    style.appendChild(document.createTextNode(css));\n  }\n\n  // append the stylesheet for the svg\n  document.head.appendChild(style);\n};\n\nconst socketMessage = (socket, handler) => {\n  socket.addEventListener('message', (message) => {\n    const { action, data = {} } = JSON.parse(message.data);\n    handler(action, data);\n  });\n};\n\nmodule.exports = { addCss, addHtml, socketMessage };\n\n\n//# sourceURL=webpack:///(webpack)-plugin-serve/lib/client/overlays/util.js?");

/***/ }),

/***/ "../../node_modules/worker-loader/dist/cjs.js!./src/store-worker.js":
/*!***********************************************************************************************************************************!*\
  !*** C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/worker-loader/dist/cjs.js!./src/store-worker.js ***!
  \***********************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = function() {\n  return new Worker(__webpack_require__.p + \"749e69359e9a47747037.worker.js\");\n};\n\n//# sourceURL=webpack:///./src/store-worker.js?C:/Users/Administrator/Desktop/lerna-demos/monorepo-starterkit/node_modules/worker-loader/dist/cjs.js");

/***/ }),

/***/ "./src/index.jsx":
/*!***********************!*\
  !*** ./src/index.jsx ***!
  \***********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./style.css */ \"./src/style.css\");\n/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_style_css__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! preact */ \"../../node_modules/preact/dist/preact.module.js\");\n/* harmony import */ var unistore_preact__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! unistore/preact */ \"../../node_modules/unistore/preact.js\");\n/* harmony import */ var unistore_preact__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(unistore_preact__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var preact_material_components_Button__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! preact-material-components/Button */ \"../../node_modules/preact-material-components/Button/index.js\");\n/* harmony import */ var preact_material_components_Button__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(preact_material_components_Button__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var preact_material_components_LinearProgress__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! preact-material-components/LinearProgress */ \"../../node_modules/preact-material-components/LinearProgress/index.js\");\n/* harmony import */ var preact_material_components_LinearProgress__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(preact_material_components_LinearProgress__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./store */ \"./src/store.js\");\n/* harmony import */ var preact_compat__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! preact/compat */ \"../../node_modules/preact/compat/dist/compat.module.js\");\nvar __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {\r\n    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;\r\n    if (typeof Reflect === \"object\" && typeof Reflect.decorate === \"function\") r = Reflect.decorate(decorators, target, key, desc);\r\n    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;\r\n    return c > 3 && r && Object.defineProperty(target, key, r), r;\r\n};\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\nlet PerformanceDemo = class PerformanceDemo extends preact__WEBPACK_IMPORTED_MODULE_1__[\"Component\"] {\r\n    constructor() {\r\n        super(...arguments);\r\n        this.renderSpam = spam => (preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(\"div\", { class: \"spam\" }, spam.message));\r\n    }\r\n    render({ spamming, spams = [], start, stop, goInsane }) {\r\n        let offset = Math.max(0, spams.length - 10);\r\n        let visible = spams.slice(offset).reverse();\r\n        return (preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(\"div\", { class: \"demo perf\" },\r\n            preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(\"h2\", null, \"Performance Demo:\"),\r\n            preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(\"header\", null,\r\n                preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(preact_material_components_Button__WEBPACK_IMPORTED_MODULE_3___default.a, { raised: true, ripple: true, onClick: stop, disabled: !spamming }, \"Stop Spamming\"),\r\n                preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(preact_material_components_Button__WEBPACK_IMPORTED_MODULE_3___default.a, { raised: true, ripple: true, onClick: start, disabled: spamming }, \"Start Spamming\"),\r\n                preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(preact_material_components_Button__WEBPACK_IMPORTED_MODULE_3___default.a, { raised: true, ripple: true, onClick: goInsane, disabled: spamming }, \"Go Insane!\")),\r\n            preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(preact_material_components_LinearProgress__WEBPACK_IMPORTED_MODULE_4___default.a, { progress: (spams.length / 2500).toFixed(2) }),\r\n            preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(\"h3\", null,\r\n                \"Last 10 of \",\r\n                spams.length,\r\n                \" messages:\"),\r\n            preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(\"div\", { class: \"spams\" }, visible.map(this.renderSpam))));\r\n    }\r\n};\r\nPerformanceDemo = __decorate([\r\n    Object(unistore_preact__WEBPACK_IMPORTED_MODULE_2__[\"connect\"])('spamming,spams', {\r\n        start: 'spam',\r\n        stop: 'haltSpam',\r\n        // example of an action creator (note: only the creation happens on the main thread)\r\n        goInsane() {\r\n            return { type: 'spam', payload: { duration: 10000, interval: 1 } };\r\n        }\r\n    })\r\n], PerformanceDemo);\r\n/** Example connected Pure Functional Component */\r\nconst CountDemo = Object(unistore_preact__WEBPACK_IMPORTED_MODULE_2__[\"connect\"])('count', {\r\n    // shorthand action creator to invoke \"increment\":\r\n    increment: 'increment',\r\n    // \"inline\" action: runs on the main thread!\r\n    reset() {\r\n        return { count: 0 };\r\n    }\r\n})(({ count, increment, reset }) => (preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(\"div\", { class: \"demo count\" },\r\n    preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(\"h2\", null, \"Counter Demo:\"),\r\n    preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(\"h3\", null,\r\n        \"Count: \",\r\n        count),\r\n    preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(preact_material_components_Button__WEBPACK_IMPORTED_MODULE_3___default.a, { raised: true, ripple: true, onClick: increment }, \"Increment\"),\r\n    preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(preact_material_components_Button__WEBPACK_IMPORTED_MODULE_3___default.a, { raised: true, ripple: true, onClick: reset }, \"Reset\"))));\r\nlet App = () => (preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(unistore_preact__WEBPACK_IMPORTED_MODULE_2__[\"Provider\"], { store: _store__WEBPACK_IMPORTED_MODULE_5__[\"default\"] },\r\n    preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(\"div\", { class: \"app\" },\r\n        preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(\"header\", { class: \"masthead\" },\r\n            preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(\"img\", { src: \"/images/stockroom.svg\" }),\r\n            preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(\"h1\", null, \"Stockroom\"),\r\n            preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(\"a\", { class: \"github\", href: \"https://github.com/developit/stockroom\", target: \"_blank\", rel: \"noopener noreferrer\" }, \"Star on Github\")),\r\n        preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(CountDemo, null),\r\n        preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(PerformanceDemo, null))));\r\nlet node = document.getElementById('app-root');\r\nif (true) {\r\n    ;\r\n    (module).hot.accept();\r\n}\r\nObject(preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"render\"])(preact_compat__WEBPACK_IMPORTED_MODULE_6__[\"default\"].createElement(App, null), node);\r\n//console.log(React.Component.prototype)\r\n\n\n//# sourceURL=webpack:///./src/index.jsx?");

/***/ }),

/***/ "./src/store.js":
/*!**********************!*\
  !*** ./src/store.js ***!
  \**********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nlet store;\r\nconst interopRequire = m => m.default || m;\r\n// This is an example of skipping the Worker entirely during SSR/Prerendering:\r\n// if (PRERENDER) {\r\n// \tlet createStore = interopRequire(require('stockroom/inline'));\r\n// \tstore = createStore(interopRequire(require('./store-worker')));\r\n// }\r\n// else {\r\nlet createStore = interopRequire(__webpack_require__(/*! stockroom */ \"../../node_modules/stockroom/dist/stockroom.es.js\"));\r\nstore = createStore(__webpack_require__(/*! worker-loader!./store-worker */ \"../../node_modules/worker-loader/dist/cjs.js!./src/store-worker.js\")());\r\n//}\r\n/* harmony default export */ __webpack_exports__[\"default\"] = (store);\r\n\n\n//# sourceURL=webpack:///./src/store.js?");

/***/ }),

/***/ "./src/style.css":
/*!***********************!*\
  !*** ./src/style.css ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var content = __webpack_require__(/*! !../../../node_modules/css-loader/dist/cjs.js!./style.css */ \"../../node_modules/css-loader/dist/cjs.js!./src/style.css\");\ncontent = content.__esModule ? content.default : content;\n\nif (typeof content === 'string') {\n  content = [[module.i, content, '']];\n}\n\nvar options = {}\n\noptions.insert = \"head\";\noptions.singleton = false;\n\nvar update = __webpack_require__(/*! ../../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ \"../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js\")(content, options);\n\nif (content.locals) {\n  module.exports = content.locals;\n}\n\nif (true) {\n  if (!content.locals) {\n    module.hot.accept(\n      /*! !../../../node_modules/css-loader/dist/cjs.js!./style.css */ \"../../node_modules/css-loader/dist/cjs.js!./src/style.css\",\n      function () {\n        var newContent = __webpack_require__(/*! !../../../node_modules/css-loader/dist/cjs.js!./style.css */ \"../../node_modules/css-loader/dist/cjs.js!./src/style.css\");\n        newContent = newContent.__esModule ? newContent.default : newContent;\n\n        if (typeof newContent === 'string') {\n          newContent = [[module.i, newContent, '']];\n        }\n        \n        update(newContent);\n      }\n    )\n  }\n\n  module.hot.dispose(function() { \n    update();\n  });\n}\n\n//# sourceURL=webpack:///./src/style.css?");

/***/ }),

/***/ 0:
/*!*********************************************************!*\
  !*** multi ./src/index.jsx webpack-plugin-serve/client ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(/*! ./src/index.jsx */\"./src/index.jsx\");\nmodule.exports = __webpack_require__(/*! webpack-plugin-serve/client */\"../../node_modules/webpack-plugin-serve/client.js\");\n\n\n//# sourceURL=webpack:///multi_./src/index.jsx_webpack-plugin-serve/client?");

/***/ })

/******/ });