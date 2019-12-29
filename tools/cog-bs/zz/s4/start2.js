"use strict"
//@ts-check
/** @type import('connect')*/
var express = require("connect")
const {createServer} = require('http')
const browserifyMiddleware = require('./middleware');
var hmr = require('./tools/browserify/hmr')
//import cssify from './tools/transforms/cssify'
var unpathify = require('./aliasify')
var tsify = require('./tsify')
var sucrasify = require('./sucrasify')

var app = express();

let server = createServer(app)

browserifyMiddleware.settings ({
    extensions: ['.js', '.jsx', '.tsx', '.ts', '.mjs', '.json'],
    grep: /\.[tj]sx?$/,
    plugin:[hmr],
    transform: [
        tsify,
        //cssify,
        unpathify,
        sucrasify
    ]
});

// serve client code via browserify
server.get('/bundle.js', browserifyMiddleware(__dirname+'/src/app.tsx'));

// resources
app.get(['*.png','*.jpg','*.css','*.map'], function (req, res) {
    
    res.send(__dirname+"/public/"+req.path);
});

// all other requests will be routed to index.html
app.get('*', function (req, res) {
    res.header('Content-Type', 'text/html').code(200)
    res.send(__dirname+"/public/index.html");
});

console.log('serving http://localhost:3000')
app.listen(3000)

// // Run the server
// app.listen(port, function() {
//     browserSync ({
//         proxy: 'localhost:' + port,
//             files: ['source/**/*.{jsx}', 'public/**/*.{css}'],
//         options: {
//             ignored: 'node_modules'
//         }
//     });
// });
