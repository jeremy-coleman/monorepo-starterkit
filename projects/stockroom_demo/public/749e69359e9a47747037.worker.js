/******/ (function(modules) { // webpackBootstrap
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
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "../../node_modules/ts-loader/index.js?!./src/store-worker.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../../node_modules/stockroom/worker/index.js":
/*!***********************************************************************************************!*\
  !*** C:/Users/Jeremy/Desktop/gulp/monorepo-starterkit/node_modules/stockroom/worker/index.js ***!
  \***********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var e,t=(e=__webpack_require__(/*! unistore */ \"../../node_modules/unistore/dist/unistore.es.js\"))&&\"object\"==typeof e&&\"default\"in e?e.default:e;function n(e,t){if(Array.isArray(e)){e=e.slice(0,t.length);for(var n=0;n<t.length;n++)void 0!==t[n]&&(e[n]=r(t[n],e[n]))}else for(var o in e=function(e,t){for(var n in t)e[n]=t[n];return e}({},e),t)t.hasOwnProperty(o)&&(void 0===t[o]?delete e[o]:e[o]=r(t[o],e[o]));return e}function r(e,t){return null!=t&&null!=e&&\"object\"==typeof t&&\"object\"==typeof e?n(t,e):e}function o(e,t){var n,r;if(Array.isArray(e))for(n=new Array(e.length),r=0;r<e.length;r++)e[r]!==t[r]&&(n[r]=i(e[r],t[r]));else for(r in n={},e)e.hasOwnProperty(r)&&e[r]!==t[r]&&(n[r]=i(e[r],t[r]));return n}function i(e,t){return\"object\"==typeof e&&\"object\"==typeof t?o(e,t):e}module.exports=function(e){var r=t(e),i=r.actions={},a={},f=0,u=[],s=[];for(var p in e)a[p]=e[p];function c(e){1===s.push(e)&&setTimeout(l)}function l(){\"function\"==typeof postMessage&&postMessage(s),s.length=0}function y(e){if(f>0)return u.push(e);var t=e.type,o=e.id,a=e.overwrite,s=e.update,p=e.action;if(\"@@STATE\"===t)!0===e.partial&&(s=n(r.getState(),s),a=!0),r.setState(s,!0===a,p);else if(\"@@ACTION\"===t){var l=i[p.type];p.params?l.apply(i,p.params):l.call(i,p.payload),o&&c({type:\"@@ACTIONCOMPLETE\",id:o})}}return\"function\"==typeof addEventListener&&addEventListener(\"message\",function(e){var t=e.data;if(\"object\"!=typeof t);else if(\"pop\"in t)if(1===t.length)y(t[0]);else for(var n=0;n<t.length;n++)y(t[n]);else y(t)}),r.subscribe(function(e,t){var n=o(e,a);a=e,c({type:\"@@STATE\",update:n,action:t&&t.name,partial:!0})}),r.registerActions=function(e){for(var t in\"function\"==typeof e&&(e=e(r)),e)i[t]=r.action(e[t])},r.freeze=function(){f++},r.unfreeze=function(){if(!--f){var e=u;u=[];for(var t=0;t<e.length;t++)y(e[t])}},c({type:\"@@STATE\",initial:!0,update:r.getState()}),r};\n//# sourceMappingURL=index.js.map\n\n\n//# sourceURL=webpack:///C:/Users/Jeremy/Desktop/gulp/monorepo-starterkit/node_modules/stockroom/worker/index.js?");

/***/ }),

/***/ "../../node_modules/ts-loader/index.js?!./src/store-worker.js":
/*!*************************************************************************************************************!*\
  !*** C:/Users/Jeremy/Desktop/gulp/monorepo-starterkit/node_modules/ts-loader??ref--4!./src/store-worker.js ***!
  \*************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var stockroom_worker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! stockroom/worker */ \"../../node_modules/stockroom/worker/index.js\");\n/* harmony import */ var stockroom_worker__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(stockroom_worker__WEBPACK_IMPORTED_MODULE_0__);\n\r\nlet store = stockroom_worker__WEBPACK_IMPORTED_MODULE_0___default()({\r\n    count: 0,\r\n    spamming: false,\r\n    spams: []\r\n});\r\nconst actions = store => ({\r\n    increment: ({ count }) => ({ count: count + 1 }),\r\n    spam(state, { duration = 5000, interval = 100 } = {}) {\r\n        let start = Date.now();\r\n        clearInterval(state.timer);\r\n        let spams = [];\r\n        let count = 0;\r\n        let timer = setInterval(() => {\r\n            let now = Date.now();\r\n            if (now - start > duration) {\r\n                clearInterval(timer);\r\n                return store.setState({ timer: null, spamming: false });\r\n            }\r\n            spams = spams.concat({\r\n                message: `Spam #${++count}.`,\r\n                time: Date.now()\r\n            });\r\n            store.setState({ spams });\r\n        }, interval);\r\n        return { timer, spamming: true, spams };\r\n    },\r\n    haltSpam({ timer }) {\r\n        clearInterval(timer);\r\n        return { timer: null, spamming: false, spams: [] };\r\n    }\r\n});\r\nstore.registerActions(actions);\r\n// used for stockroom/inline as a fallback:\r\n/* harmony default export */ __webpack_exports__[\"default\"] = (store);\r\n\n\n//# sourceURL=webpack:///./src/store-worker.js?C:/Users/Jeremy/Desktop/gulp/monorepo-starterkit/node_modules/ts-loader??ref--4");

/***/ }),

/***/ "../../node_modules/unistore/dist/unistore.es.js":
/*!**************************************************************************************************!*\
  !*** C:/Users/Jeremy/Desktop/gulp/monorepo-starterkit/node_modules/unistore/dist/unistore.es.js ***!
  \**************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nfunction n(n,t){for(var r in t)n[r]=t[r];return n}/* harmony default export */ __webpack_exports__[\"default\"] = (function(t){var r=[];function u(n){for(var t=[],u=0;u<r.length;u++)r[u]===n?n=null:t.push(r[u]);r=t}function e(u,e,f){t=e?u:n(n({},t),u);for(var i=r,o=0;o<i.length;o++)i[o](t,f)}return t=t||{},{action:function(n){function r(t){e(t,!1,n)}return function(){for(var u=arguments,e=[t],f=0;f<arguments.length;f++)e.push(u[f]);var i=n.apply(this,e);if(null!=i)return i.then?i.then(r):r(i)}},setState:e,subscribe:function(n){return r.push(n),function(){u(n)}},unsubscribe:u,getState:function(){return t}}});\n//# sourceMappingURL=unistore.es.js.map\n\n\n//# sourceURL=webpack:///C:/Users/Jeremy/Desktop/gulp/monorepo-starterkit/node_modules/unistore/dist/unistore.es.js?");

/***/ })

/******/ });