
//import polka from 'polka';
///import sirv from 'sirv';
import path from 'path';
import fs from 'fs';

const {polka, sirv} = require('./tools/devserver')
const browserifyMiddleware = require('./tools/devserver/middleware');
var hmr = require('./tools/browserify/hmr')
import cssify from './tools/transforms/cssify'
var unpathify = require('./tools/transforms/aliasify')
var tsify = require('./tools/transforms/tsify')
var sucrasify = require('./tools/transforms/sucrasify')


const { PORT = 3001 } = process.env;
//var apiHistoryFallback = require('./fallback.js')

browserifyMiddleware.settings ({
    extensions: ['.js', '.jsx', '.tsx', '.ts', '.mjs', '.json'],
    grep: /\.[tj]sx?$/,
    plugin:[hmr],
    transform: [
        //tsxify(),
        //filenameStream,
        //deamdify,
        cssify,
        tsify,
        unpathify,
        sucrasify,
        //unpathify,
    ]
});

polka()
  //.use(apiHistoryFallback())
  .use(
    sirv(path.resolve(__dirname, 'public'), {
      dev: true,
      setHeaders: res => res.setHeader('AMP-Access-Control-Allow-Source-Origin', `http://localhost:${PORT}`),
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
  .get('/coglite.js', browserifyMiddleware(__dirname+'/src/app.tsx'))
  .get('/slow/*', (req, res) => {
    const reqPath = req.path.substring('/slow/'.length);
    const file = fs.readFileSync(path.resolve(__dirname, reqPath));
    setTimeout(() => res.end(file), 6000);
  })
  .get('*', (req, res) => {
    res.end(fs.readFileSync(path.resolve(__dirname, "public", "index.html")));
  })
  .listen(PORT, _ => {
    console.log(`> Running on http://localhost:${PORT}`);
  });