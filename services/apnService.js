var apn = require('apn'),
    apnConfig = require('../config/apnConfig.js'),
    logger = require('../services/loggerService').infoLog,
    async = require('async');

var lapn = function () {
};

lapn.service = new apn.connection({
    gateway: apnConfig.apn_gateway,
    pfx: apnConfig.pfxpath
});

lapn.initfeedback = function () {
    lapn.feedback = new apn.feedback({
        address: apnConfig.apn_feedback,
        pfx: apnConfig.pfxpath
    });
};

lapn.init = function () {
};

lapn.service.on('connected', function () {
    logger.trace("APN Service - Connected to APN Service");
});

lapn.service.on('transmitted', function (notification, device) {
    logger.trace("APN Service - Notification transmitted to:" + device.token.toString('hex'));
});

lapn.service.on('transmissionError', function (errCode, notification, device) {

    logger.trace('Inside lapn.service.on transmissionerror success - ApnHelper.createApnFailuresDoc');
    logger.trace("APN Service - Notification caused error: " + errCode + " for device ", device, notification);
    if (errCode === 8) {
        logger.trace("APN Service - A error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox");
    }
});

lapn.service.on('timeout', function () {
    logger.trace("APN Service - Connection Timeout");
});

lapn.service.on('disconnected', function () {
    logger.trace("APN Service - Disconnected from APNS");
});

lapn.service.on('socketError', function (err) {
    logger.trace("APN Service - Socket Error " + err);
});

lapn.setupfeedback = function () {
    lapn.feedback.on('feedback', function (feedbackData) {
        async.forEach(feedbackData, function (feedback, cb) {
            var time = feedback.time;
            if (feedback.device === undefined) {
                return cb();
            }

            var device = feedback.device.toString('hex');

            logger.trace("Device: " + device + " has been unreachable, since: " + time);

        }, function (err) {
            if (err) {
                logger.trace('AP Feedback - Failure or partial success');
            } else {
                logger.trace('APN Feedback - Success');
            }
        });
    });

    lapn.feedback.on('feedbackError', function (err) {
        logger.trace("Feedback Service - Feedback Error " + err);
    });
};

lapn.notifyOneToOne = function (text, deviceId) {
    var note = new apn.notification();
    note.setAlertText(text);
    note.badge = 1;
    lapn.service.pushNotification(note, deviceId);
};

lapn.notifyOneToMany = function (text, deviceIds, badge, notetype, aid, pid) {
    /*
     var note = new apn.notification();
     note.setAlertText(text);
     note.badge = 1;
     lapn.service.pushNotification(note, deviceIds);
     */
    /*
     a user invites them to join an album
     a user adds a photo in an album they're member of
     a user comments on a photo in an album they're member of
     a new user joins an album they're member of
     *  */
    var note = new apn.notification();
    //note.setAlertText(text);
    note.badge = badge;
    note.alert = text;
    //note.sound = apnConfig.notification_sound;
    note.payload = {type: notetype, aid: aid, pid: pid};
    lapn.service.pushNotification(note, deviceIds);
};


module.exports = lapn;