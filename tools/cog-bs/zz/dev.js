"use strict"
//var express = require("express")
const browserifyMiddleware = require('./middleware');
var hmr = require('./tools/browserify/hmr')
import cssify from './tools/transforms/cssify/cssify'
var unpathify = require('./aliasify')
var tsify = require('./tsify')
var sucrasify = require('./sucrasify')
var app = require("express")()


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

// serve client code via browserify
app.use('/coglite.js', browserifyMiddleware(__dirname+'/src/app.tsx'));

// resources
app.get(['*.png','*.jpg','*.css','*.map'], function (req, res) {
    res.sendFile(__dirname+"/public/"+req.path);
});

// all other requests will be routed to index.html
app.get('*', function (req, res) {
    res.sendFile(__dirname+"/public/index.html");
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
