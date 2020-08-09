let handleRequest = function(req, res)
{
    res.writeHead(200);
    res.end("Hello World");
}

const http = require('http');
let server = http.createServer(handleRequest);
server.listen(8080);