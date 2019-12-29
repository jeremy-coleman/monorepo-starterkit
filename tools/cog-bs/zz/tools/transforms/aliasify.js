var path = require('path')
const { Transform, PassThrough } = require('stream')

/** type{(file: ReadonlyArray<string>, dir: string)}*/
function parseImports(file, dir) {
  const results = file.map((line, index) => {
    const imports = findImport(line);

    if (imports === null) {
      return null;
    }

    return {
      path: dir,
      index,
      import: imports,
    };
  });

  return results.filter((value) => {
    return value !== null && value !== undefined;
  });
}

/** 
 * @type{(line: string)}
 * @returns {string | null}
*/
function findImport(line) {
  const matches = line.match(/from (["'])(.*?)\1/) || line.match(/import\((["'])(.*?)\1\)/) || line.match(/require\((["'])(.*?)\1\)/);

  if (!matches) {
    return null;
  }

  const multiple = [/from (["'])(.*?)\1/g, /import\((["'])(.*?)\1\)/g, /require\((["'])(.*?)\1\)/g].some((exp) => {
    const results = line.match(exp);

    //console.log(results)
    //
    //return results && results.length > 1

    if (results && results.length > 1) {
      results.map(r => findImport(r))
    }
  })

  if (multiple) {
    //throw new Error('Multiple imports on the same line are currently not supported!');
  }

  return matches[2];
}

/** @type {(file: ReadonlyArray<string>, imports: FileData[], options: CompilerOptions) => string[]) }
 * @returns : string[]
*/
function resolveImports(file, imports, options) {
  const { baseUrl, paths } = options;



  /** @type { [key: string]: string[] | undefined } */
  const aliases = {};
  for (const alias in paths) {
    /* istanbul ignore else  */
    if (paths.hasOwnProperty(alias)) {
      let resolved = alias;
      if (alias.endsWith('/*')) {
        resolved = alias.replace('/*', '/');
      }

      aliases[resolved] = paths[alias];
    }
  }

  const lines = [...file];
  for (const imported of imports) {
    const line = file[imported.index];

    let resolved = '';
    for (const alias in aliases) {
      /* istanbul ignore else  */
      if (aliases.hasOwnProperty(alias) && imported.import.startsWith(alias)) {
        const choices = aliases[alias];

        if (choices != undefined) {
          resolved = choices[0];
          if (resolved.endsWith('/*')) {
            resolved = resolved.replace('/*', '/');
          }

          resolved = imported.import.replace(alias, resolved);

          break;
        }
      }
    }

    if (resolved.length < 1) {
      continue;
    }

    let relative = path.relative(path.dirname(imported.path), baseUrl || './');
    relative = path.join(relative, resolved);
    relative = path.relative(path.dirname(imported.path), path.resolve(path.dirname(imported.path), relative));
    relative = relative.replace(/\\/g, '/');

    if (relative.length === 0 || !relative.startsWith('.')) {
      relative = './' + relative;
    }

    lines[imported.index] = line.replace(imported.import, relative);
  }

  return lines;
}


const fs = require('fs')
const projectSourceDirectory = path.resolve(process.cwd(), 'src')
const sourceDirs = fs.readdirSync(projectSourceDirectory).filter(f => !f.includes("."))

let createConfig = () => {
  //todo , merge this with fs read tsconfig + user options + maybe like a web_modules
  const config = {
    baseUrl: ".",
    paths: {}
  }
  for (var x of sourceDirs) {
    config.paths[`${x}/*`] = [`src/${x}/*`]
  }
  //return JSON.stringify(config)
  return config
}

const compilerOptions = createConfig()

function compile(filePath, chunk) {
  //const lines = chunk.toString('utf8').split('\n');
  const lines = chunk.split('\n');
  const imports = parseImports(lines, filePath)
  const code = resolveImports(lines, imports, compilerOptions).join('\n')
  return code
}

const unpathifyStream = (file) => {
  if (!/\.tsx?$|\.jsx?$/.test(file) || file.indexOf("node_modules") > 0 || file.indexOf("src") < 0) {
    return new PassThrough();
  }

  var _transform = new Transform()
  _transform._write = (chunk, encoding, next) => {
    _transform.push(compile(file, chunk.toString('utf8')))
    next();
  }
  return _transform
}

module.exports = unpathifyStream
