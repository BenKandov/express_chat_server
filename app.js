var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sanitize = require('validator');
var mongoose = require('mongoose');
//link up our db models
var User = require("./models/user");
var Message = require("./models/message");


var config = require('./config');
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();


//configuration

mongoose.connect(config.database);
var port = process.env.PORT  ||  8888;
app.set('superSecret',config.secret);


var server = app.listen(port);
var io = require("socket.io").listen(server);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/**
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
**/


module.exports = app;

//socket io stuff
var people = {};
var client_name_color = null;
//we're gonna make an array to store name color for the various session ids
var name_color = {};


//socket.emit will update locally whereas io.sockets.emit will update across clients
io.sockets.on('connection', function(socket){
  socket.on("join", function(name){



    var escaped_name = sanitize.escape(name);
    people[socket.id] = escaped_name;

    //
    client_name_color = "rgb("+Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255)+ "," + Math.floor(Math.random() * 255) + ")";
    //






    name_color[socket.id] = client_name_color;
    socket.emit("update", "Succesfully connected to server.");
    io.sockets.emit("update", "<b id='client_name_" +  socket.id.replace('/#', '')  + "'>" + name + " has joined the chat.");
    io.sockets.emit("update-people", {peep:people,colors:name_color});


 

    //let's loop through the messages doc to get them all in an array and append them


   Message.find({}, function(err,docs){
       console.log(docs);
       for(var i =0; i< docs.length;i++){
          io.sockets.emit("message_to_client", {message: "<b style='color:"  + docs[i].color  + "'>" + docs[i].username +"</b> : " +docs[i].content});
       }
    });


    
  
  });
  socket.on("disconnect", function(){
    io.sockets.emit("update", people[socket.id] + " has left the chat.");
    delete people[socket.id];
    delete name_color[socket.id]
    io.sockets.emit("update-people",{peep:people,colors:name_color});
  });
  socket.on("message_to_server", function(data){
    //This way we have sanitized our messages before adding them to our chatlog
    var escaped_message = sanitize.escape(data["message"]);
    if(data['name'].valueOf().trim()!="Nobody" && data['name'].valueOf().trim()!="Select a person to PM"){
    //  var id = people[data['name']];
      var name = data['name'];

      var id = null;
      for(var socketid in people){
        if(people[socketid].valueOf() == name.trim()){
          id = socketid;
      
        }
      }
      //var id = 
      console.log(id);
      
      io.sockets.sockets[id].emit("message_to_client", {message: "<b style='color:"  + name_color[socket.id]  + "'>" + people[socket.id] +"(Private Message)</b> : " +escaped_message});
      io.sockets.sockets[socket.id].emit("message_to_client", {message: "<b style='color:"  + name_color[socket.id]  + "'>" + people[socket.id] +"(Private Message to " + name + ")</b> : " +escaped_message});
      //Now let's add this message to our MongoDB


    }else{
    
      io.sockets.emit("message_to_client", {message: "<b style='color:"  + name_color[socket.id]  + "'>" + people[socket.id] +"</b> : " +escaped_message});
            var newMessage = Message({
        content : escaped_message,
        username :people[socket.id],
        color : name_color[socket.id]
      });
      newMessage.save(function(err) {
        console.log("saved post");
      });
    }
    
  
  
    
  });
});




