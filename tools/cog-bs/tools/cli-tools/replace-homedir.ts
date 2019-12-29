'use strict';

import {isAbsolute} from './is'

import path from 'path'
import os from 'os'

var homedir = os.homedir
var isWin = process.platform === 'win32';

function removeTrailingSep(str) {
	var i = str.length - 1;
	if (i < 2) {
		return str;
	}
	while (isSeparator(str, i)) {
		i--;
	}
	return str.substr(0, i + 1);
};

function isSeparator(str, i) {
	var char = str[i];
	return i > 0 && (char === '/' || (isWin && char === '\\'));
}


function replaceHomedir(filepath, replacement) {
  if (typeof filepath !== 'string') {
    throw new Error('Path for replace-homedir must be a string.');
  }

  if (!isAbsolute(filepath)) {
    return filepath;
  }

  var home = removeTrailingSep(homedir());
  var lookupHome = home + path.sep;
  var lookupPath = removeTrailingSep(filepath) + path.sep;

  if (lookupPath.indexOf(lookupHome) !== 0) {
    return filepath;
  }

  return filepath.replace(home, replacement);
}


export {replaceHomedir , replaceHomedir as default}
