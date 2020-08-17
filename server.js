const http = require('http');
const port = process.env.PORT || 8080;
const heroku = process.env.PORT ? true : false;

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
    
    pathname = '/public' + pathname;
    
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

let word = words[Math.floor(Math.random()*words.length)];
let letters = {};

let users = {};
let numUsers = 0;

let active = 0;

let found = 0;
let avrScore = 0;

let drawing = [];
let bg = '#FFFFFF';

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
            data = {'drawing': drawing, 'bg': bg};
            break;
        case 'timer':
            data = timer;
            break;
        case 'word':
            data = {'word': word, 'letters': letters};
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
            
            if(timer % 20 == 0)
            {
                var number;
                
                do
                {
                    number = Math.floor(Math.random() * word.length);
                }
                while(word.charAt(number) == " " || letters[number])
                
                letters[number] = word.charAt(number);
                io.emit('letters', number);
            }
            
            if(timer <= 0)
            {
                drawing.length = 0;
                
                delete letters;
                letters = {};
                
                timer = 80;            
                
                word = words[Math.floor(Math.random()*words.length)];
                
                var index = 0;
                for(id in users)
                {
                    users[id].found = false;
                    if(index == active)
                        users[id].score += avrScore;
                }
                
                found = 0;
                avrScore = 0;
                
                active++;
                if(active >= numUsers) active = 0;
                
                io.emit('wordWas');
                
                sendGlobalData('users');
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
        //console.log("Connection: " + socket.id);
        numUsers++;
        
        //#region socket.on
        
        socket.on('sendName', 
            function(data)
            {
                users[socket.id] = {name: data, found: false, score: 0};
                
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
                var score = Math.floor(timer*1.25);
                avrScore = (avrScore+score)/2;
                
                socket.broadcast.emit('foundWord', {'id': socket.id, 'score': score});
                users[socket.id].found = true;
                users[socket.id].score += score;
                
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
    
        socket.on('bg',
            function(data)
            {
                socket.broadcast.emit('bg', data);
                bg = data;
            }
        );
        
        socket.on('clear',
            function()
            {
                drawing.length = 0;
                sendGlobalData('drawing');
            }
        );
        
        socket.on('disconnect',
            function()
            {
                //console.log(socket.id + " disconnected");
                
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
        //#endregion
    }
);