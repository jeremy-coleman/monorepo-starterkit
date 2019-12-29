'use strict';


function uncPathRegex() {
  return /^[\\\/]{2,}[^\\\/]+[\\\/]+[^\\\/]+/;
};

module.exports = function isUncPath(filepath) {
  if (typeof filepath !== 'string') {
    throw new TypeError('expected a string');
  }
  return uncPathRegex().test(filepath);
};
