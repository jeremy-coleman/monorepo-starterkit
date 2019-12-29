
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