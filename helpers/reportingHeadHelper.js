var sessionUtils = require('../utils/sessionUtils');
var logger = require('../services/loggerService').infoLog;
var errLog = require('../services/loggerService').errorLog;
var pgSqlUtils = require('../utils/pgSqlUtils');
var pgSqlService = require('../services/pgSqlService');
var leaveHelper = require('../helpers/leaveHelper');
var Query = require('../utils/queryConstants');

var reportingHeadHelper = function () {
};


//todo-1 : make sure there is only one unique token for one user(no different tokens for same user)
//todo-2 : this has to happen while token handshake
reportingHeadHelper.getManagerDeviceId = function (managerLoginId, cb) {
    //get manager deviceId from session
    //todo - make sure user has only one active session
    sessionUtils.checkSessionBasedOnLogInId(managerLoginId, function (err, searchKeys) {
        if (searchKeys) {
            sessionUtils.getRedisKey(searchKeys, function (err, result) {
                if (err) {
                    logger.info("err from getredis key"+JSON.stringify(err));
                    cb(err, null);
                } else {
                    logger.info("succes getredisgetkey");
                    //returns manager session
                    //DeviceId is used from manager session for push notifications
                    cb(null, result[0].deviceId);
                }
            })
        } else {
            logger.info("search key null");
            cb(null, []);
        }
    });
};

reportingHeadHelper.deductLeave = function (obj, reqNumber, empCode, cb) {

    var year = new Date().getFullYear();
    leaveHelper.fetchLeaveBalanceOfEmployee(empCode, year, function (err, result) {

        console.log("11111111");
        console.log(result);

        var totalPl = result[0].pl_max;
        var totalCl = result[0].cl_max;
        var usedPl = !result[0].p_leave ? 0 : result[0].p_leave;
        var usedCl = !result[0].c_leave ? 0 : result[0].c_leave;
        pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.GET_LEAVE_TYPE, [reqNumber], function (err, result) {
            if (err) {
                cb(err, null);
            } else {
                console.log("22222");
                console.log(result);
                var leaveType = result[0].leave_type;
                if (leaveType === 1) {
                    var noOfClToLeavesToDeduct = usedCl - obj[0].no_leaves;
                    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.DEDUCT_CL_LEAVE, [noOfClToLeavesToDeduct, empCode, new Date().getFullYear()], function (err, result) {
                        if (err) {
                            errLog.error("Error which deducting cl leave > " + err);
                            cb(err, null);
                        } else {
                            console.log("33333333");
                            console.log(result);
                            cb(null, result);
                        }
                    })
                } else if (leaveType === 4) { //deduct pl leave
                    var noOfPlToLeavesToDeduct = usedPl - obj[0].no_leaves;
                    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.DEDUCT_PL_LEAVE, [noOfPlToLeavesToDeduct, empCode, year], function (err, result) {
                        if (err) {
                            errLog.error("Error which deducting pl leave > " + err);
                            cb(err, null);
                        } else {
                            cb(null, result);
                        }
                    })
                } else {
                    cb(null, true);
                }
            }
        });
    });
};


reportingHeadHelper.getDeviceIdByReqNumber = function (reqNumber, cb) {
    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.GET_EMPID_BY_REQ_NO, [reqNumber], function (err, result) {
        if (err) {
            return cb(err, null);
        } else {
            if (result && result.length) {
                pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.GET_MANAGER_EMP_ID, [result[0].emp_code], function (err, result) {
                    reportingHeadHelper.getManagerDeviceId(result[0].emp_code_entered, function (err, deviceId) {
                        if (deviceId) {
                            return cb(null, deviceId);
                        } else {
                            return cb(null, null);
                        }
                    })
                })

            } else {
                return cb(null, null);
            }
        }
    })
};


reportingHeadHelper.getManagerEmpCode = function (login, cb) {
    logger.info("inside getManagerEmpCode For manager >>" + login);
    pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.GET_MANAGER_EMP_CODE, [login], function (err, result) {
        if (result && result[0].emp_code) {
            pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.GET_MANAGER_EMP_ID, [result[0].emp_code], function (err, result) {
                if (result && result[0].emp_code_entered) {
                    cb(null, result[0].emp_code_entered);
                } else {
                    cb(null, true);

                }
            });
        } else {
            cb(null, true);
        }

    })
};


module.exports = reportingHeadHelper;