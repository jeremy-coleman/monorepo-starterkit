"use strict"
import fs from 'fs'
import  _ from 'lodash'
import jetpack from 'fs-jetpack';
var unpathify = require('./tools/transforms/aliasify')
var tsify = require('./tools/transforms/tsify')
var sucrasify = require('./tools/transforms/sucrasify')

const {polka, sirv} = require('./tools/devserver')

import {LiveReactloadPlugin} from './tools/browserify/livereload/livereactload'

//import hmr from './tools/browserify/hmr'
import cssify from './tools/transforms/cssify/cssify'
import watchify from './tools/browserify/watchify'
import browserify from './tools/browserify'

//const browserifyMiddleware = require('./middleware');
//var app = require("express")()


const b = watchify(browserify({
    entries:["./src/app.tsx"],
    extensions: ['.js', '.jsx', '.tsx', '.ts', '.mjs', '.json'],
    grep: /\.[tj]sx?$/,
    //plugin:[hmr],
    transform: [
        //tsxify(),
        //filenameStream,
        //deamdify,
        cssify,
        tsify,
        //unpathify,
        sucrasify,
        unpathify,
    ],
    cache: {},
    packageCache: {},
    debug: true,
    //sourceMaps: false,
    //fullPaths: false

}))

//b.require('axios', {expose: 'axios'})



function clean() {
  async function _clean() {
  await jetpack.remove('dist')
  return jetpack.dir('dist')
  }
  return _clean()
}

clean()

function copy(){
  //jetpack.copy("node_modules/axios/lib", "dist/lib")
  return jetpack.copy("src/index.html", "dist/index.html")
}
copy()

//b.plugin(tsify)
//b.transform(cssify)
b.plugin(LiveReactloadPlugin(), { host: 'localhost', port: 1337 })

b.on('update', bundle)



const _firstLaunch = () => sirv('dist')
const launch = _.once(_firstLaunch)

async function bundle() {
  b.bundle()
    .on('syntax', e => console.warn(e))
    .on('error', (e) => console.error(e))
    .pipe(fs.createWriteStream("dist/coglite.js"))
    .on('close', launch) //<- webserver or electron 
}

bundle()



require('./tools/tsdk/check.js')

import path from 'path'

polka()
  //.use(apiHistoryFallback())
  .use(
    sirv(path.resolve(__dirname, 'dist'), {
      dev: true,
      setHeaders: res => res.setHeader('AMP-Access-Control-Allow-Source-Origin', `http://localhost:${3001}`),
    }),
  )
  // .use(
  //   sirv(path.resolve(__dirname), {
  //     dev: true,
  //     setHeaders: res => res.setHeader('AMP-Access-Control-Allow-Source-Origin', `http://localhost:${PORT}`),
  //   }),
  // )
  .get('/health', (req, res) => {
    res.end('OK');
  })
  //.get('/coglite.js', browserifyMiddleware(__dirname+'/src/app.tsx'))
  .get('/slow/*', (req, res) => {
    const reqPath = req.path.substring('/slow/'.length);
    const file = fs.readFileSync(path.resolve(__dirname, reqPath));
    setTimeout(() => res.end(file), 6000);
  })
  .get('*', (req, res) => {
    res.end(fs.readFileSync(path.resolve(__dirname, "dist", "index.html")));
  })
  .listen(3001, _ => {
    console.log(`> Running on http://localhost:${3001}`);
  });