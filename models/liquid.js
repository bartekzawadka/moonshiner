/**
 * Created by barte_000 on 2016-12-31.
 */
var mongoose = require('mongoose');
var path = require('path');
var config = require(path.join(__dirname, '..', 'config', 'config.json'));

var liquidSchema = mongoose.Schema({
    name: {type: String, required: true},
    base: {
        manufacturer: {type: String, required: false},
        concentration: {type: Number, required: false},
        pg_vg: {type: Number, required: false},
        amount: {type: Number, required: false}
    },
    aromas: [
        {
            name: {type: String},
            concentration: {type: Number}
        }
    ],
    accessories: [
        {
            name: {type: String},
            concentration: {type: Number}
        }
    ],
    pg_vg: {type: Number, required: true},
    rating: {type: Number, required: true},
    description: {type: String},
    comments: [
        {
            author: {type: String},
            comment: {type: String},
            rating: {type: Number}
        }
    ]
});

var Liquid = mongoose.model('Liquid', liquidSchema);
module.exports = Liquid;