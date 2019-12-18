var path = require('path');
var tsc = require('rollup-plugin-typescript')
var jetpack = require('fs-jetpack')

const MONOREPO_CONSTANTS = {
    PKG_JSONS: jetpack.find('packages', { 
      matching: ["./*/package.json"], 
      files: true,
      directories: false 
    }),
    SRC_DIRS: jetpack.find('packages', { 
      matching: ["./*/src"], 
      files: false,
      directories: true 
    }),
    LIBS: jetpack.find('packages', { 
      matching: ["./*/lib"], 
      files: false,
      directories: true 
    }),
    BUNDLES: jetpack.find('packages', { 
      matching: ["./*/bundle"], 
      files: false,
      directories: true 
    }),
    PACKAGES: jetpack.find('packages', { 
      matching: ["./*"],
      recursive: false,
      files: false,
      directories: true 
    })
}


const MonoPackageDeps = () => {
  let deps = []
  MONOREPO_CONSTANTS.PKG_JSONS.forEach((pkgJsonFile) => {
    let theFileContents = jetpack.read(pkgJsonFile, 'json')
      deps.push(Object.keys({...theFileContents.dependencies, ...theFileContents.devDependences, ...theFileContents.peerDependencies} || {}))
    })
    let uniqueDeps = [...new Set(...deps)]
    console.log(uniqueDeps)
    return uniqueDeps
}

const EXTERNALS = MonoPackageDeps()

const globals = {
  'react': 'React',
  'react-dom': 'ReactDOM'
};

async function main() {
    let results = []

    MONOREPO_CONSTANTS.PACKAGES.forEach((pkg) => { 
    
    const basePath = path.relative(__dirname, pkg)
    console.log('basepath', basePath)

    //const pkgEntryFileArray = path.join(basePath, 'lib/index.js');
    const pkgEntryFileArray = path.join(basePath, 'src/index.ts');

    console.log('pkgEntryFileArray', pkgEntryFileArray)

    const bundlePath = basePath.replace('packages', 'bundles')
    console.log('bundlepath', bundlePath)
      //console.log(pkg.location)

      //console.log(input)

    const PKG_PATH_FRAGMENTS = basePath.split('\\').concat("lib", "index.js")
    console.log(PKG_PATH_FRAGMENTS)

    results.push({
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false
        },
        inlineDynamicImports: true,
        input: pkgEntryFileArray,
        output: [
            {
                file: path.join(__dirname, ...PKG_PATH_FRAGMENTS),
                format: 'esm',
                globals: globals,
            },
        ],
        preserveModules: false,
        //globals:globals,
        external: EXTERNALS,
        plugins: [
          tsc()
        ],

        onwarn: function ( message ) {
          if ( /external dependency/.test( message ) ) {return;}
          if (message.code === 'CIRCULAR_DEPENDENCY') {return;}
          console.error( message );
        },
        
    });
 });

  return results;
}

module.exports = main();



// const tsFiles = jetpack.find(
//   'packages', { matching: [
//     "**/*.js",
//     "**/*.ts",
//     "**/*.tsx",
//     "**/*.jsx"
// ], files: true, directories: false });
