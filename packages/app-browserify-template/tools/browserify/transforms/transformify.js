'use strict';

var {Transform} = require('stream');
var {inherits} = require('util');

inherits(StringTransform, Transform);

function StringTransform (fn, opts) {
  if (!(this instanceof StringTransform)) return new StringTransform(fn, opts);

  opts = opts || {};
  
  Transform.call(this, opts);
  this.transformFn = fn;
  this.string = '';
}

StringTransform.prototype._transform = function (chunk, encoding, cb) {
  this.string += chunk.toString();  
  cb();
}

StringTransform.prototype._flush = function (cb) {
  try {
    var transformed = this.transformFn(this.string);
    this.push(transformed);
    cb();
  } catch (err) {
    cb(err);
  }
}


/**
 * Takes a synchronous function that transforms a string and returns a transform compatible with browserify, catw and mutiny.
 * 
 * @name transformify
 * @function
 * @param {Function(String):String} fn 
 * @return {Function(String):TransformStream} function that returns a transform stream
 */
function transformify(fn) {
  return function (file) {
    return new StringTransform(fn);  
  }
};

module.exports = {transformify}