/**
 * Created by barte_000 on 2017-01-05.
 */
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var path = require('path');
var config = require(path.join(__dirname, '..', 'config', 'config.json'));

var userSchema = mongoose.Schema({
    username: {type: String, required: true},
    fullname: {type: String, required: true},
    password: {type: String, required: false},
    facebook: {},
    picture: {type: String, required: false}
}, {
    collection: "Users"
});

userSchema.pre('save', function(next){
   var user = this;
   if(!user.isModified('password')){
       return next();
   }
   bcrypt.genSalt(10, function(err, salt){
      if(err)
          return next(err);

      bcrypt.hash(user.password, salt, null, function(err, hash){
         if(err)
             return next(err);

         user.password = hash;
         next();
      });
   });
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        cb(err, isMatch);
    });
};

var User = mongoose.model('User', userSchema);
module.exports = User;