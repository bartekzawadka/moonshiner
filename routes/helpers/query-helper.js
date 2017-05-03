/**
 * Created by barte_000 on 2017-02-11.
 */
var url = require('url');
var mongoose = require('mongoose');

function getDateObject(dateString){
    try {
        if(!dateString)
            return null;

        var date = new Date(dateString);
        if(date == 'Invalid Date')
            return null;

        return date;
    }catch (Exception){
        return null;
    }
}

function buildMongoFilterQuery(urlParsed, userId){

    if(!urlParsed || !urlParsed.filter)
        return null;

    var match = {
        "$and" : []
    };

    if(urlParsed.filter.phrase){
        var filter = {
            "$or" : [
                {
                    "name": {
                        "$regex": '.*' + urlParsed.filter.phrase + '.*', "$options": 'i'
                    }
                },
                {
                    "description": {
                        "$regex": '.*' + urlParsed.filter.phrase + '.*', "$options": 'i'
                    }
                },
                {
                    "author.username": {
                        "$regex": '.*' + urlParsed.filter.phrase + '.*', "$options": 'i'
                    }
                },
                {
                    "author.fullname": {
                        "$regex": '.*' + urlParsed.filter.phrase + '.*', "$options": 'i'
                    }
                },
                {
                    "aromas.name": {
                        "$regex": '.*' + urlParsed.filter.phrase + '.*', "$options": 'i'
                    }
                },
                {
                    "accessories.name": {
                        "$regex": '.*' + urlParsed.filter.phrase + '.*', "$options": 'i'
                    }
                }
            ]
        };

        match["$and"].push(filter);
    }

    if(urlParsed.filter.lastUpdate && (urlParsed.filter.lastUpdate.from || urlParsed.filter.lastUpdate.to)){
        var lastUpdate = {};
        var date = null;

        if(urlParsed.filter.lastUpdate.from){
            date = getDateObject(urlParsed.filter.lastUpdate.from);
            if(date){
                lastUpdate["$gte"] = date;
            }
        }

        if(urlParsed.filter.lastUpdate.to){
            date = getDateObject(urlParsed.filter.lastUpdate.to);
            if(date){
                lastUpdate["$lte"] = date;
            }
        }

        match["$and"].push({"lastUpdate": lastUpdate});
    }

    if(urlParsed.filter.privateOnly === true && userId){
        match["$and"].push({"isPrivate": true});
        match["$and"].push({"author._id": {"$in": [mongoose.Types.ObjectId(userId)]}});
    } else if((urlParsed.filter.privateOnly === undefined || urlParsed.filter.privateOnly === null || urlParsed.filter.privateOnly === 'undefined') && userId){
        match["$and"].push({
            "$or": [{
                "$and": [
                    {"isPrivate": true},
                    {"author._id": {"$in": [mongoose.Types.ObjectId(userId)]}}
                ]},
                {"isPrivate": false}
            ]
        });
    } else{
        match["$and"].push({"isPrivate": false});
    }

    return match;
}

function buildMongoSortQuery(urlParsed){

    if(!urlParsed.sort)
        return null;

    var sort = {};

    var direction = (urlParsed.sort.ascending !== undefined && urlParsed.sort.ascending != null && urlParsed.sort.ascending == false)
        ? -1
        : 1;

    switch(urlParsed.sort.name){
        case 'name':
            sort["nameLower"] = direction;
            break;
        case 'rating':
            sort["ratingAverage"] = direction;
            break;
        case 'author':
            sort["author.fullname"] = direction;
            break;
        case 'date':
            sort["lastUpdate"] = direction;
            break;
        default:
            sort[urlParsed.sort.name] = direction;
            break;
    }

    return sort;
}

function getUserId(req, callback) {
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
    }else{
        callback();
    }
}

function resolveUrlFilterSort(reqUrl){
    var urlParsed = {};

    if(!reqUrl)
        return urlParsed;

    var urlData = url.parse(reqUrl, true);
    if(!urlData || !urlData.query)
        return urlParsed;

    if(!urlData.query.filter && !urlData.query.sort)
        return urlParsed;

    if(urlData.query.filter){
        try{
            urlParsed.filter = JSON.parse(urlData.query.filter);
        }catch (Exception){
        }
    }
    if(urlData.query.sort){
        try{
            urlParsed.sort = JSON.parse(urlData.query.sort);
        }catch (Exception){
        }
    }

    return urlParsed;
}

module.exports = {

    getUserId: getUserId,

    resolveUrlFilterSort: resolveUrlFilterSort,

    buildMongoFilterQuery: buildMongoFilterQuery,

    buildMongoSortQuery: buildMongoSortQuery,

    getItemsList: function(req, res, collection, matchDefinedCallback, sortDefinedCallback){
        if(!req || !res || !collection){
            res.writeHead(500, {"Content-Type": "application/json"});
            res.end(JSON.stringify({
                success: false,
                error: "Internal query processor failure - not all parameters provided"
            }));
            return;
        }

        var urlParsed = this.resolveUrlFilterSort(req.url);

        var sort = this.buildMongoSortQuery(urlParsed);
        if(sortDefinedCallback){
            sort = sortDefinedCallback(sort);
        }

        var userId = undefined;

        getUserId(req, function (id) {
            userId = id;
            executeQuery();
        });

        function executeQuery(){

            var match = buildMongoFilterQuery(urlParsed, userId);
            if(matchDefinedCallback){
                match = matchDefinedCallback(match, userId);
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
                        "nameLower": {"$toLower": "$name"},
                        "lastUpdate": 1,
                        "isPrivate": 1,
                        "author._id": 1,
                        "author.username": 1,
                        "author.fullname": 1
                    }
                }, {
                    "$sort": sort
                }
            ];

            collection.aggregate(query).exec(function (error, data) {
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
        }
    }
};