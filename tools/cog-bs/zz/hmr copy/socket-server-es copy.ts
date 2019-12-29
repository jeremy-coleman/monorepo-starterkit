'use strict';

import _ from 'lodash'
var polka = require('polka');
var http = require('http');
var https = require('https');

import net from 'net'
import socketio from 'socket.io'

var readline = require('readline');


function bytesToSize(bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Byte';
  var i = parseInt(String((Math.floor(Math.log(bytes) / Math.log(1024)))))
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
}

function has(object, propName) {
  return Object.prototype.hasOwnProperty.call(object, propName);
}

//https://stackoverflow.com/questions/12023359/what-do-the-return-values-of-node-js-process-memoryusage-stand-for
//https://www.dynatrace.com/news/blog/understanding-garbage-collection-and-hunting-memory-leaks-in-node-js/
function log(...args) {
  let mem = process.memoryUsage().rss
  let msg = ["Memory(RSS):", bytesToSize(mem), new Date().toLocaleTimeString(), '[HMR]'].concat(args)
  console.log(...msg)
}


var hostname
var port
var tlsoptions;
var currentModuleData = {};

const updateModules = (MESSAGE) => {
  var newModuleData = _.chain(currentModuleData)
    .toPairs()
    .filter((pair) => !has(MESSAGE, pair[0]) || MESSAGE[pair[0]].hash !== pair[1].hash)
    .fromPairs()
    .value();

  var removedModules = _.chain(MESSAGE)
    .keys()
    .filter((name) => {
      return !has(currentModuleData, name);
    })
    .value();

  return { newModuleData, removedModules }
}


var parent = new net.Socket({ fd: 3 });

var parentReadline = readline.createInterface({
  input: parent,
  output: process.stdout,
  terminal: false
});

var runServer = _.once(function () {
  var app = polka()
  var server = tlsoptions ? https.Server(tlsoptions, app) : http.Server(app);
  var io = net.createServer(server)
//  var io = socketio(server);

  io.on('connection', (socket) => {
     console.log(socket)
    //console.log(socket)
    socket.on('sync', (syncMsg) => {
      console.log('syncmsg', syncMsg)
      log('User connected, syncing');

      var { newModuleData, removedModules } = updateModules(syncMsg)

      socket.emit('sync confirm', null);

      if (Object.keys(newModuleData).length || removedModules.length) {
        socket.emit('new modules', { newModuleData: newModuleData, removedModules: removedModules });
      }

    });

  });

  server.listen(port, hostname, () => {
    log('Listening on ' + hostname + ':' + port);
  });

  return io;
});


function sendToParent(data) {
  parent.write(JSON.stringify(data) + '\n');
}

var uncommittedNewModuleData = {};

parentReadline.on('line', (line) => {
  var msg = JSON.parse(line);

  switch (msg.type) {
    case "config": {
      hostname = msg.hostname;
      port = msg.port;
      tlsoptions = msg.tlsoptions;
    }
      break;

    case 'newModule': {
      uncommittedNewModuleData[msg.name] = msg.data;
    }
      break;

    case 'removedModules': {
      sendToParent({ type: 'confirmNewModuleData' });
      _.assign(currentModuleData, uncommittedNewModuleData);
      var io = runServer();

      msg.removedModules.forEach((name) => {
        delete currentModuleData[name];
      });

      if (Object.keys(uncommittedNewModuleData).length || msg.removedModules.length) {
        log('Emitting updates');

        io.emit('new modules', {
          newModuleData: uncommittedNewModuleData,
          removedModules: msg.removedModules
        });
      }
      uncommittedNewModuleData = {};
    }
      break;

    default: log('Unknow message type', msg.type)

  }
});

parent.on('finish', function () {
  process.exit(0);
});
