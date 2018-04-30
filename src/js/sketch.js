
const ip = '10.96.84.252'; // replace with desktop's IP
const socket = io.connect('http://'+ip+':8080');
// const socket = io.connect('http://localhost:8080'); // run on desktop

var sensor = 0; // incoming sensor data from Arduino

function setup(){
  createCanvas(windowWidth, windowHeight); 
  background(255);
  socket.on('connect',function() {
    socket.emit('connected', 'Hello server!');
  });
  socket.on('data', function(data) {
    sensor = data.data;
  })
}

function draw(){
  background(250);
  fill(0);
  textSize(32);
  textAlign(CENTER,CENTER);
  text(sensor, 100, 100);
}