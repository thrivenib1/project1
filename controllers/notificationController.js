var notificationModel = require('../schemas/notification');
var flashMessage = require('../utils/flashMessageUtils');
var Const = require('../utils/flashMessageStrings').CONST;
var userModel = require('../schemas/user');
var async = require('async');
var logger = require('../services/loggerService').infoLog;
var errLog = require('../services/loggerService').errorLog;

var notificationController = function () {
};


notificationController.sendNotificationForAllIntegrans = function (req, res) {

    var message = req.body.message;
    var img = req.body.img;
    var title = req.body.title;

    if (!message || !img || !title) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT));
    }

    var NotificationMsg = new notificationModel();
    NotificationMsg.message = message;
    NotificationMsg.system = true;
    NotificationMsg.img = img;
    NotificationMsg.title = title;

    NotificationMsg.save(function (err, result) {
        if (err) {
            logger.info("err in sendNotificationForAllIntegrans");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            notificationController.setUserNotification(result._id, function (err, result) {
                if (err) {
                    errLog.err("err in setUserNotification");
                    return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
                } else {
                    logger.info("success in sendNotificationForAllIntegrans");
                    return res.json(flashMessage.success(Const.SUCCESS, {Result: result, Token: req.user[0].token}));
                }
            })
        }
    })

};


notificationController.setUserNotification = function (notificationId, cb) {
    userModel.update({}, {
        $inc: {notificationCount: 1},
    }, {multi: true}, function (err, result) {
        if (err) {
            errLog.err("error in setUserNotification");
            cb(err, null);
        } else {
            logger.info("success in setUserNotification");
            cb(null, true);
        }
    })
};

notificationController.getNotificationList = function (req, res) {
    var user = req.user[0];
    var empCode = user.emp_code;

    //RSVP notifications
    notificationModel.find({to: empCode}, {}, function (err, rsvpNotificationList) {
        if (err) {
            errLog.err("error in getNotificationList");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in getNotificationList");
            notificationModel.find({system: true}, {}, function (err, notificationList) {
                var arr = rsvpNotificationList.concat(notificationList);
                var newList = arr.sort();
                var n = newList.reverse();
                return res.json(flashMessage.success(Const.SUCCESS, {
                    Result: n,
                    Token: req.user[0].token
                }));
            })
        }
    })
};

notificationController.getNotificationNumber = function (req, res) {
    var user = req.user[0];
    var empCode = user.emp_code;

    userModel.findOne({to: empCode}, {_id: 0, notificationCount: 1}, function (err, count) {
        if (err) {
            errLog.err("error in getNotificationNumber" + err);
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in getNotificationNumber");
            return res.json(flashMessage.success(Const.SUCCESS, {Result: count, Token: req.user[0].token}));
        }
    })
};

notificationController.markNotificationAsRead = function (req, res) {
    var user = req.user[0];
    var empCode = user.emp_code;
    userModel.update({to: empCode}, {$set: {notificationCount: 0}}, function (err, updated) {
        if (err) {
            errLog.err("error in markNotificationAsRead");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in markNotificationAsRead");
            return res.json(flashMessage.success(Const.SUCCESS, {Result: updated, Token: req.user[0].token}));
        }
    })
};


notificationController.createApproveNotification = function (empCode, message, cb) {
    notificationController.createAndIncNotificationInternal(empCode, message, function (err, result) {
        if (err) {
            logger.info("In App notification error for leave approval" + JSON.stringify(err));
            return cb(null, 'success');
        } else {
            logger.info("In App notification created for leave approval");
            return cb(null, 'success');
        }
    })

};


notificationController.createRequestLeaveNotification = function (from, to, title, img, empCode, message, cb) {
    notificationController.createAndIncNotificationInternal(from, to, title, img, empCode, message, function (err, result) {
        if (err) {
            logger.info("In App notification error for leave request" + JSON.stringify(err));
            return cb(null, 'success');
        } else {
            logger.info("In App notification created for leave request");
            return cb(null, 'success');
        }
    })
};


notificationController.createAndIncNotificationInternal = function (from, to, title, img, empCode, message, cb) {
    var NotificationMsg = new notificationModel();
    NotificationMsg.message = message;
    NotificationMsg.empCode = empCode;
    NotificationMsg.from = from;
    NotificationMsg.to = to;
    NotificationMsg.title = title;
    NotificationMsg.img = img;

    NotificationMsg.save(function (err, result) {
        if (err) {
            errLog.err("Err in createAndIncNotificationInternal" + JSON.stringify(err));
            return cb("Err in createAndIncNotificationInternal", null);
        } else {
            userModel.findOne({empCode: empCode}, function (err, userExist) {
                if (userExist) {
                    userModel.update({empCode: empCode}, {
                        $inc: {notificationCount: 1}
                    }, function (err, result) {
                        if (err) {
                            errLog.err("Error in incrementing notification count in createAndIncNotificationInternal" + JSON.stringify(err));
                            return cb("Err in incrementing Notification count", null);
                        } else {
                            logger.info("creating notification success");
                            return cb(null, result);
                        }
                    })
                } else {
                    var UserModel = new userModel();
                    UserModel.empCode = empCode;
                    UserModel.notificationCount = 1;
                    UserModel.save(function (err, results) {
                        cb(null, 'success');
                    })
                }
            });

        }
    })
};


module.exports = notificationController;
