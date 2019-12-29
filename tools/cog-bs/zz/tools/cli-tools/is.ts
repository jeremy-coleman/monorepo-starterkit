'use strict';

var toString = {}.toString;

const isArray = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

function isBuffer (obj) {
  return obj != null && obj.constructor != null &&
    typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}



export function isWindows() {
  return process && (process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE));
};

function uncPathRegex() {
return /^[\\\/]{2,}[^\\\/]+[\\\/]+[^\\\/]+/;
};

function isUncPath(filepath) {
if (typeof filepath !== 'string') {
  throw new TypeError('expected a string');
}
return uncPathRegex().test(filepath);
};

function isRelative(filepath) {
  if (typeof filepath !== 'string') {
    throw new TypeError('expected filepath to be a string');
  }
  // Windows UNC paths are always considered to be absolute.
  return !isUncPath(filepath) && !/^([a-z]:)?[\\\/]/i.test(filepath);
};

/**
 * Returns true if a file path is absolute.
 *
 * @param  {String} `fp`
 * @return {Boolean}
 */

function isAbsolute(fp) {
  if (typeof fp !== 'string') {
    throw new TypeError('isAbsolute expects a string.');
  }
  return isWindows() ? isAbsolute.win32(fp) : isAbsolute.posix(fp);
}

/**
 * Test posix paths.
 */

isAbsolute.posix = function posixPath(fp) {
  return fp.charAt(0) === '/';
};

/**
 * Test windows paths.
 */

isAbsolute.win32 = function win32(fp) {
  if (/[a-z]/i.test(fp.charAt(0)) && fp.charAt(1) === ':' && fp.charAt(2) === '\\') {
    return true;
  }
  // Microsoft Azure absolute filepath
  if (fp.slice(0, 2) === '\\\\') {
    return true;
  }
  return !isRelative(fp);
};

export {isAbsolute, isAbsolute as default}