"use strict";

process.title = 'keyboard server';

/**
 * Setting variables, requiring the necessary modules and starting the static file server
 */
var port = 1337,
    indexCounter = 0,
    clients = {},
    http = require('http'),
    st = require('node-static'),
    fileServer = new st.Server();

/**
 * HTTP server
 */
var server = http.createServer(function(request, response) {

    //on every request end, the static file server will send the requested file
    request.addListener('end', function () {
        fileServer.serve(request, response);
    });
});

server.listen(port, function() {
    console.log(" Node.js is running on port " + port);
    console.log((new Date()));
});


/**
 * WebSocket server
 */
var webSocketServer = require('websocket').server;

var wsServer = new webSocketServer({
    httpServer: server
});
 
wsServer.on('request', function(request) {

    var connection = request.accept(null, request.origin); 

    var index = indexCounter.toString();

    //every connection will be stored on "clients" object
    clients[indexCounter] = connection;
    indexCounter++;
    
    //on every message will be streamed to every client except the sender
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            for (var i in clients) {
                 if (i !== index && clients[i] !== null) {
                    clients[i].sendUTF(JSON.stringify(message));
                }
            }
        }
    });
 
    //when a connection is closed the client will be removed from "clients" object
    connection.on('close', function() {
        delete clients[index];
    });
});