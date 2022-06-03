var mongoose = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");
var uniqueValidator = require('mongoose-unique-validator');
var findOrCreate = require('mongoose-findorcreate')

const Schema = mongoose.Schema;
var User = new Schema({

  username: {type: String, lowercase: true, match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
  nomcomplet:String,
  email: {type: String, lowercase: true, unique: true, match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  googleId: String,
  bio: String,
  image: String,
  hash: String,
  salt: String
}, {timestamps: true});




User.plugin(uniqueValidator, {message: 'is already taken.'});
User.plugin(findOrCreate);
User.plugin(passportLocalMongoose);


module.exports = Item = mongoose.model('user', User);