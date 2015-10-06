var Promise = require('bluebird');
var sys = require('sys');
var exec = require('child_process').exec;

function EXEC (cmd) {
  return new Promise(function (resolve, reject) {

    function puts(error, stdout, stderr) {
      if (error) {
        return reject(error);
      }
      if (stderr) {
        return resolve(stderr);
      }
      if (stdout) {
        return resolve(stdout);
      }
    }

    exec(cmd, puts);
  });
}


var HTML = " \n \
 \n \
<style> \n \
*{ \n \
    background: #000; \n \
    font-family: 'ProggyCleanTTSZ'; \n \
    color: #AAA; \n \
    -webkit-font-smoothing: none; \n \
    font-size: 15px; \n \
  } \n \
</style> \n \
<h1>Exec for fun</h1> \n \
 \n \
<xmp id='log'></xmp> \n \
 \n \
<script> \n \
var ws = new WebSocket('ws://localhost:1234', 'echo-protocol'); \n \
 \n \
function sendMessage(message){ \n \
    ws.send(message); \n \
} \n \
 \n \
 \n \
ws.addEventListener(\"message\", function(e) { \n \
    var msg = e.data; \n \
    var $log = document.getElementById('log'); \n \
    log.innerHTML = msg + '\\n' + log.innerHTML; \n \
});</script> \n \
\n \
\n \
 ";



var http = require('http');
var server = http.createServer(function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.end(HTML);
});


server.listen(1234, function() {
    console.log((new Date()) + ' Server is listening on port 1234');
});



var count = 0;
var clients = {};


var WebSocketServer = require('websocket').server;
wsServer = new WebSocketServer({
  httpServer: server
});


wsServer.on('request', function(r) {

  // Code here to run on connection
  var connection = r.accept('echo-protocol', r.origin);

  // Specific id for this client & increment count
  var id = count++;

  // Store the connection method so we can loop through & contact all clients
  clients[id] = connection;
  console.log((new Date()) + ' Connection accepted [' + id + ']');


  // Create event listener
  connection.on('message', function(message) {

    var msgString = message.utf8Data;

    EXEC(msgString).then(function(data){
      for (var i in clients) {
        clients[i].sendUTF(data);
      }
    }).catch(function(err){
      console.error(err);
    });


  });


  connection.on('close', function(reasonCode, description) {
    delete clients[id];
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });

});


