/**
 * Created by barte_000 on 2016-12-31.
 */
var express = require('express');
var router = express.Router();
var url = require('url');
var path = require('path');
var filtersHelper = require('./helpers/filters-helper');
var Liquid = require(path.join(__dirname, '..', 'models', 'liquid'));
var User = require(path.join(__dirname, '..', 'models', 'user'));

router.post('/liquid/comment', function (req, res) {
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

router.post('/liquid/rating', function (req, res) {
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

router.get('/liquid/:id', function (req, res) {

    var populate = [{path: 'comments.author', select: '_id fullname username'}, {
        path: 'ratings.author',
        select: '_id fullname username'
    },{
     path: 'author',
     select: '_id fullname username'
    }];

    Liquid.findById(req.params.id).populate(populate).exec(function (err, data) {
        if (err) {
            res.writeHead(500, {"Content-Type": "application/json"});
            res.end(JSON.stringify({
                success: false,
                error: err
            }));
        } else {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(data));
        }
    });
});

router.get('/liquids', function (req, res) {

    var urlParts = url.parse(req.url, true);

    var match = {
        "isPrivate": false
    };
    var sort = {
        "nameLower": 1
    };

    if (urlParts && urlParts.query && (urlParts.query.filter || urlParts.query.sort)) {
        if(urlParts.query.filter) {
            match = filtersHelper.buildMongoFilterQuery(urlParts.query);
        }
        if(urlParts.query.sort){
            sort = filtersHelper.buildMongoSortQuery(urlParts.query);
        }
    }

    var query = [
        {
            "$unwind": {
                "path": "$ratings",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$unwind": {
                "path": "$aromas",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$unwind": {
                "path": "$accessories",
                "preserveNullAndEmptyArrays": true
            }
        },

        {
            "$lookup": {
                "from": "Users",
                "localField": "author",
                "foreignField": "_id",
                "as": "author"
            }
        },
        {
            "$unwind": {
                "path": "$author",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$match": match
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
                "author": {"$first": '$author'},
                "name": {"$first": '$name'},
                "lastUpdate": {"$first": '$lastUpdate'},
                "isPrivate": {"$first": '$isPrivate'}
            }
        },
        {
            "$project": {
                "_id": 1,
                "ratingsCount": 1,
                "ratingAverage": 1,
                "name": 1,
                "nameLower": { "$toLower": "$name" },
                "lastUpdate": 1,
                "isPrivate": 1,
                "author._id": 1,
                "author.username": 1,
                "author.fullname": 1
            }
        },{
            "$sort": sort
        }
    ];

    Liquid.aggregate(query).exec(function (error, data) {
        if (error) {
            res.writeHead(500, {"Content-Type": "application/json"});
            res.end(JSON.stringify({
                success: false,
                error: error
            }));
        } else {

            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(data));
        }
    });
});

module.exports = router;