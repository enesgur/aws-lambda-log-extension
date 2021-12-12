const http = require('http');

exports.listen = async function (address, port, callback) {
    const queue = [];
    // Listen the HTTP for the Logs API
    const server = http.createServer(function (request, response) {
        // Invalid request
        if (request.method !== 'POST') {
            console.log('Invalid Request Method', request.method);
            response.writeHead(200, {});
            response.end("OK");
        }

        // Get data
        let body = '';
        request.on('data', function (data) {
            body += data;
        });

        // Send to the Queue
        request.on('end', function () {
            try {
                callback(JSON.parse(body))
            } catch (e) {
                console.log("Log Parse Error", e);
            }
            response.writeHead(200, {})
            response.end("OK")
        });
    });

    // Start the server
    server.listen(port, address);
    return {queue, server};
}