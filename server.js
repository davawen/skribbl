const http = require('http');
const port = process.env.PORT || 8080;

const fs = require('fs');
const path = require('path');
const { formatWithOptions } = require('util');


var server = http.createServer(handleRequest);
server.listen(port);

console.log('Server started on port ' + port);

function handleRequest(req, res) {
    var pathname = req.url;

    if (pathname == '/') {
    pathname = '/index.html';
    }
    
    var ext = path.extname(pathname);
    
    pathname = pathname;
    
    // Map extension to file type
    var typeExt = {
    '.html': 'text/html',
    '.js':   'text/javascript',
    '.css':  'text/css'
    };

    var contentType = typeExt[ext] || 'text/plain';

    fs.readFile(__dirname + pathname,
        function (err, data) {
            // if there is an error
            if (err) {
                res.writeHead(500);
                return res.end('Error loading ' + pathname);
            }
            // Otherwise, send the data, the contents of the file
            res.writeHead(200,{ 'Content-Type': contentType });
            res.end(data);
        }
    );
}

var words = fs.readFileSync('public/words.txt', 'utf-8').split("\n");

var word = words[Math.floor(Math.random()*words.length)];

let users = {};
let numUsers = 0;

let active = 0;
let found = 0;

let drawing = [];

let timer = 80;

const io = require('socket.io').listen(server);

function sendGlobalData(type)
{
    var data;
    switch(type)
    {
        case 'users':
            data = users;
            break;
        case 'active':
            data = active;
            break;
        case 'drawing':
            data = drawing;
            break;
        case 'timer':
            data = timer;
            break;
        case 'word':
            data = word;
            break;
    }
    
    io.emit('load', {'type': type, 'data': data});
}

var countDown = setInterval(
    function()
    {
        if(numUsers > 1)
        {
            timer--;
            sendGlobalData('timer');
            if(timer <= 0)
            {
                drawing.length = 0;
                timer = 80;            
                
                word = words[Math.floor(Math.random()*words.length)];
                
                found = 0;
                
                active++;
                if(active >= numUsers) active = 0;
                
                sendGlobalData('active');
                sendGlobalData('drawing');
                sendGlobalData('timer');
                sendGlobalData('word');
            }
        }
        else
        {
            timer = 80;
        }
    }
, 1000);

io.sockets.on('connection',
    function(socket)
    {
        console.log("Connection: " + socket.id);
        numUsers++;
        
        //#region socket.on
        
        socket.on('sendName', 
            function(data)
            {
                users[socket.id] = {name: data};
                
                //console.log(users);
                sendGlobalData('users');
                sendGlobalData('drawing');
                sendGlobalData('timer');
                sendGlobalData('active');
                sendGlobalData('word');
            }
        )
        
        socket.on('sendMessage',
            function(data)
            {
                var sender = users[socket.id].name;
                
                socket.broadcast.emit('sendMessage', {'name': sender, 'msg': data});
            }
        )
        
        socket.on('foundWord',
            function()
            {
                socket.broadcast.emit('foundWord', users[socket.id].name);
                found++;
                
                if(found >= numUsers-1) timer = 0;
            }
        );
        
        socket.on('mouse',
            function(data)
            {
                drawing[drawing.length] = data;
                socket.broadcast.emit('mouse', data);
            }
        );
        
        socket.on('disconnect',
            function()
            {
                console.log(socket.id + " disconnected");
                
                delete users[socket.id];
                numUsers--;
                
                if(active >= numUsers)
                {
                    active = Math.max(active-1, 0);
                    timer = 80;
                    
                    sendGlobalData('active');
                    sendGlobalData('timer');
                }
                
                sendGlobalData('users');
            }
        );
        
        socket.on('undo',
            function(data)
            {
                drawing.splice(data, 1);
                socket.broadcast.emit('undo', data);
            }
        )
        
        //#endregion
    }
);