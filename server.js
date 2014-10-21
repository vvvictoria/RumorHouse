// HTTP Portion
var http = require('http');
var fs = require('fs');
var httpServer = http.createServer(requestHandler);
httpServer.listen(8080);

console.log("listening on 8080")


function requestHandler(req, res){
	//read the html file and callback function
	fs.readFile(__dirname + '/p2p.html', function (err, data) {
		// if there is an error
		if (err) {
			res.writeHead(500);
			return res.end('Error loading p2p.html!');
		}
		// otherwise send the data
		res.writeHead(200);
		res.end(data);
	});
}

// websockets portion 
// websockets work with the http httpServer
var io = require('socket.io').listen(httpServer);

// since io.sockets.clients() no longer works ??
var connectedSockets = [];
 
var desiredUsers = 4;

// register a callback function to run wehen we have an individual connection.
// this is run for each individual user that connectedSockets
io.sockets.on('connection', function (socket){

	console.log("We have a new client: " + socket.id);

	socket.on('chatmessage', function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: 'chatmessage' " + data);
			
			// Send it to all of the clients
			socket.broadcast.emit('chatmessage', data);
	});
		

	// add to the connectedSockets array
	connectedSockets.push(socket); 

	socket.on('peer_id', function (data){
		console.log("Received: 'peer_id' " + data);

		// we can save this in the socket object
		socket.peer_id = data;
		console.log("Saved: " + socket.peer_id);

		// we can loop through these
		for (var i = 0; i < connectedSockets.length; i++) {
			console.log("loop: " + i + " " + connectedSockets[i].peer_id);
		}

		
		socket.broadcast.emit('peer_id_server', data);
	});
 

	socket.on('disconnect', function(){
		console.log("Client has disconnected");
		var indexToRemove = connectedSockets.indexOf(socket);
		connectedSockets.splice(indexToRemove, 1);

		//tells all clients who disconnected
		io.sockets.emit('peer_disconnect', socket.peer_id);

		console.log("Users Connected : " + connectedSockets.length);
	});
});

 











