
import fs from 'fs'

//@ts-ignore
import  _ from 'lodash'
//import del from 'del'
import jetpack from 'fs-jetpack';

//var express = require("express");

//const browserifyMiddleware = require('./middleware');
//var hmr = require('./tools/browserify/hmr')
var unpathify = require('./aliasify')
var tsify = require('./tsify')
var sucrasify = require('./sucrasify')
import {createSirver} from './tools/devserver/sirv'
/* -------------------------------------------------------------------------- */
/*                                 browserify                                 */
/* -------------------------------------------------------------------------- */


import browserify from './tools/browserify'
import watchify from './tools/browserify/watchify'
import cssify from './tools/transforms/cssify/cssify'
import hmr from './tools/browserify/hmr'
//import {LiveReactloadPlugin} from './tools/transforms/livereactload'

function clean() {
  async function _clean() {
  await jetpack.remove('dist')
  return jetpack.dir('dist')
  }
  return _clean()
}

clean()

function copy(){
  return jetpack.copy("src/index.html", "dist/index.html")
}
copy()

const b = watchify(browserify({
    entries: ["src/app.tsx"],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    //plugin:[hmr],
    transform:[
      cssify,
      tsify,
      unpathify,
      sucrasify,
    ],
    cache: {},
    packageCache: {},
    //debug: false,
    //sourceMaps: false,
    //fullPaths: false
}))
//b.plugin(tsify)
//b.transform(cssify)


//b.plugin(LiveReactloadPlugin(), { host: 'localhost', port: 1337 })

b.on('update', bundle)



const _firstLaunch = () => createSirver('dist')
const launch = _.once(_firstLaunch)

async function bundle() {
  b.bundle()
    .on('syntax', e => console.warn(e))
    .on('error', (e) => console.error(e))
    .pipe(fs.createWriteStream("dist/app.js"))
    .on('close', launch) //<- webserver or electron 
}

bundle()




