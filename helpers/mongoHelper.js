var mongoose = require( 'mongoose');

mongoose.mongo.MongoClient.bulkInsert = function(data, collection, cb) {
    collection.insert(data, {w:1}, function(err, result) {
        if (err) {
            cb(err, null);
        }
        if (result) {
            cb(null, result);
        }
    });
};