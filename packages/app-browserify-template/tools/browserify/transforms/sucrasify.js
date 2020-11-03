var stream = require("stream");
let sucrase = require("sucrase");

module.exports = buildTransform();
module.exports.configure = buildTransform;

var sucraseConfig = (file) => {
  /** @type import('sucrase').Options */
  const config = {
    transforms: ["typescript", "imports", "jsx"],
    filePath: file,
    //enableLegacyTypeScriptModuleInterop: true
    enableLegacyBabel5ModuleInterop: true,
  };
  return config;
};

function buildTransform() {
  return function (filename) {
    const babelOpts = sucraseConfig(filename);
    if (babelOpts === null) {
      return stream.PassThrough();
    }
    return new SucraseStream(babelOpts);
  };
}

class SucraseStream extends stream.Transform {
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
    // Merge the buffer pieces after all are available
    const data = Buffer.concat(this._data).toString();

    try {
      let result = sucrase.transform(data, this._opts);
      var code = result !== null ? result.code : data;
      this.push(code);
      callback();
    } catch (e) {
      callback(e);
    }
  }
}

/** ```typescript
type SucraseOptions = {
transforms: "jsx" | "typescript" | "flow" | "imports" | "react-hot-loader";
jsxPragma?: string;
jsxFragmentPragma?: string | 'React.Fragment'
//If true, replicate the import behavior of TypeScript's esModuleInterop: false
enableLegacyTypeScriptModuleInterop?: boolean; 
//If true, replicate the import behavior Babel 5 and babel-plugin-add-module-exports.
enableLegacyBabel5ModuleInterop?: boolean;
sourceMapOptions?: {
  //name of "file" field of the source map, aka the name of the compiled file.
  compiledFilename: string;
};
//File path to use in error messages, React display names, and source maps.
filePath?: string;
//omit any development-specific code in the output. aka envify
production?: boolean

}```
*/
