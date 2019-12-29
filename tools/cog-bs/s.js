var _ = require('lodash')
var net = require('net')


const server = net.createServer()

process.on('exit', () => server.close())



const updateModules = (m) => {
var newModuleData = _.chain(m)
  .toPairs()
  .filter((pair) => !has(syncMsg, pair[0]) || syncMsg[pair[0]].hash !== pair[1].hash)
  .fromPairs()
  .value();

var removedModules = _.chain(syncMsg)
  .keys()
  .filter((name) => {
    return !has(m, name);
  })
  .value();

  return {newModuleData, removedModules}
}

var runServer = _.once(function() {
  const server = net.createServer((io) => {
    io.on('connection', () => {
    
    io.on('sync', (syncMsg) => {
        log('User connected, syncing');
  
        var newModuleData = _.chain(currentModuleData)
          .toPairs()
          .filter((pair) => !has(syncMsg, pair[0]) || syncMsg[pair[0]].hash !== pair[1].hash)
          .fromPairs()
          .value();
  
        var removedModules = _.chain(syncMsg)
          .keys()
          .filter((name) => {
            return !has(currentModuleData, name);
          })
          .value();
  
        io.emit('sync confirm', null);
  
        if (Object.keys(newModuleData).length || removedModules.length){
          io.emit('new modules', {newModuleData: newModuleData, removedModules: removedModules});
        }
  
      });
  
    })
  
  server.listen(port, hostname, () => {
    log('Listening on '+hostname+':'+port);
  });
  return io;
}).on('error', (err) => {console.log(err)})

})