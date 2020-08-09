var express = require('express');
var app = express();

var server = app.listen(8080);

app.use(express.static('public'));

const socket = require("socket.io");
var io = socket(server);

io.sockets.on('connection', connected);

function connected(socket)
{
    console.log("Connection");
}