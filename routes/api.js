/**
 * Created by barte_000 on 2016-12-31.
 */
var express = require('express');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var _ = require('lodash');
var router = express.Router();
var path = require('path');
var queryHelper = require('./helpers/query-helper');
var config = require(path.join(__dirname, '..', 'config', 'config.json'));
var Liquid = require(path.join(__dirname, '..', 'models', 'liquid'));
var User = require(path.join(__dirname, '..', 'models', 'user'));

var jwtConfig = expressJwt({secret: config.tokenSecret, decode: jwt.decode});

var sendContentInaccessible = function (res) {
    res.writeHead(403, {"Content-Type": "application/json"});
    res.end(JSON.stringify({
        success: false,
        error: "Sorry, you are not allowed to view this item"
    }));
};

var getUserId = function (req, callback) {
    var userId = undefined;
    if (req.user && req.user._id) {
        callback(req.user._id);
    }
    else if (req.headers && req.headers.authorization) {
        try {
            var token = req.headers.authorization.replace('Bearer ', '');
            jwt.verify(token, config.tokenSecret, function (err, decoded) {
                if (err || !decoded) {
                    callback();
                    return;
                }
                callback(decoded._id);
            });
        } catch (Exception) {
            callback();
        }
    } else {
        callback();
    }
};

router.post('/liquid/favorites', jwtConfig, function (req, res) {
    var data = req.body;

    if (!data) {
        res.writeHead(500, {"Content-Type": "application/json"});
        return res.end(JSON.stringify({
            error: "Adding to favorites failed - error parsing request data. No data received"
        }));
    }

    if (!data.liquidId) {
        res.writeHead(500, {"Content-Type": "application/json"});
        return res.end(JSON.stringify({
            error: "Adding to favorites failed - recipie ID not provided"
        }));
    }

    var insert = 1;
    if (data.insert) {
        insert = data.insert;
    }

    var userId = req.user._id;

    Liquid.find({_id: data.liquidId, "favorites.user": userId}, '_id', function (r, d) {
        if (r) {
            res.writeHead(500, {"Content-Type": "application/json"});
            return res.end(JSON.stringify({
                error: r
            }));
        }

        var updateInfo = {
            "favorites": {
                "user": userId
            }
        };
        var input = {};

        if (d.length && d.length > 0) {
            if (insert < 0) {
                // remove
                input["$pull"] = updateInfo;
            }
        } else {
            if (insert >= 0) {
                // add
                input["$push"] = updateInfo;
            }
        }

        if(_.has(input, '$pull') || _.has(input, '$push')){
            Liquid.findOneAndUpdate(data.liquidId, input, {safe: true, upsert: true}, function (err, results) {
                if (err) {
                    res.writeHead(500, {"Content-Type": "application/json"});
                    return res.end(JSON.stringify({
                        error: err
                    }));
                }

                res.writeHead(200, {"Content-Type": "application/json"});
                return res.end();
            });
        }else{
            res.writeHead(200, {"Content-Type": "application/json"});
            return res.end();
        }

    });
});

router.post('/liquid/comment', jwtConfig, function (req, res) {
    var data = req.body;

    if (!data) {
        res.writeHead(500, {"Content-Type": "application/json"});
        return res.end(JSON.stringify({
            error: "Error parsing request data. No data received"
        }));
    }

    var liquidId = data.liquidId;
    var comment = data.comment;
    comment.date = new Date();

    Liquid.findByIdAndUpdate(liquidId, {
        $push: {
            "comments": comment
        }
    }, {safe: true, upsert: true}, function (err, results) {
        if (err) {
            res.writeHead(500, {"Content-Type": "application/json"});
            return res.end(JSON.stringify({
                error: err
            }));
        }

        res.writeHead(200, {"Content-Type": "application/json"});
        return res.end();
    });
});

