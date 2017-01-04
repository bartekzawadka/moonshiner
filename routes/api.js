/**
 * Created by barte_000 on 2016-12-31.
 */
var express = require('express');
var router = express.Router();
var path = require('path');
var Liquid = require(path.join(__dirname, '..', 'models', 'liquid'));

router.post('/liquid', function(req, res){
    //console.log(JSON.stringify(req));
    var data = req.body;
    Liquid.create(data, function(error, result){
       if(error){
           res.writeHead(500, {"Content-Type": "application/json"});
           res.end(JSON.stringify({
               success: false,
               error: error
           }));
       }else{
           res.writeHead(200, {"Content-Type": "application/json"});
           res.end();
       }
    });
});

router.get('/liquids', function (req, res) {
   //Liquid.find({})

    Liquid.find({}).exec(function(error, data){
       if(error){
           res.writeHead(500, {"Content-Type": "application/json"});
           res.end(JSON.stringify({
               success: false,
               error: error
           }));
       }else{
           res.writeHead(200, {"Content-Type": "application/json"});
           res.end(JSON.stringify(data));
       }
    });
});

module.exports = router;