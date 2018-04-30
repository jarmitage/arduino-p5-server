const fs   = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');
const SerialPort = require('serialport');

var sensor = 0;
var serialIsConnected = false;

const Readline = SerialPort.parsers.Readline;
var serialPort = new SerialPort('/dev/tty.usbmodem1411', {baudRate: 9600});
const serialParser = serialPort.pipe(new Readline({delimiter: `\r\n`}));
serialParser.on('data', function (data) {
  // console.log(data);
  sensor = data;
  serialIsConnected = true;
})
serialParser.on("error", function (error) {
  console.log("Error: ", error.message);
});

console.log('server started');

/* Client side */
var server = http.createServer(handleRequest);
server.listen(8080);

function handleRequest(req, res) {
  var pathname = req.url;
  if (pathname == '/') {
    pathname = '/src/index.html';
  }
  var ext = path.extname(pathname);
  var typeExt = {
    '.html': 'text/html',
    '.js':   'text/javascript',
    '.css':  'text/css'
  };
  var contentType = typeExt[ext] || 'text/plain';
  fs.readFile(__dirname + pathname,
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + pathname);
      }
      res.writeHead(200,{ 'Content-Type': contentType });
      res.end(data);
    }
  );
}

var socketIsConnected = false;
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    console.log("Client connected:", socket.id);
    socket.on('disconnect', function() {
      console.log("Client disconnected:", socket.id);
    });
    socketIsConnected = true;
  }
);

var updateRate = 100; // 100ms
var update = setInterval(function() {
  if (socketIsConnected == true && serialIsConnected == true) {
    io.emit('data', {data:sensor});
  }
}, updateRate);