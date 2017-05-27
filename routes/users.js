var express = require('express');
var expressJwt = require('express-jwt');
var router = express.Router();
var passport = require('passport');
var Users = require('../models/user');
var jwt = require('jsonwebtoken');
var path = require('path');
var config = require(path.join(__dirname, '..', 'config', 'config.json'));
var fbUtils = require('./helpers/facebook-utils');
var queryHelper = require('./helpers/query-helper');
var authHelper = require('./helpers/auth');

var jwtConfig = expressJwt({secret: config.tokenSecret, decode: jwt.decode});

router.get('/account/:id', function(req, res, next){
    if (!req.params || !req.params.id) {
        res.writeHead(500, {"Content-Type": "application/json"});
        res.end(JSON.stringify({
            success: false,
            error: "Item ID was not specified or is invalid"
        }));
        return;
    }

    Users.findById(req.params.id, {'username': 1, 'fullname': 1, 'picture': 1}, function(e, userData){
        if(e){
            res.writeHead(500, {"Content-Type": "application/json"});
            res.end(JSON.stringify({error: "Unable to get user account data: " + e}));
            return;
        }

        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(userData));
    });
});

router.post('/account', jwtConfig, function(req, res, next){
   queryHelper.getUserId(req, function(id){
      if(!id){
          res.writeHead(401, {"Content-Type": "application/json"});
          res.end(JSON.stringify({error: "Unable to save user settings. Invalid user ID"}));
          return;
      }

      var userNewInfo = req.body;

      Users.findById(id, function(error, data){
          if(error){
              res.writeHead(500, {"Content-Type": "application/json"});
              res.end(JSON.stringify({error: "Unable to save user settings - unable to find user data: "+error}));
              return;
          }

          Users.find({username: userNewInfo.username}, function(e, user){
              if(user.length && userNewInfo.username !== user[0].username){
                  res.writeHead(500, {"Content-Type": "application/json"});
                  res.end(JSON.stringify({error: "Specified username already exists"}));
              }else{
                  data.fullname = userNewInfo.fullname;
                  data.username = userNewInfo.username;
                  if(userNewInfo.picture){
                      data.picture = userNewInfo.picture;
                  }
                  if(userNewInfo.password){
                      data.password = userNewInfo.password;
                  }

                  Users.findOneAndUpdate({_id: id}, data, {new: true}, function(e, result){
                      if(e){
                          res.writeHead(500, {"Content-Type": "application/json"});
                          res.end(JSON.stringify({error: "Unable to save user settings: "+e}));
                          return;
                      }

                      var userData = {
                          _id: result._id,
                          username: result.username,
                          fullname: result.fullname
                      };

                      var sendData = {
                          token: authHelper.getToken(userData),
                          picture: result.picture
                      };

                      res.writeHead(200, {"Content-Type": "application/json"});
                      res.end(JSON.stringify({success: true, auth: sendData}));
                  });
              }
          });
      });
   });
});

