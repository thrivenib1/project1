var Const = require('../utils/flashMessageStrings').CONST;
var flashMessage = require('../utils/flashMessageUtils');
var pgSqlService = require('../services/pgSqlService');
var pgSqlUtils = require('../utils/pgSqlUtils');
var logger = require('../services/loggerService').infoLog;
var errLog = require('../services/loggerService').errorLog;
var Query = require('../utils/queryConstants');
var sessionUtils = require('../utils/sessionUtils');
var ldapHelper = require('../helpers/ldapHelper');
var userModel = require('../schemas/user');
var notificationModel = require('../schemas/notification');
var session = require('../services/sessionService.js');
var redisConfig = require('../config/redisConfig.js');
var debugLog = require('../services/loggerService').debugLog;
var adminCtr = require('../controllers/adminController');
var async = require('async');

var userHelper = function () {
};


/**
 * if there is connection issue in ldap server then we authenticate user from Db
 * @param username - used from ldap login
 * @param password - login credentials used from ldap login
 * @param cb - callback
 */
userHelper.loginFromDb = function (username, password, deviceId, cb) {

    //the username and password is mandatory
    //if username has domain >> then do a substring and get only username
    logger.info("deviceId >>> " + deviceId);
    if (!username || !password) {
        cb(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT), null);
    }
    /*pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.USER_LOGIN, [username, password], function (err, foundUser) {
     if (err) {
     cb(err, null);
     } else if (foundUser.length) {*/
    sessionUtils.setUserSession(deviceId, username, function (err, userInfo) {
        if (err) {
            errLog.err("Error in userController-login-setUserSession >> " + err);
            cb(err, null);
        } else {
            userInfo[0].password = password;
            userHelper.getUserProfile(userInfo, function (err, profile) {
                if (err) {
                    errLog.err("Error in userHelper-login-getUserProfile >> " + err);
                    cb(err, null);
                } else {
                    cb(null, profile);
                }
            });
        }
    });
    /* } else {
     cb("User Not Found", null);
     }
     });*/
};

userHelper.checkValidLoginCredentials = function (username, psw) {

};

/**
 * Fetching the Department name
 * @param {number} buCode
 * @param cb
 */
userHelper.getDepartment = function (buCode, cb) {
    pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.GET_DEPARTMENT, [buCode], function (err, data) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, data);
        }
    });
};


/**
 * Fetching the Designation Description
 * @param {descode} desCode
 * @param cb
 */
userHelper.getDesignationAbr = function (desCode, cb) {
    pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.GET_DESIGNATION_FROM_ABBREVATION, [desCode], function (err, data) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, data);
        }
    });
};

/**
 * Checking Employee is Reporting Head or Not
 * @param {number} empCode
 * @param cb
 */
userHelper.isManager = function (empCode, cb) {
    pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.FETCH_EMP_UNDER_REPORTING_HEAD, [empCode], function (err, data) {
        if (err) {
            cb(err, null);
        } else {
            if (data.length) {
                cb(null, true);
            } else {
                cb(null, false);
            }
        }
    });
};

/**
 *
 * @param userInfo - this is req user from session so the same object is been updated in getUserProfile()
 * @param cb - callback
 */

userHelper.getUserProfile = function (userInfo, cb) {
    async.parallel([
        function (callback) {
            userHelper.isManager(userInfo[0].emp_code, function (err, result) {
                if (err) {
                    callback(err, null);
                } else {
                    if (result) {
                        userInfo[0].isManager = result;
                        callback(null, userInfo);
                    } else {
                        userInfo[0].isManager = false;
                        callback(null, userInfo);
                    }
                }
            })
        },
        function (callback) {//verify whether to allow petrol reimbursement or not
            //allow petrol reimbursement if the employee grade is >=50
            //and if the reimbursement slot is open
            adminCtr.ifUserEligibleForPetrolReim(userInfo[0].grade, function (err, eligible) {
                userInfo[0].allowPetrolReim = eligible;
                callback(null, userInfo);
            });
        },
        function (callback) {
            adminCtr.ifReimSlotOpen(function (err, slotOpened) {
                userInfo[0].allowMedicalReim = slotOpened;
                callback(null, userInfo);
            })
        },
        function (callback) {
            userHelper.getDepartment(userInfo[0].bu_code, function (err, result) {
                if (err) {
                    callback(err, null);
                } else {
                    if (result && result.length) {
                        userInfo[0].department = result[0].bu_desc;
                        callback(null, userInfo);
                    } else {
                        callback(null, userInfo);
                    }
                }
            })
        },
        function (callback) {
            //adding username and empCode to mongodb just to track the user
            userHelper.createLocalUser(userInfo[0].login.trim(), userInfo[0].emp_code_entered.trim(), function (err, result) {
                if (result) {
                    callback(null, userInfo);
                } else {
                    callback(null, userInfo);
                }
            })
        },
        function (callback) {
            userHelper.getDesignationAbr(userInfo[0].designation.trim(), function (e, result) {
                if (result && result.length) {
                    userInfo[0].designationAbr = result[0].desg_desc ? result[0].desg_desc : "";
                    callback(null, userInfo);
                } else {
                    callback(null, userInfo);
                }
            })
        }
    ], function (err, result) {
        if (err) {
            debugLog.debug("error found in getUserProfile >> " + err);
            cb(err, null);
        } else {
            cb(null, userInfo);
        }
    })
};


userHelper.createLocalUser = function (username, empCode, cb) {
    userHelper.checkIfUserExists(empCode, function (err, userExists) {
        if (userExists) {
            cb(null, true);
        } else {
            var UserModel = new userModel();
            UserModel.username = username;
            UserModel.empCode = empCode;
            UserModel.save(function (err, results) {
                cb(null, true);
            })
        }
    });
};


userHelper.checkIfUserExists = function (empCode, cb) {
    userModel.findOne({empCode: empCode}, function (err, userExist) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, userExist);
        }
    })
};

module.exports = userHelper;