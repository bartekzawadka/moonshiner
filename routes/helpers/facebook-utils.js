/**
 * Created by barte_000 on 2017-05-15.
 */
var path = require('path');
var config = require(path.join(__dirname, '..', '..', 'config', 'config.json'));
var FB = require('fb');
var requestHandler = require('request').defaults({encoding: null});

FB.options({
    appId: config.facebook.id,
    appSecret: config.facebook.secret
});

module.exports = {
    getProfilePicture: function(fbId, accessToken, callback){
        FB.api('/'+fbId+'/picture', {redirect: false, type: "large", "access_token": accessToken}, function(fbResponse){
            if(fbResponse && !fbResponse.error) {
                if(fbResponse.data.url){
                    requestHandler.get(fbResponse.data.url, function(rr, handlerResponse, body){
                        callback("data:" + handlerResponse.headers["content-type"] + ";base64," + new Buffer(body).toString('base64'));
                    });
                }else{
                    callback();
                }
            }else {
                callback();
            }
        });
    }
};