var express = require('express');
var router = express.Router();
var passport = require('passport');
var Users = require('../models/user');
var jwt = require('jsonwebtoken');
var path = require('path');
var config = require(path.join(__dirname, '..', 'config', 'config.json'));

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.post('/login/facebook', function (req, res, next) {
    Users.findOne({
        'facebook.id': req.body.id
    }).exec(function (error, user) {
        if (error) {
            res.writeHead(401, {"Content-Type": "application/json"});
            res.end(JSON.stringify({data: error}));
            return;
        }

        if (!user) {
            Users.findOne({username: req.body.email}).exec(function (error, userLocal) {
                if (error) {
                    res.writeHead(401, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({error: error}));
                    return;
                }

                if (!userLocal) {
                    Users.create({
                        username: req.body.email,
                        fullname: req.body.name,
                        facebook: req.body
                    }, function (err, newUser) {
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
                        res.writeHead(200, {"Content-Type": "application/json"});
                        return res.end(JSON.stringify({token: token}));
                    });
                } else {
                    userLocal.facebook = req.body;
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
                        return res.end(JSON.stringify({token: token}));
                    });
                }
            });
        } else {
            var sendUser = {
                _id: user._id,
                username: user.username,
                fullname: user.fullname
            };
            var token = jwt.sign(sendUser, config.tokenSecret, {expiresIn: 60 * 60 * 5});
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({token: token}));
        }
    });
});

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            res.writeHead(500, {"Content-Type": "application/json"});
            res.end(err);
            return;
        }
        if (!user) {
            res.writeHead(401, {"Content-Type": "application/json"});

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
            fullname: user.fullname
        };

        var token = jwt.sign(sendUser, config.tokenSecret);
        res.writeHead(200, {"Content-Type": "application/json"});
        return res.end(JSON.stringify({token: token}));
        // req.logIn(user, function(err){
        //     if(err){
        //         res.writeHead(401, {"Content-Type": "application/json"});
        //         res.end(JSON.stringify({data: err}));
        //     }else{
        //         res.writeHead(200, {"Content-Type": "application/json"});
        //         res.end(JSON.stringify(user));
        //     }
        // });
    })(req, res, next);
});

router.post('/register', function (req, res, next) {
    var form = req.body;

    if (!form || !form.username) {
        res.writeHead(400, {"Content-Type": "application/json"});
        res.end(JSON.stringify({error: "Username was not provided"}));
        return;
    }

    Users.find({
        username: form.username
    }).exec(function (error, data) {
        if (data && data.length > 0) {
            res.writeHead(401, {"Content-Type": "application/json"});
            res.end(JSON.stringify({error: "User with specified name already exists"}));
            return;
        }

        Users.create({
            username: form.username,
            fullname: form.fullname,
            password: form.password
        }, function (err, newUser) {
            if (err) {
                res.writeHead(400, {"Content-Type": "application/json"});
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
