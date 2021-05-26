const express = require('express');
const path = require("path");
const bodyParser = require('body-parser');
const app = express();
//body parser
app.use(bodyParser.urlencoded({extended: true}));
//views
app.use(express.static(__dirname + "/views"));
//css
app.use(express.static(__dirname + "/css"));
//ejs
app.set('view engine', 'ejs');
//routes
app.get("/", function(request, response) {
    response.render("index");
});
//port
const server = app.listen(8000, function() {
	console.log("listening on port 8000");
});

let usernames = {};
let chat_logs = [];
const io = require('socket.io')(server);    // socket.io connection
io.sockets.on('connection', function(socket) {  // Establishing a connection with user
    // console.log(socket);
	console.log("Connected: "+ socket.connected);
	socket.on("new_user", function(data) { // handling the new user creation with socket id
		console.log("New user created: "+ data.name);
		console.log("Socket ID: "+ socket.id);
		usernames[socket.id] = data.name;
		console.log(usernames);
		socket.emit('chat_logs', {chat_logs:chat_logs});
		socket.emit("user_id", {user_id: socket.id, name: data.name});
		socket.broadcast.emit("user_entered_chat", {response: data.name + " has entered chat room!"}); //broadcasting the user that enters the chat room
	});
	socket.on("send_chat_message", function(data) { // handling the sending of chat messages
		chat_logs.push("<li><span class='user-name'>"+ data.name +":</span> "+ data.message + "</li>");
		io.emit("updated_message", {message : "<li><span class='user-name'>" + data.name + ":</span> " + data.message + "</li>" });
		// console.log(chat_logs);
	});
	socket.on("update_log", function(data) {
		chat_logs.push(data.message);
	});
	socket.on("disconnect", function(data){ // handling the disconnection of a user
		chat_logs.push("<li class='user-left-chat'>"+usernames[socket.id]+" has left the chat room."+"</li>");
		io.emit("user_disconnect", usernames[socket.id])
	})
});