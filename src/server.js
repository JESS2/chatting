var express = require('express');
var app = express();
// socket.io가 express를 직접 받아들이지 못하기 때문에 아래의 작업이 필요함.
var http = require('http').Server(app); // app을 http에 연결.
var io = require('socket.io')(http);    // http를 다시 socket.io에 연결.

// 모든 request는 client.html을 response하도록 설정함.
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/home/home.html');
});

app.get('/chat', function(req, res) {
  res.sendFile(__dirname + '/client.html');
});

var count = 1;

// console.log(location.href);

// 사용자가 웹사이트에 접속하면 socket.io에 의해 'connection' event가 자동으로 발생됨.
// io.on(EVENT, 함수)는 서버에 전달된 EVENT를 인식하여 함수를 실행시키는 event listener.
// 접속한 사용자의 socket이 매개변수로 전달됨.
// 해당 접속자(socket)에 관련한 event들은 이 'connection' event listener 안에 작성되어야 함.
io.on('connection', function(socket) {
  var name = "user" + count++;
  console.log('user connected: ', name);

  // 'change name'이라는 evnet를 발생시킴.
  // 이 event는 client.html의 해당 event listener에서 처리됨.
  // 서버가 event를 하나의 특정한 클라이언트에게만 전달: io.to(socket.id).emit
  io.to(socket.id).emit('change name', name);
  
  io.emit('entrance', name);

  // 해당 socket에 전달된 EVENT를 인식하여 함수를 실행시킴.
  // 접속이 해제되는 경우, 'disconnect' event가 자동으로 발생됨.
  socket.on('disconnect', function() {
    console.log('user disconnected: ', name);

    io.emit('leave', name);
  });

  // 메세지를 전송할 경우, 'send message' event가 자동으로 발생됨.
  // 메세지를 보낸 접속자의 이름과 채팅메세지를 parameter로 함께 전달함.
  socket.on('send message', function(name, text) {
    var msg = name + ' : ' + text;
    console.log(msg);
    // 모든 접속자들에게 event를 전달함
    // 서버가 event를 모든 클라이언트들에게 전달: io.emit
    io.emit('receive message', name, msg);
  });
});

http.listen(3000, function(){
  console.log('server on!');
});