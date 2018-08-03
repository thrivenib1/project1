// Bring Mongoose into the project
var mongoose = require('mongoose'),
    mongoConfig = require('../config/mongoConfig'),
    logger = require('../services/loggerService').infoLog;
    warnLogger = require('../services/loggerService').warnLog;
    mongoHelper = require('../helpers/mongoHelper');

// Build the connection string
//var dbURI = 'mongodb://localhost/mongoosePM';

var LoopConn = function () {
};
LoopConn.dbConn;

// Create the database connection
mongoose.connect(mongoConfig.mongo_url,{useMongoClient: true});

// Catch the events
mongoose.connection.on('connected', function () {
    logger.info('Mongoose connected to ' + mongoConfig.mongo_url);
});

mongoose.connection.on('error', function (err) {
    logger.info('Mongoose connection error ' + err);
});

mongoose.connection.on('disconnected', function () {
    logger.info('Mongoose disconnected');
});

mongoose.mongo.MongoClient.connect(mongoConfig.mongo_url, function (err, conn) {
    if (err) {
        warnLogger.warn('Connection to  Mongodb using native driver - FAILURE');
    } else {
        LoopConn.dbConn = conn;
        logger.info('Connection to  Mongodb using native driver - SUCCESS');
    }
});

module.exports.LoopConn = LoopConn;
