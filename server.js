const http = require('http');
const port = 8080;

const fs = require('fs');
const path = require('path');


var server = http.createServer(handleRequest);
server.listen(port);

let io = require('socket.io').listen(server);

io.sockets.on('connection',
    function(socket)
    {
        console.log("Connection: " + socket.id);
        
        socket.on('disconnect',
            function()
            {
                console.log(socket.id + " disconnected");
            }
        );
        
        socket.on('mouse',
            function(data)
            {
                console.log("Received: 'mouse' " + data.x + " " + data.y);
                socket.broadcast.emit('mouse', data);
            }
        );
    }
);

console.log('Server started on port ' + port);

function handleRequest(req, res) {
    var pathname = req.url;

    if (pathname == '/') {
    pathname = '/index.html';
    }

    var ext = path.extname(pathname);

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