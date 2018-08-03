var logger = require('../services/loggerService').infoLog;
var errLog = require('../services/loggerService').errorLog;
var sessionUtils = require('../utils/sessionUtils');
var ldapHelper = require('../helpers/ldapHelper');
var flashMessage = require('../utils/flashMessageUtils');
var Const = require('../utils/flashMessageStrings').CONST;
var pgSqlUtils = require('../utils/pgSqlUtils');
var pgSqlHelper = require('../helpers/pgSqlHelper');
var pgSqlService = require('../services/pgSqlService');
var ldapConfig = require('../config/ldapConfig');
var userHelper = require('../helpers/userHelper');
var emailConfig = require('../config/emailConfig');
var transporter = require('../config/emailConfig').transporter;
var sendmail = require('../config/emailConfig').transporter;
var Query = require('../utils/queryConstants');
var profileHelper = require('../helpers/profileHelper');
var localStorage = require('localStorage');

var userController = function () {
};

/**
 *
 * @param req - username and password is mandatory
 * @param res - return status code along with success message
 * @returns {*|{get, configurable}|string|{get}}
 */

userController.login = function (req, res) {
    logger.info("logging ......");
    var username = req.body.username;
    var password = req.body.password;
    var deviceId = req.body.deviceId;

    logger.info("deviceId >>> " + deviceId);
    //the username and password is mandatory
    //if username has domain >> then do a substring and get only username

    if (!username || !password) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT));
    }

    username = username.split("@")[0];
    username = username.toLowerCase();

    ldapHelper.userAuthenticate(ldapConfig.ldapBind + username + ldapConfig.ldapDN, password, function (err, result) {
        if (err) {
            errLog.err("Error in userController-login-getUserProfile >> ");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Error: err}));
        } else {
            sessionUtils.setUserSession(deviceId, username, function (err, userInfo) {
                if (err) {
                    errLog.err("Error in userController-login-setUserSession >> " + err);
                    return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Error: err}));
                } else {
                    userHelper.getUserProfile(userInfo, function (err, profile) {
                        if (err) {
                            errLog.err("Error in userController-login-getUserProfile >> " + JSON.stringify(err));
                            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Error: err}));
                        } else {
                            sessionUtils.setRedisKey(profile[0].token, profile, function (err, userFromRedis) {
                                profileHelper.getEmpProfileDetails(profile[0].emp_code, function (err, details) {
                                    if (err) {
                                        return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Error: err}));
                                    } else {
                                        profileHelper.getManagerProfileDetails(profile[0].reportsto, function (err, managerDet) {
                                            if (err) {
                                                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Error: err}));
                                            } else {
                                                return res.json(flashMessage.success(Const.SUCCESS, {
                                                    Result: profile,
                                                    Profile: details.profile,
                                                    DOB: details.dob,
                                                    ManagerProfile: managerDet
                                                }));
                                            }
                                        })

                                    }
                                })
                            });
                        }
                    });
                }
            });
        }
    });
};

/**
 * @param req
 * @param res
 * remove user session from redis
 */

userController.logOut = function (req, res) {
    console.log("req.headers['authorization']req.headers['authorization']");
    console.log(req.headers['authorization']);
    sessionUtils.deleteRedisKey(req.headers['authorization'], function (err, sessionDeleted) {
        return res.json(flashMessage.success(Const.SUCCESS));
    })
};


userController.testMail = function (req, res) {

    var emailId = req.body.emailId;

    var mail = {
        from: emailId,
        to: emailId,//emailObj.defaultHrEmail
        cc: emailId,
        subject: "TEST FROM REMOTE",
        attachment: [
            {
                data: emailConfig.cancelTemplate.template,
                alternative: true
            }
        ]
    };
    sendmail.send(mail, function (err, message) {
        if (err) {
            console.log(err);
            return res.json(flashMessage.error(Const.ERROR));
        } else {
            console.log(message);
            return res.json(flashMessage.success(Const.SUCCESS));
        }
    });
};

userController.getEmpNameByEmpCode = function (req, res) {
    var empcode = req.params.empcode;
    pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.GET_EMP_CODE_BY_EMP_ID, [empcode], function (err, user) {
        if (err) {
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: user,
                Token: req.user[0].token
            }));
        }
    })
};

userController.getEmpContactDetails = function (req, res) {
    console.log("inside userController.getEmpContactDetails");
    pgSqlUtils.executeQuery(pgSqlService.offproTestClient, Query.GET_EMP_CONTACT_DETAILS,[], function (err, empDet) {
        if (err) {
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: empDet,
                Token: req.user[0].token
            }));
        }
    })
};

module.exports = userController;