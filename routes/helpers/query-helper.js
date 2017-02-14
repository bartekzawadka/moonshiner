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

    resolveUrlFilterSort: resolveUrlFilterSort,

    buildMongoFilterQuery: function (urlParsed, userId){

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

        if(urlParsed.filter.privateOnly == true && userId){
            match["$and"].push({"isPrivate": true});
            match["$and"].push({"author._id": {"$in": [mongoose.Types.ObjectId(userId)]}});
        } else if((urlParsed.filter.privateOnly == undefined || urlParsed.filter.privateOnly == null || urlParsed.filter.privateOnly == 'undefined') && userId){
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
    },

    buildMongoSortQuery: function(urlParsed){

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
};