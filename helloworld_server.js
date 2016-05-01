// Hello World server in Node.js
// Connects REP socket to tcp://*:5560
// Expects "Hello" from client, replies with "World"

var zmq = require('zmq')
  , responder = zmq.socket('rep');

console.log("Current 0MQ version is " + zmq.version);

responder.on('message', function(msg) {

  console.log('received request:', msg.toString());
  responder.send(msg.toString() + ' World');
  console.log('responding');

});
responder.bind('tcp://*:5555', function(){
    console.log('listening');
});