router.post('/login/facebook', function (req, res, next) {
    Users.findOne({
        'facebook.id': req.body.id
    }).exec(function (error, user) {
        if (error) {
            res.writeHead(422, {"Content-Type": "application/json"});
            res.end(JSON.stringify({data: error}));
            return;
        }

        if (!user) {
            Users.findOne({username: req.body.email}).exec(function (error, userLocal) {
                if (error) {
                    res.writeHead(422, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({error: error}));
                    return;
                }

                if (!userLocal) {

                    var getPictureCompleted = function(img){

                        var userEntry = {
                            username: req.body.email,
                            fullname: req.body.name,
                            facebook: req.body
                        };
                        if(img){
                            userEntry.picture = img;
                        }

                        Users.create(userEntry, function (err, newUser) {
                            if (err) {
                                res.writeHead(500, {"Content-Type": "application/json"});
                                res.end(JSON.stringify({error: "Unable to create user:" + err}));
                                return;
                            }

                            var sendUser = {
                                _id: newUser._id,
                                username: newUser.username,
                                fullname: newUser.fullname
                            };

                            var token = jwt.sign(sendUser, config.tokenSecret, {expiresIn: 60 * 60 * 5});

                            var dataToSend = {
                                token: token
                            };
                            if(newUser.picture){
                                dataToSend.picture = newUser.picture;
                            }
                            res.writeHead(200, {"Content-Type": "application/json"});
                            return res.end(JSON.stringify(dataToSend));
                        });
                    };

                    if(req.body.auth && req.body.auth.accessToken){
                        fbUtils.getProfilePicture(req.body.id, req.body.auth.accessToken, getPictureCompleted);
                    }else{
                        getPictureCompleted();
                    }

                } else {
                    userLocal.facebook = {
                        id: req.body.id,
                        name: req.body.name,
                        email: req.body.email
                    };
                    Users.findOneAndUpdate({_id: userLocal._id}, userLocal).exec(function (e, newLocal) {
                        if (e) {
                            res.writeHead(500, {"Content-Type": "application/json"});
                            res.end(JSON.stringify({error: "Unable to create user:" + e}));
                            return;
                        }

                        var sendUser = {
                            _id: newLocal._id,
                            username: newLocal.username,
                            fullname: newLocal.fullname
                        };

                        var token = jwt.sign(sendUser, config.tokenSecret, {expiresIn: 60 * 60 * 5});

                        res.writeHead(200, {"Content-Type": "application/json"});
                        return res.end(JSON.stringify({token: token, picture: newLocal.picture}));
                    });
                }
            });
        } else {
            var sendResponse = function(img){
                var sendUser = {
                    _id: user._id,
                    username: user.username,
                    fullname: user.fullname
                };

                if(img){
                    user.picture = img;

                    Users.findOneAndUpdate({_id: user._id}, user, function(updateError, updateData){
                        var token = jwt.sign(sendUser, config.tokenSecret, {expiresIn: 60 * 60 * 5});
                        res.writeHead(200, {"Content-Type": "application/json"});
                        res.end(JSON.stringify({token: token, picture: img}));
                    });
                }else{
                    var token = jwt.sign(sendUser, config.tokenSecret, {expiresIn: 60 * 60 * 5});
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({token: token, picture: user.picture}));
                }
            };

            if(!user.picture){
                fbUtils.getProfilePicture(req.body.id, req.body.auth.accessToken, sendResponse);
            }else {
                sendResponse();
            }

        }
    });
});

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            res.writeHead(422, {"Content-Type": "application/json"});
            res.end(err);
            return;
        }
        if (!user) {
            res.writeHead(422, {"Content-Type": "application/json"});

            var result = {
                error: "Invalid username or password"
            };

            if (info && info.msg) {
                result.error = info.msg;
            }

            return res.end(JSON.stringify(result));
        }

        var sendUser = {
            _id: user._id,
            username: user.username,
            fullname: user.fullname,
            picture: user.picture
        };

        var token = jwt.sign(sendUser, config.tokenSecret);
        res.writeHead(200, {"Content-Type": "application/json"});
        return res.end(JSON.stringify({token: token}));
    })(req, res, next);
});

router.post('/register', function (req, res, next) {
    var form = req.body;

    if (!form || !form.username) {
        res.writeHead(422, {"Content-Type": "application/json"});
        res.end(JSON.stringify({error: "Username was not provided"}));
        return;
    }

    Users.find({
        username: form.username
    }).exec(function (error, data) {
        if (data && data.length > 0) {
            res.writeHead(422, {"Content-Type": "application/json"});
            res.end(JSON.stringify({error: "User with specified email already exists"}));
            return;
        }

        Users.create({
            username: form.username,
            fullname: form.fullname,
            password: form.password
        }, function (err, newUser) {
            if (err) {
                res.writeHead(422, {"Content-Type": "application/json"});
                res.end(JSON.stringify({error: err}));
                return;
            }

            var sendUser = {
                username: newUser.username,
                fullname: newUser.fullname
            };

            var token = jwt.sign(sendUser, config.tokenSecret);
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({token: token}));
        });
    });
});

module.exports = router;