router.post('/liquid/rating', jwtConfig, function (req, res) {
    var data = req.body;

    if (!data) {
        res.writeHead(500, {"Content-Type": "application/json"});
        return res.end(JSON.stringify({
            error: "Error parsing request data. No data received"
        }));
    }

    var liquidId = data.liquidId;
    var rating = data.rating;
    rating.date = new Date();

    getUserId(req, function(id){
        if(!id){
            res.writeHead(401, {"Content-Type": "application/json"});
            return res.end(JSON.stringify({
                error: "User is not logged in or not authorised"
            }));
        }

        Liquid.find({_id: liquidId, "ratings.author": id}, function(e, liq){
           if(liq && liq.length && liq.length > 0){
               Liquid.update({_id: liquidId, "ratings.author": id}, {"$set": {
                   "ratings.$.rating": rating.rating,
                   "ratings.$.date": rating.date
               }}, function(err, result){
                   if (err) {
                       res.writeHead(500, {"Content-Type": "application/json"});
                       return res.end(JSON.stringify({
                           error: err
                       }));
                   }

                   res.writeHead(200, {"Content-Type": "application/json"});
                   return res.end();
               });
           }else{
               Liquid.findByIdAndUpdate(liquidId, {
                   $push: {
                       "ratings": rating
                   }
               }, {safe: true, upsert: true}, function (err, results) {
                   if (err) {
                       res.writeHead(500, {"Content-Type": "application/json"});
                       return res.end(JSON.stringify({
                           error: err
                       }));
                   }

                   res.writeHead(200, {"Content-Type": "application/json"});
                   return res.end();
               });
           }
        });
    });
});

router.post('/liquid', jwtConfig, function (req, res) {
    var data = req.body;

    if (!data.lastUpdate)
        data.lastUpdate = new Date();

    Liquid.create(data, function (error, result) {
        if (error) {
            res.writeHead(500, {"Content-Type": "application/json"});
            res.end(JSON.stringify({
                success: false,
                error: error
            }));
        } else {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end();
        }
    });
});

router.get('/liquid/:id', function (req, res) {

    if (!req.params || !req.params.id) {
        res.writeHead(500, {"Content-Type": "application/json"});
        res.end(JSON.stringify({
            success: false,
            error: "Item ID was not specified or is invalid"
        }));
        return;
    }

    var populate = [{path: 'comments.author', select: '_id fullname username'}, {
        path: 'ratings.author',
        select: '_id fullname username'
    }, {
        path: 'author',
        select: '_id fullname username'
    }];

    getUserId(req, function (userId) {

        var obj = Liquid.findById(req.params.id);

        if(userId){
            populate.push({
                path: 'favorites',
                match: {'user': userId}
            });
        }else{
            obj.select('-favorites');
        }

        obj.populate(populate).exec(function (err, data) {
            if (err) {
                res.writeHead(500, {"Content-Type": "application/json"});
                res.end(JSON.stringify({
                    success: false,
                    error: err
                }));
            } else {

                if (!userId || (userId && data && data.author && userId !== data.author._id)) {
                    if (data.isPrivate) {
                        sendContentInaccessible(res);
                        return;
                    }
                }

                var responseData = {};

                for(var k in data._doc){
                    if(data._doc.hasOwnProperty(k)){
                        responseData[k] = data._doc[k];
                    }
                }

                responseData.isFavorite = !!(responseData.favorites && responseData.favorites.length && responseData.favorites.length>0);

                if(responseData.favorites)
                    delete responseData.favorites;


                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(responseData));

            }
        });
    });
});

router.get('/liquids/user/:id', jwtConfig, function (req, res) {

    if (!req.params.id) {
        res.writeHead(500, {"Content-Type": "application/json"});
        res.end(JSON.stringify({
            success: false,
            error: "User ID was not provided"
        }));
    }

    queryHelper.getItemsList(req, res, Liquid, function (match) {
        if (!match || match == null || (Object.keys(match).length === 0 && match.constructor === Object)) {
            match = {
                "$and": [
                    {"author._id": {"$in": [mongoose.Types.ObjectId(req.params.id)]}}
                ]
            }
        } else {
            if (!match["$and"]) {
                match["$and"] = [];
            }
            match["$and"].push({"author._id": {"$in": [mongoose.Types.ObjectId(req.params.id)]}});
        }
        return match;
    }, function (sort) {
        if (!sort || (Object.keys(sort).length === 0 && sort.constructor === Object)) {
            sort = {
                "nameLower": 1
            }
        }
        return sort;
    });
});

router.get('/liquids', function (req, res) {

    queryHelper.getItemsList(req, res, Liquid, function (match, userId) {
        if (!match || match === null || (Object.keys(match).length === 0 && match.constructor === Object)) {
            match = {
                "$and": [
                    {"isPrivate": false}
                ]
            };
        }
        return match;
    }, function (sort) {
        if (!sort || (Object.keys(sort).length === 0 && sort.constructor === Object)) {
            sort = {
                "nameLower": 1
            }
        }
        return sort;
    });
});

module.exports = router;