/**
 * Created by barte_000 on 2016-12-31.
 */
var express = require('express');
var router = express.Router();
var path = require('path');
var Liquid = require(path.join(__dirname, '..', 'models', 'liquid'));
var User = require(path.join(__dirname, '..', 'models', 'user'));

router.post('/liquid/comment', function(req, res){
    var data = req.body;

    if(!data) {
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
    }, {safe: true, upsert: true}, function(err, results){
        if(err){
            res.writeHead(500, {"Content-Type": "application/json"});
            return res.end(JSON.stringify({
                error: err
            }));
        }

        res.writeHead(200, {"Content-Type": "application/json"});
        return res.end();
    });
});

router.post('/liquid/rating', function(req, res){
   var data = req.body;

    if(!data) {
        res.writeHead(500, {"Content-Type": "application/json"});
        return res.end(JSON.stringify({
            error: "Error parsing request data. No data received"
        }));
    }

    var liquidId = data.liquidId;
    var rating = data.rating;
    rating.date = new Date();

    Liquid.findByIdAndUpdate(liquidId, {
        $push: {
            "ratings": rating
        }
    }, {safe: true, upsert: true}, function(err, results){
        if(err){
            res.writeHead(500, {"Content-Type": "application/json"});
            return res.end(JSON.stringify({
                error: err
            }));
        }

        res.writeHead(200, {"Content-Type": "application/json"});
        return res.end();
    });
});

router.post('/liquid', function (req, res) {
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

router.get('/liquid/:id', function(req, res){

    var populate = [{path: 'comments.author', select: '_id fullname username'}, {path: 'ratings.author', select: '_id fullname username'}];

    Liquid.findById(req.params.id).populate(populate).exec(function(err, data){
        if(err){
            res.writeHead(500, {"Content-Type": "application/json"});
            res.end(JSON.stringify({
                success: false,
                error: err
            }));
            return;
        }else{
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(data));
        }
    });
});

router.get('/liquids', function (req, res) {

    Liquid.aggregate([
        {
            "$unwind": {
                "path": "$ratings",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$group": {
                "_id": "$_id",
                "ratingsCount": {
                    "$sum": {
                        "$cond": [{"$gt": ["$ratings", null]}, 1, 0]
                    }
                },
                "ratingAverage": {"$avg": {"$ifNull": ["$ratings.rating", 0]}},
                "name": {"$first": '$name'},
                "author": {"$first": '$author'},
                "lastUpdate": {"$first": '$lastUpdate'}
                // "lastUpdate": {"$first": {
                //     '$dateToString': {
                //         'format': '%Y-%m-%d %H:%M',
                //         'date': '$lastUpdate'
                //     }
                // }}
            }
        }
    ]).exec(function (error, data) {
        if (error) {
            res.writeHead(500, {"Content-Type": "application/json"});
            res.end(JSON.stringify({
                success: false,
                error: error
            }));
        } else {

            Liquid.populate(data, {"path": "author", "select": "username fullname"}, function (err, results) {
                if (err) {
                    res.writeHead(500, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({
                        success: false,
                        error: error
                    }));
                    return;
                }

                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(results));
            });
        }
    });
});

module.exports = router;