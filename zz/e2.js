//https://github.com/rollup/awesome

var fs = require('fs')
var path = require('path')
var tsc = require('@rollup/plugin-typescript')
var globalze = require("rollup-plugin-external-globals")
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

let r = fs.readdirSync("./packages")

let MONOREPO_CONSTANTS_PACKAGES = fs.readdirSync("packages").map(v => `packages/${v}`)
let ROLLUP_TARGET_PACKAGES = MONOREPO_CONSTANTS_PACKAGES.filter(x => !x.includes("app-"))

ROLLUP_TARGET_PACKAGES.forEach((pkg) => {
console.log(pkg)
})
// r.forEach((pkg) => {

// const basePath = path.relative(__dirname, `packages/${pkg}`).split(path.sep).join("/")

// const pkgEntryFileArray = path.join(basePath, 'src/index.ts')
// const LIB_PATH_FRAGMENTS = basePath.split('\\').concat('lib', 'index.js')
// const LIB_OUTPUT_FILE = path.join(__dirname, ...LIB_PATH_FRAGMENTS)
// console.log(basePath)
// })