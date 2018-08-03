var nodegcm = require('node-gcm');
var gcmConfig = require('../config/gcmConfig');
var logger = require('../services/loggerService').infoLog;
var traceLog = require('../services/loggerService').traceLog;
var verboseLog = require('../services/loggerService').verbose;
//var apnService = require('../services/apnService');
//var apnConfig = require('../config/apnConfig');
var fcmController = function () {
};


fcmController.testGCMnotification = function (req, res) {

    var deviceId = req.body.deviceId;

    var sender = new nodegcm.Sender(gcmConfig.serverKey);

    var messageList = new nodegcm.Message({
        delayWhileIdle: true,
        //timeToLive: 3,
        data: {
            title: "Hello, World",
            //icon: "/home/monica/Downloads/whatsapp-512.ico",
            message: "This is a notification that will be displayed"
        }
    });

    if (deviceId) {
        sender.send(messageList, deviceId, 10, function (err, result) {
            if (err) {
                verboseLog.verbose('GCM ERROR --------------------------------------------------------------');
                verboseLog.verbose(JSON.stringify(err));
                verboseLog.verbose("==============================");
                res.send(err);
            } else {
                traceLog.trace('GCM SUCCESS ------------------------------------------------------------');
                verboseLog.verbose("==============================");
                res.send(result);
            }
        });
    } else {
        verboseLog.verbose("No device Id Found");
        verboseLog.verbose("==============================");
    }
};

fcmController.testIOSnotification = function (req, res) {

    apnService.notifyOneToOne("Testing",apnConfig.defaultDeviceId);
};


module.exports = fcmController;