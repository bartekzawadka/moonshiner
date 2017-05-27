/**
 * Created by barte_000 on 2017-05-28.
 */
var jwt = require('jsonwebtoken');
var path = require('path');
var config = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = {
  getToken: function(data){
      return jwt.sign(data, config.tokenSecret, {expiresIn: 60 * 60 * 5});
  }
};