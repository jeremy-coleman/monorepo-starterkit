
var stream = require("stream");
let ts = require("typescript")

module.exports = main();
module.exports.configure = main;

var tsconfig = {
  module: "esnext", //ts.ModuleKind.UMD,
  target: "esnext",
  allowJs: true,
  jsx:"react",
  preserveConstEnums: true,
  //emitBOM: false,
  experimentalDecorators: true,
  alwaysStrict: true,
  removeComments:true,
  baseUrl: './src',
  sourceMap: false
}

function initConfig(filePath){
 return {
    fileName: filePath,
    compilerOptions:tsconfig
  }
}

function main(tscOpts = "todo") {
  return function (filename) {
    const babelOpts = initConfig(filename)
    if (babelOpts === null) {
      return stream.PassThrough();
    }
    return new TypescriptStream(babelOpts);
  };
}

class TypescriptStream extends stream.Transform {
  constructor(opts) {
    super();
    this._data = [];
    this._opts = opts;
  }
  _transform(buf, enc, callback) {
    this._data.push(buf);
    callback();
  }
  _flush(callback) {
    // Merge the chunks before transform
    const data = Buffer.concat(this._data).toString();
    try{
      let result = ts.transpileModule(data, this._opts)
      var code = result !== null ? result.outputText : data;
      this.push(code);
      callback();
    }
    catch(e){
      callback(e)
    }
  }
}