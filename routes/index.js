var express = require('express');
var router = express.Router();
var passport = require('passport');
var Users = require('../models/user');

// FACEBOOK
router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/'
}));

router.get('/user', function(req, res, next){
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify({isAuthenticated: req.isAuthenticated(), user: req.user}));

});

router.get('/logoff', function(req, res, next){
    req.logout();
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end();
});

router.post('/login', function(req, res, next){
  passport.authenticate('local', function(err, user, info){
      if (err) {
          res.writeHead(500, {"Content-Type": "application/json"});
          res.end(err);
          return;
      }
      if(!user){
          res.writeHead(500, {"Content-Type": "application/json"});

          var result = {
              error: "Invalid username or password"
          };

          if(info && info.msg){
              result.error = info.msg;
          }

          return res.end(JSON.stringify(result));
      }
      req.logIn(user, function(err){
          if(err){
              res.writeHead(401, {"Content-Type": "application/json"});
              res.end(JSON.stringify({data: err}));
          }else{
              res.writeHead(200, {"Content-Type": "application/json"});
              res.end(JSON.stringify(user));
          }
      });
  })(req, res, next);
});

router.post('/register', function(req, res, next){
    var form = req.body;

    if(!form || !form.username){
        res.writeHead(400, {"Content-Type": "application/json"});
        res.end("Username was not provided");
        return;
    }

    Users.find({
        username: form.username
    }).exec(function(error, data) {
        if(data && data.length > 0){
            res.writeHead(401, {"Content-Type": "application/json"});
            res.end("User with specified name already exists");
            return;
        }

        Users.create({
            username: form.username,
            fullname: form.fullname,
            password: form.password
        }, function(err, newUser){
            if(err){
                res.writeHead(500, {"Content-Type": "application/json"});
                res.end(err);
                return;
            }
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end();
        });
    });
});


module.exports = router;
