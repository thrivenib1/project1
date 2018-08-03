var logger = require('../services/loggerService').infoLog;
var traceLog = require('../services/loggerService').traceLog;
var gcmConfig = require('../config/gcmConfig');
var gcmDispatchModel = require('../schemas/gcmDispatch');
var gcmFailureModel = require('../schemas/gcmFailures');
var nodegcm = require('node-gcm');
var verboseLog = require('../services/loggerService').verbose;

var gcm = function () {
};
gcm.sendGcmPush = function (job, cb) {
    //insert Google Server API Key here

    //message, deviceId, badge, aid, pid
    var sender = new nodegcm.Sender(gcmConfig.serverKey);

    var messageList = new nodegcm.Message({
        delayWhileIdle: true,
        data: {
            title: "'i'Manage",
            message: job.data.title
        }
    });
    var deviceId = job.data.taskData.deviceId;

    logger.info("===========Track GCM===============");
    logger.info("GCM deviceId >> " + deviceId);
    logger.info("GCM title >> " + job.data.title);
    logger.info("badge >> " + job.data.taskData.badge);



    if (deviceId) {
        sender.send(messageList, deviceId, 10, function (err, result) {
            if (err) {
                verboseLog.verbose('GCM ERROR --------------------------------------------------------------');
                verboseLog.verbose(JSON.stringify(err));
                verboseLog.verbose("==============================");
                gcm.createGcmFailureDoc(deviceId, err, messageList, function (err, result) {
                   return cb(null, 'success');
                })
            } else {
                traceLog.trace('GCM SUCCESS ------------------------------------------------------------');
                verboseLog.verbose("==============================");
                gcm.createGcmDispatchDoc(deviceId, result, messageList, function (err, result) {
                    return cb(null, 'success');
                })
            }

        });
    } else {
        verboseLog.verbose("No device Id Found");
        verboseLog.verbose("==============================");
        return cb(null, 'success');
    }
};



/**
 * @purpose         >> to track all gcm dispatches
 * @param deviceId  >> track of push notification deviceId
 * @param ctxData   >> ctxData data which is returned from push server
 * @param payload   >> track of request buffer
 * @param cb
 */
gcm.createGcmDispatchDoc = function (deviceId, ctxData, payload, cb) {

    var gcmDispatch = new gcmDispatchModel();
    gcmDispatch.deviceId = deviceId;
    gcmDispatch.ctxData = ctxData;
    gcmDispatch.payload = payload;
    gcmDispatch.save(function (err, done) {
        if (err) {
            traceLog.trace("gcm.createGcmFailureDoc :: failure ");
            return cb(null, 'Success');
        } else {
            traceLog.trace("gcm.createGcmFailureDoc :: success ");
            return cb(null, 'Success');
        }
    })
};

/**
 * @purpose         >> to track all gcm failures
 * @param deviceId  >> track of push notification deviceId
 * @param errMsg    >> ctxData data which is returned from push server
 * @param payload   >> track of request buffer
 * @param cb
 */
gcm.createGcmFailureDoc = function (deviceId, errMsg, payload, cb) {
    var gcmFailure = new gcmFailureModel();
    gcmFailure.deviceId = deviceId;
    gcmFailure.errMsg = errMsg;
    gcmFailure.payload = payload;
    gcmFailure.save(function (err, done) {
        if (err) {
            traceLog.trace("gcm.createGcmFailureDoc :: failure ");
            return cb(null, 'Success');
        } else {
            traceLog.trace("gcm.createGcmFailureDoc :: success ");
            return cb(null, 'Success');
        }
    })
};


module.exports = gcm;

