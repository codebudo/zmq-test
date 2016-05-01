// Hello World client in Node.js
// Connects REQ socket to tcp://localhost:5559
// Sends "Hello" to server, expects "World" back

var zmq       = require('zmq')
  , requester = zmq.socket('req');

requester.connect('tcp://127.0.0.1:5555');
var replyNbr = 0;
requester.on('message', function(msg) {
  console.log('got reply', replyNbr, msg.toString());
  replyNbr += 1;
});

var i = 0; 
while( i < 10 ){
  i++;
  setTimeout(function(){
    console.log('sending '+replyNbr);
    requester.send("Hello"+replyNbr);
  }, i * 1000);
}
