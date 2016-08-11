var mongoose = require('mongoose');
var Schema  = mongoose.Schema;

var messageSchema = new Schema({
	content: String,
	username: String,
	color: String
});

//now it's a mongo ready model
var Message = mongoose.model('Message', messageSchema);

module.exports = Message;
