// Global variables
var express = require('express')
  , app     = express()
  , server  = require('http').createServer(app)
  , io      = require('socket.io').listen(server)
  , port    = 14001;


// Static files middleware
app.use(express.static(__dirname + '/public'));


// Launch server
server.listen(port);
console.log('Listening on port : ' + port);


// Socket handlers
io.sockets.on('connection', function (socket) {

  socket.emit('connected', { hello: 'world' });

  socket.on('ping', function (data) {
    console.log('Socket pinged with msg : ', data);

    // Dispatching the message, because why not
    socket.emit('ping', data);
  });
});