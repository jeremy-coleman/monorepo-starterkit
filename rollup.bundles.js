var path = require('path')
var tsc = require('@rollup/plugin-typescript')
var jetpack = require('fs-jetpack')

const MONOREPO_CONSTANTS = {
  PKG_JSONS: jetpack.find('packages', {
    matching: ['./*/package.json'],
    files: true,
    directories: false,
  }),
  SRC_DIRS: jetpack.find('packages', {
    matching: ['./*/src'],
    files: false,
    directories: true,
  }),
  LIBS: jetpack.find('packages', {
    matching: ['./*/lib'],
    files: false,
    directories: true,
  }),
  PACKAGES: jetpack.find('packages', {
    matching: ['./*'],
    recursive: false,
    files: false,
    directories: true,
  }),
}

/** returns an array (of strings) of all the deps/peerDeps/devDeps in all the package.jsons */
const MonoPackageDeps = () => {
  let deps = []
  MONOREPO_CONSTANTS.PKG_JSONS.forEach((pkgJsonFile) => {
    let theFileContents = jetpack.read(pkgJsonFile, 'json')
    deps.push(
      Object.keys({
        ...theFileContents.dependencies, 
        ...theFileContents.devDependences,
        ...theFileContents.peerDependencies
      } || {}),
    )
  })
  let uniqueDeps = [...new Set(...deps)]
  //console.log(uniqueDeps)
  return uniqueDeps
}

const EXTERNALS = MonoPackageDeps()

const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
}

async function main() {
  let results = []

  MONOREPO_CONSTANTS.PACKAGES.forEach((pkg) => {
    const basePath = path.relative(__dirname, pkg)
    const pkgEntryFileArray = path.join(basePath, 'src/index.ts')
    const LIB_PATH_FRAGMENTS = basePath.split('\\').concat('lib', 'index.js')
    const LIB_OUTPUT_FILE = path.join(__dirname, ...LIB_PATH_FRAGMENTS)

    results.push({
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
      inlineDynamicImports: true,
      input: pkgEntryFileArray,
      output: [
        {
          file: LIB_OUTPUT_FILE,
          format: 'esm',
          globals: globals,
        },

        //uncomment for .cjs output. Node will load .cjs as commonjs even if closest package.json is type:"module"
        // {
        //   file: path.join(__dirname, ...basePath.split('\\').concat('lib', 'index.cjs')),
        //   format: 'cjs',
        //   interop: false,
        //   globals: globals,
        // },

      ],
      preserveModules: false,
      external: EXTERNALS,
      plugins: [tsc()],

      onwarn: function(message) {
        if (/external dependency/.test(message)) {
          return
        }
        if (message.code === 'CIRCULAR_DEPENDENCY') {
          return
        }
        else console.error(message)
      },
    })
  })

  return results
}

module.exports = main()

// const tsFiles = jetpack.find(
//   'packages', { matching: [
//     "**/*.js",
//     "**/*.ts",
//     "**/*.tsx",
//     "**/*.jsx"
// ], files: true, directories: false });
