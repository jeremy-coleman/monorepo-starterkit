//https://github.com/rollup/awesome

var fs = require('fs')
var path = require('path')
var tsc = require('./tools/rollup-plugin-typescript-v2')


var EXTERNALS = fs.readdirSync("node_modules")
let MONOREPO_CONSTANTS_PACKAGES = fs.readdirSync("packages").map(v => `packages/${v}`)
var ROLLUP_TARGET_PACKAGES = MONOREPO_CONSTANTS_PACKAGES.filter(x => !x.includes("app-"))

async function main() {
  let CONFIG_ARRAY = []

  ROLLUP_TARGET_PACKAGES.forEach((pkg) => {
    const basePath = path.relative(__dirname, pkg)
    const pkgEntryFileArray = path.join(basePath, 'src/index.ts')
    const LIB_PATH_FRAGMENTS = basePath.split('\\').concat('lib', 'index.js')
    const LIB_OUTPUT_FILE = path.join(__dirname, ...LIB_PATH_FRAGMENTS)

    CONFIG_ARRAY.push({
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
          //globals: globals,
          globals: {
            'react': 'React',
            'react-dom': 'ReactDOM',
          },
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
      plugins: [
        tsc(),
      ],

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

  return CONFIG_ARRAY
}

module.exports = main()
