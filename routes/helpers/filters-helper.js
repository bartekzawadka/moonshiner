/**
 * Created by barte_000 on 2017-02-11.
 */
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

module.exports.buildMongoFilterQuery = function (urlParts){

  if(!urlParts)
      return null;

  if(!urlParts.filter)
      return null;

  var urlParsed = {};
  if(urlParts.filter){
      urlParsed.filter = JSON.parse(urlParts.filter);
  }

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

  if(urlParsed.filter.privateOnly != undefined && urlParsed.filter.privateOnly !== 'undefined' && urlParsed.filter.privateOnly != null){
      match["$and"].push({"isPrivate": urlParsed.filter.privateOnly});
  }else{
      match["$and"].push({"isPrivate": false});
  }

  return match;
};

module.exports.buildMongoSortQuery = function(urlParts){
    if(!urlParts)
        return null;

    if(!urlParts.sort)
        return null;

    var urlParsed = {};
    if(urlParts.sort){
        urlParsed.sort = JSON.parse(urlParts.sort);
    }

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
};