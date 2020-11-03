
import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import jetpack from 'fs-jetpack';

/* -------------------------------------------------------------------------- */
/*                                 browserify                                 */
/* -------------------------------------------------------------------------- */
//import {babelify} from './tools/transforms/babelify'
import sucrasify from './tools/browserify/transforms/sucrasify'
import sucrasifyHot from './tools/browserify/transforms/sucrasify-hot'

import browserify from './tools/browserify/browserify'

//import {watchify} from './tools/browserify/watchify'
import watchify from 'watchify'

import cssify from './tools/browserify/transforms/lessify'

import {LiveReactloadPlugin} from './tools/browserify/transforms/livepreactload'
//import {LiveReactloadPlugin} from './tools/browserify/transforms/livereactload'

import {tsify} from './tools/browserify/transforms/tsxify'

//var aliasify = require("aliasify");
var aliasify = require("./tools/browserify/transforms/aliasify");
//var envify = require("loose-envify/custom");

const {polka, sirv} = require('./tools/browserify/devserver')
const { PORT = 3002 } = process.env;

function setup(){
  jetpack.remove('lib')
  jetpack.dir('lib')
  jetpack.copy("src/index.html", "lib/index.html")
}

setup()

const b = watchify(
  browserify({
    entries: ["src/main.tsx"],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    cache: {},
    packageCache: {},
    debug: false,
    sourceMaps: false,
    fullPaths: false
  }),
  //this is really just to overwrite the default ignoring of node_modules (so local dep changes trigger hmr)
  {ignoreWatch: "tools"}
)

b.transform(cssify)
b.transform(tsify)
b.transform(sucrasifyHot, {global: true})
b.plugin(LiveReactloadPlugin(), { host: 'localhost', port: 1337 })

// b.transform([
//   envify({
//     NODE_ENV: "development"
//   }), {global: true}
// ])

b.transform([

  aliasify.configure({
    aliases: {
      "react": "react/cjs/react.production.min.js",
      "react-dom": "react-dom/cjs/react-dom.production.min.js",
      //"react": "preact/compat",
      //"react-dom": "preact/compat"
    },
    appliesTo: { includeExtensions: [".js", ".jsx", ".tsx", ".ts"] }
  }),
  { global: true }
  
])


b.on('update', bundle)


async function bundle() {
  b.bundle()
    .on('error', (e) => console.error(e))
    .pipe(fs.createWriteStream("lib/app.js"))
    //.on('close', launch) //<- webserver or electron 
}

bundle()


const allowAMP = res => res.setHeader('AMP-Access-Control-Allow-Source-Origin', `http://localhost:${PORT}`);

polka()
  .use(sirv(path.resolve(__dirname, 'lib'), {dev: true, setHeaders: res => allowAMP(res)}))
  .get('/health', (req, res) => {res.end('OK')})
  //.get('*', (req, res) => {res.end(fs.readFileSync(path.resolve(__dirname, "lib", "index.html")))})
  .listen(PORT, () => {console.log(`> Running on http://localhost:${PORT}`)});

