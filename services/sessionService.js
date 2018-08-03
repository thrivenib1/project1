var logger = require('../services/loggerService').infoLog;
var warnLog = require('../services/loggerService').warnLog;
var redis = require("redis");
var exec = require('child_process').exec;
var redisConfig = require("./../config/redisConfig");

var ls = function () {
};

//initialize redis connection
ls.initSessionMgr = function () {

    ls.mgr = redis.createClient(redisConfig.redis_session_port, redisConfig.redis_session_host, {});

    //ls.mgr.auth("int123$%^", function (err, r) {
    //    console.log("authenticating redis ..");
    //    if (err) {
    //        console.log("redis auth error > " + err);
    //        err.serverErr = "Redis authentication error";
    //        throw err;
    //    } else {
    //        console.log("redis success callback is ...");
    //        console.log(err);
    //        console.log(r);
    //        console.log("redis auth success");
    //    }
    //});

    ls.mgr.on("connect", function () {
        logger.info("-- Restarting Redis --");
        logger.info("redis for sessionMgr connected to " + redisConfig.redis_session_port);
    });

    ls.mgr.on("error", function (err) {
        //warnLog.warn("redis sessionMgr error " + err);
        exec('redis-server'); //if the redis is not started this makes redis starts before server start
        throw err;
    });

    ls.mgr.on("end", function (err) {
        warnLog.warn("redis sessionMgr end " + err);
    });
};


module.exports = ls;
