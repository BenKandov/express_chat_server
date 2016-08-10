var mongoose = require('mongoose');
var Schema  = mongoose.Schema;


var userSchema = new Schema({
	username : { type: String, required:true,unique:true },
	password: {type:String, required:true },
	admin : Boolean
});

//now it's a mongo ready model
var User = mongoose.model('User', userSchema);

module.exports = User;
