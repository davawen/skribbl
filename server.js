const fs = require('fs');
const port = 8080;

function handleRequest(request, response)
{
    fs.readFile(__dirname + '/index.html',
        function (err, data)
        {
            if (err)
            {
                response.writeHead(500);
                return response.end('Error loading index.html');
            }
            response.writeHead(200);
            response.end(data);
        }
    );
}

let http = require('http');

let server = http.createServer(handleRequest);
server.listen(port);

console.log("Started on port " + port);