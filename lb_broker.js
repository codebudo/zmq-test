var cluster = require('cluster');
var zmq = require('zmq');
var producerAddress = 'tcp://127.0.0.1:5555'; // backAddr
var consumerAddress = 'tcp://127.0.0.1:5556';  // frontAddr
var PRODUCERS = 10; // clients
var CONSUMERS = 3;  // workers

function producerProcess(){
  var socket = zmq.socket('req');
  socket.identity = 'producer' + process.pid;
  socket.connect(consumerAddress);
  socket.send('hello');

  socket.on('message', function(data) {
    console.log(socket.identity, '<- "', data, '"');
    socket.close();
    cluster.worker.kill();
  });
}

function consumerProcess(){
  var socket = zmq.socket('req');
  socket.identity = 'consumer' + process.pid;
  socket.connect(producerAddress);
  socket.send('READY');

  socket.on('message', function() {
    var args = Array.apply(null, arguments);
    console.log(args, socket.identity);
    socket.send([arguments[0], '', 'OK']);
  });
}

function loadBalancer() {
  var workers = []; // list of available worker id's

  var producerServer = zmq.socket('router');
  producerServer.identity = 'producerServer' + process.pid;
  producerServer.bind(producerAddress, function(err) {
    if(err) throw err;

    producerServer.on('message', function() {
      console.log('producer.message>',arguments);

      workers.push(arguments[0]);

      // send message to consumer.
      // TODO also send message to pub/sub?
      if (arguments[2] != 'READY') {
        console.log('proxying>',[arguments[2].toString(), arguments[3].toString(), arguments[4].toString()]);
        consumerServer.send([arguments[2], arguments[3], arguments[4]]);
      }
    });
  });

  var consumerServer = zmq.socket('router');
  consumerServer.identity = 'consumerServer'+process.pid;
  consumerServer.bind(consumerAddress, function(err) {
    if(err) throw err;

    consumerServer.on('message', function() {
      var args = Array.apply(null, arguments);

      console.log('consumer.message>', args);
      //
      //
      //
      //
      // maybe there is a better way?
      var interval = setInterval(function() {
        if( workers.length > 0 ){
          console.log('send>',[workers.shift(), '', args[0], '', args[2]]);
          producerServer.send([workers.shift(), '', args[0], '', args[2]]);
          clearInterval(interval);
        }
      }, 10);
    });
  });
}

// process management
//
if(cluster.isMaster){
  // create consumers and producers

  var i = 0;
  for( i=0; i < CONSUMERS; i++){
    console.log('forking consumer');
    cluster.fork({
      "TYPE": 'consumer'
    });
  }
  for( i=0; i < PRODUCERS; i++){
    console.log('forking producer');
    cluster.fork({
      "TYPE": 'producer'
    });
  }

  // log deaths
  cluster.on('death', function(consumer) {
    console.log('consumer', consumer.pid, 'died');
  });

  // watch disconnects. exit when consumers are all done.
  var deadConsumers = 0;
  cluster.on('disconnect', (worker) => {
    deadConsumers++;
    if( deadConsumers >= CONSUMERS ){
      console.log('finished');
      process.exit(0);
    }
  });

  loadBalancer();
} else {
  if( process.env.TYPE === 'consumer' ){
    consumerProcess();
  } else {
    producerProcess();
  }
}


