var flashMessage = require('../utils/flashMessageUtils');
var Const = require('../utils/flashMessageStrings').CONST;
var pgSqlHelper = require('../helpers/pgSqlHelper');
var pgSqlService = require('../services/pgSqlService');
var pgSqlUtils = require('../utils/pgSqlUtils');
var leaveHelper = require('../helpers/leaveHelper');
var leaveType = require('../utils/constants').leaveTypes;
var Query = require('../utils/queryConstants');
var logger = require('../services/loggerService').infoLog;
var errLog = require('../services/loggerService').errorLog;
var kueUtils = require('../utils/kueUtils');
var emailConfig = require('../config/emailConfig');
var emailHelper = require('../helpers/emailHelper');
var kueConfig = require('../config/kueConfig');
var gcmConst = require('../utils/gcmMessageStrings').gcmConst;
var gcmMsgString = require('../utils/gcmMessageStrings').gcmMsgString;
var reportingHeadHelper = require('../helpers/reportingHeadHelper');
var notificationCtr = require('../controllers/notificationController');
var TASK = require('../utils/taskType').TASK;
var config = require('../config/config');
var leaveTitle = require('../utils/constants').leaveTitle;
var nodeutil = require('util');
var async = require('async');

var leaveController = function () {
};

/**
 *
 * first get request number from inc_reqno and inc the value and update the same collection
 * the leave request data has to be inserted in both leave_details and leave_result table
 * write mail service - used for sending request mail to HR,Reporting Manager and employee
 * @param req
 * @param res
 */

leaveController.requestLeave = function (req, res) {
    //validate all the mandatory fields from the request
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var leaveType = req.body.leaveType;
    var reason = req.body.reason;
    var address = req.body.address;
    var phone = req.body.phone;
    var emp_code = req.user[0].emp_code; //getting from session
    var empId = req.user[0].emp_code_entered; //getting from session
    var reportsTo = req.user[0].reportsto;
    var compStartDate = req.body.compStartDate;
    var compEndDate = req.body.compEndDate;
    var userDeviceId = req.user[0].deviceId;

    var from = req.user[0].emp_code;
    var to = req.user[0].reportsto;
    var title = leaveTitle["Request_Leave"];

    // Calculating Number of leaves applied by user
    // By subtracting start date from end date , Dividing by one day(24*60*60*1000) and adding '1' to result
    // adding 1 >> is required when start and end date is same and for different start and end date calculates the current date as well
    // for ex: start date(1/2/17 and endDate is 2/2/17) the difference is 1 day
    // var noOfLeaves = ((new Date(endDate) - new Date(startDate)) / (24 * 60 * 60 * 1000)) + 1;
    var noOfLeaves = req.body.noOfLeaves;
    var values;
    var query;
    var clientIsAndroid = req.user[0].clientIsAndroid;
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    var in_integra = req.body.in_integra;

    var reqDate = year + "-" + month + "-" + day;

    if (!startDate || !endDate || !leaveType || !reason || !address || !phone || !noOfLeaves) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }
    logger.info("noOfLeaves " + noOfLeaves);
    logger.info("======= startDate >> " + startDate);
    logger.info("======= endDate >> " + endDate);

    leaveHelper.validateRequestLeaveDates("", leaveType, startDate, endDate, emp_code, compStartDate, function (err, result) {
        //if the leave already applied for the same startDate and endDate then sending warning msg
        logger.info("======= Is leave already exists >> " + result);
        if (result) {
            return res.json(flashMessage.error(Const.ERR_OVERLAPPING_DATES, {Token: req.user[0].token}));
        } else {//else proceed to apply
            leaveHelper.checkIfUserEligibleToTakeLeave(noOfLeaves, leaveType, emp_code, function (err, results) {
                if (err) {
                    return res.json(flashMessage.error(Const.USER_NOT_ELIGIBLE_FOR_LEAVE, {Token: req.user[0].token}));
                } else {
                    pgSqlHelper.getRequestNumber(function (err, reqNumber) {
                        //if the leave type is compensatory add compensatoryStartDate and  compensatoryEndDate
                        if (leaveType == 3) {
                            if (!compStartDate || !compEndDate || !in_integra) {
                                return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
                            }
                            endDate = compEndDate;
                            query = Query.INSERT_INTO_LEAVE_RESULT_FOR_LEAVETYPE_3;
                            values = [reqNumber, startDate, endDate, address, compStartDate, compEndDate, phone, noOfLeaves, 'f', 'f', 'f'];
                        } else {
                            values = [reqNumber, startDate, endDate, address, phone, noOfLeaves, 'f', 'f', 'f'];
                            query = Query.INSERT_INTO_LEAVE_RESULT;
                        }

                        pgSqlHelper.incRequestNumber(reqNumber, function (err, number) {
                            if (err) {
                                errLog.err("Error in leaveController-incRequestNumber >> " + err);
                                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                                    Error: err,
                                    Token: req.user[0].token
                                }));
                            } else {
                                pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.INSERT_INTO_LEAVE_DETAILS, [reqNumber, emp_code, reqDate, reason, leaveType, reportsTo], function (err, result) {
                                    if (err) {
                                        errLog.err("Error in leaveController-requestLeave-leaveDetails >> " + err);
                                        return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                                            Error: err,
                                            Token: req.user[0].token
                                        }));
                                    } else {
                                        pgSqlUtils.executeQuery(pgSqlService.leaveClient, query, values, function (err, result) {
                                            if (err) {
                                                errLog.err("Error in leaveController-requestLeave-leaveResult >> " + err);
                                                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                                                    Error: err,
                                                    Token: req.user[0].token
                                                }));
                                            } else {
                                                logger.info("empIdempIdempId >> " + empId);
                                                logger.info("req.user[0].emp_code_entered >> " + req.user[0].emp_code_entered);
                                                //emp_code, reqNumber, in_integra,reqUserEmpName,startDate, endDate,reqUserApprovedName,reason,reqUserLogin,reqUserapprovedByLoginName,noOfLeaves
                                                kueUtils.createTask(TASK.postLeaveRequest, "", 'postLeaveRequest', 'postLeaveRequest', 'postLeaveRequest', "", "", {
                                                    empId: empId,
                                                    clientIsAndroid: clientIsAndroid,
                                                    emp_code: emp_code,
                                                    reqNumber: reqNumber,
                                                    in_integra: in_integra,
                                                    reqUserEmpName: req.user[0].emp_name,
                                                    startDate: startDate,
                                                    endDate: endDate,
                                                    reqUserApprovedName: req.user[0].approvedByName,
                                                    reason: reason,
                                                    reqUserLogin: req.user[0].login,
                                                    reqUserapprovedByLoginName: req.user[0].approvedByLoginName,
                                                    noOfLeave: noOfLeaves,
                                                    leaveType: leaveType,
                                                    compStartDate: compStartDate,
                                                    compEndDate: compEndDate,
                                                    from: from,
                                                    to: to,
                                                    title: title
                                                }, function (err, result) {
                                                    return res.json(flashMessage.success(Const.SUCCESS, {
                                                        Result: result,
                                                        Token: req.user[0].token
                                                    }));
                                                })
                                            }
                                        })
                                    }
                                });
                            }
                        });
                    });
                }
            });
        }
    });
};


leaveController.postLeaveRequest = function (job, cb) {
    var clientIsAndroid = job.data.taskData.clientIsAndroid,
        emp_code = job.data.taskData.emp_code,
        reqNumber = job.data.taskData.reqNumber,
        in_integra = job.data.taskData.in_integra,
        reqUserEmpName = job.data.taskData.reqUserEmpName,
        startDate = job.data.taskData.startDate,
        endDate = job.data.taskData.endDate,
        reqUserApprovedName = job.data.taskData.reqUserApprovedName,
        reason = job.data.taskData.reason,
        reqUserLogin = job.data.taskData.reqUserLogin,
        reqUserapprovedByLoginName = job.data.taskData.reqUserapprovedByLoginName,
        noOfLeaves = job.data.taskData.noOfLeaves,
        empId = job.data.taskData.empId,
        leaveType = job.data.taskData.leaveType,
        compEndDate = job.data.taskData.compEndDate,
        compStartDate = job.data.taskData.compStartDate,

    //used for notification
        from = job.data.taskData.from,
        to = job.data.taskData.to,
        title = job.data.taskData.title;

    var inAppNotificationMsg;

    //once the data is inserted to leave_details and leave_result table, update the req number
    //incRequestNumber has no callback because we are not dependent on the return value
    leaveHelper.addLeaveToMongo(emp_code, reqNumber, in_integra, function (err, addedInMongo) {
        if (err) {
            errLog.err("Error in leaveController-addLeaveToMongo >> " + JSON.stringify(err));
            return cb(null, 'success');
        }
        else {
            if (leaveType == 3) {
                startDate = compStartDate;
                endDate = compEndDate;
            }

            var userEmailTemplate = emailHelper.createEmailTemplate(emailConfig.requestTemplate, reqUserEmpName, startDate, endDate, reqUserApprovedName, reqNumber, reason);
            var managerEmailTemplate = emailHelper.createManagerEmailTemplate(clientIsAndroid, emailConfig.requestTemplate, reqUserEmpName, startDate, endDate, reqNumber, reason);

            var empEmail = config.isLocal ? emailConfig.testMail : "" + reqUserLogin.trim() + emailConfig.ssplDomain + "," + reqUserLogin.trim() + emailConfig.splDomain + "";
            var managerEmail = config.isLocal ? emailConfig.testMail : "" + reqUserapprovedByLoginName.trim() + emailConfig.ssplDomain + "," + reqUserapprovedByLoginName.trim() + emailConfig.splDomain + "";

            reportingHeadHelper.getManagerEmpCode(reqUserapprovedByLoginName.trim(), function (err, managerEmpCode) {
                if (startDate == endDate) {
                    inAppNotificationMsg = nodeutil.format(emailConfig.requestTitleInAppForOneDay, reqUserEmpName.trim(), startDate);
                } else {
                    inAppNotificationMsg = nodeutil.format(emailConfig.requestTitleInApp, reqUserEmpName.trim(), startDate, endDate);
                }

                notificationCtr.createRequestLeaveNotification(from, to, title, "", managerEmpCode, inAppNotificationMsg, function (err, r) {
                    reportingHeadHelper.getManagerDeviceId(managerEmpCode, function (err, managerDeviceId) {
                        kueUtils.createTask(TASK.emailService, managerEmailTemplate, emailConfig.requestTemplate.templateNumber, kueConfig.emailService, nodeutil.format(emailConfig.requestSubject, reqUserEmpName.trim(), empId.trim()), empEmail, managerEmail, userEmailTemplate, function (err, emailSent) {
                            if (err) {
                                logger.info("Error in leavecontroller-requestleave-sendmail >> " + err);
                                return cb(null, 'success');
                            } else {
                                if (noOfLeaves == 1 || leaveType == 3) { //if the number of leaves is one then the notification message changed
                                    kueUtils.createTask(TASK.gcmPushService, "", emailConfig.requestTemplate.templateNumber, kueConfig.gcmPushService, nodeutil.format(gcmMsgString[gcmConst.REQUEST_LEAVE_FOR_ONE_DAY], reqUserEmpName.trim(), startDate), "", "", {
                                        deviceId: managerDeviceId,
                                        badge: 1,
                                        aid: "",
                                        pid: ""
                                    }, function (err, emailSent) {
                                        logger.info("success postLeaveRequest");
                                        return cb(null, 'success');
                                    });
                                } else {
                                    kueUtils.createTask(TASK.gcmPushService, "", emailConfig.requestTemplate.templateNumber, kueConfig.gcmPushService, nodeutil.format(gcmMsgString[gcmConst.REQUEST_LEAVE_FOR_MULTIPLE_DAYS], reqUserEmpName.trim(), startDate, endDate), "", "", {
                                        deviceId: managerDeviceId,
                                        badge: 1,
                                        aid: "",
                                        pid: ""
                                    }, function (err, emailSent) {
                                        logger.info("success postLeaveRequest");
                                        return cb(null, 'success');
                                    });
                                }
                            }
                        });
                    });
                });
            });
        }
    });
};


/**
 * Fetch leave history of a Employee by empCode and year
 *
 * @param {object} req
 * @param {object} res
 * @return {object}
 */
leaveController.getLeaveHistory = function (req, res) {


    var empCode = req.user[0].emp_code;
    var year = req.body.year | new Date().getFullYear();
    var approvedByName = req.user[0].approvedByName;


    leaveHelper.fetchLeaveHistory(empCode, year, function (err, results) {
        if (err) {
            errLog.err("Error in leaveController-getLeaveHistory >> " + err);
            return res.json(flashMessage.error(Const.ERR_IN_GETTING_LEAVE_HISTORY, {
                Error: err,
                Token: req.user[0].token
            }));
        } else {
            var arr = [];
            var itemsProcessed = 0;
            if (results && results.length) {
                async.forEachSeries(results, function (result, callback) {
                    leaveHelper.getLeaveFromMongo(result.req_no, result.emp_code, function (err, leaveFromMongo) {
                        result.status = result.appr ? 'approved' : result.cancel ? 'cancel' : result.rej ? 'rejected' : 'Pending';
                        result.leaveTypeName = leaveType[result.leave_type];
                        result.approvedByName = approvedByName;
                        result.in_integra = leaveFromMongo ? leaveFromMongo.in_integra : "";
                        arr.push(result);
                        itemsProcessed++;
                        callback();
                        if (itemsProcessed === results.length) {
                            return res.json(flashMessage.success(Const.SUCCESS, {
                                Result: arr,
                                Token: req.user[0].token
                            }));
                        }
                    });
                });
            } else {
                return res.json(flashMessage.success(Const.INFO_NO_RESULTS_FOUND, {Token: req.user[0].token}));
            }
        }
    });
};


leaveController.getIndividualLeaveHistory = function (req, res) {


    var empCode = req.params.empcode;

    var year = req.body.year | new Date().getFullYear();
    var approvedByName = req.user[0].emp_name;


    leaveHelper.fetchLeaveHistory(empCode, year, function (err, results) {
        if (err) {
            errLog.err("Error in leaveController-getLeaveHistory >> " + err);
            return res.json(flashMessage.error(Const.ERR_IN_GETTING_LEAVE_HISTORY, {
                Error: err,
                Token: req.user[0].token
            }));
        } else {
            var arr = [];
            var itemsProcessed = 0;
            if (results && results.length) {
                async.forEach(results, function (result) {
                    leaveHelper.getLeaveFromMongo(result.req_no, result.emp_code, function (err, leaveFromMongo) {
                        pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.GET_EMP_CODE_BY_EMP_ID, [result.approved_by], function (err, mgr) {
                            result.status = result.appr ? 'approved' : result.cancel ? 'cancel' : result.rej ? 'rejected' : 'Pending';
                            result.leaveTypeName = leaveType[result.leave_type];
                            result.approvedByName = mgr[0].emp_name;
                            result.in_integra = leaveFromMongo ? leaveFromMongo.in_integra : "";
                            arr.push(result);
                            itemsProcessed++;
                            if (itemsProcessed === results.length) {
                                return res.json(flashMessage.success(Const.SUCCESS, {
                                    Result: arr,
                                    Token: req.user[0].token
                                }));
                            }
                        });
                    });
                });
            } else {
                return res.json(flashMessage.success(Const.INFO_NO_RESULTS_FOUND, {Token: req.user[0].token}));
            }
        }
    });
};

/**
 * Fetch the holiday list of the year
 * @param {object} req
 * @param {object} res
 * @return {object} result
 */
leaveController.getHolidayList = function (req, res) {
    var year = req.params.year;
    leaveHelper.fetchHolidayList(year, function (err, result) {
        if (err) {
            errLog.err("Error in leaveController-getHolidayList >> " + err);
            return res.json(flashMessage.error(Const.ERR_IN_GETTING_HOLIDAY_LIST, {
                Error: err,
                Token: req.user[0].token
            }));
        } else {
            return res.json(flashMessage.success(Const.SUCCESS, {Result: result, Token: req.user[0].token}));
        }
    });
};

/**
 * Get Leave Balance of Employee
 * @param {object} req
 * @param {object} res
 * @return {object}
 */
leaveController.getLeaveBalanceOfEmployee = function (req, res) {
    var empCode = req.user[0].emp_code;
    var empID = req.user[0].empId;
    var year = "";

    if (req.body.year) {
        year = req.body.year;
    } else {
        year = new Date().getFullYear();
    }

    leaveHelper.fetchLeaveBalanceOfEmployee(empCode, year, function (err, result) {
        if (err) {
            errLog.err("Error in leaveController-getLeaveBalanceOfEmployee >> " + err);
            return res.json(flashMessage.error(Const.ERR_IN_GETTING_HOLIDAY_LIST, {
                Error: err,
                Token: req.user[0].token
            }));
        } else {
            if (result.length) {
                var leaveBalance = {};
                leaveHelper.getAvailableLeave(empCode, year, function (err, availableLeave) {
                    if (err) {
                        return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                            Error: err,
                            Token: req.user[0].token
                        }));
                    } else {
                        leaveBalance.clPlanned = availableLeave.clApplied;
                        leaveBalance.plPlanned = availableLeave.plApplied;
                        leaveBalance.clUsed = availableLeave.clUsed;
                        leaveBalance.plUsed = availableLeave.plUsed;//Math.abs(2+(-2))
                        leaveBalance.clLeft = result[0].cl_max + result[0].c_leave;
                        leaveBalance.plLeft = result[0].pl_max + result[0].p_leave;

                        return res.json(flashMessage.success(Const.SUCCESS, {
                            Result: leaveBalance,
                            Token: req.user[0].token
                        }));
                    }
                });
            } else {
                return res.json(flashMessage.success(Const.INFO_NO_RESULTS_FOUND, {Token: req.user[0].token}));
            }
        }
    });
};

/**
 * Fetch the Recent Leave History of Employee
 * @param {object} req
 * @param {object} res
 * @return {object} result
 */
leaveController.getRecentLeaveHistory = function (req, res) {
    var empCode = req.user[0].emp_code;
    var approvedByName = req.user[0].approvedByName;
    leaveHelper.fetchRecentLeaveHistory(empCode, function (err, results) {
        if (err) {
            errLog.err("Error in leaveController-getRecentLeaveHistory >> " + err);
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                Error: err,
                Token: req.user[0].token
            }));
        } else {
            if (results && results.length) {
                var arr = [];
                var itemsProcessed = 0;
                async.forEach(results, function (result) {
                    result.status = result.appr ? 'approved' : result.cancel ? 'cancel' : result.rej ? 'rejected' : 'Pending';
                    result.leaveTypeName = leaveType[result.leave_type];
                    result.approvedByName = approvedByName;
                    arr.push(result);
                    itemsProcessed++;
                    if (itemsProcessed === results.length) {
                        return res.json(flashMessage.success(Const.SUCCESS, {Result: arr, Token: req.user[0].token}));
                    }
                });
            } else {
                return res.json(flashMessage.success(Const.INFO_NO_RESULTS_FOUND), {Token: req.user[0].token});
            }
        }
    });
};
/**
 * Fetching the leave history between the selected dates
 * @param {object} req
 * @param {object} res
 * @return {object} result
 */
leaveController.getLeaveHistoryBetweenDates = function (req, res) {
    var empCode = req.user[0].emp_code;
    var approvedByName = req.user[0].approvedByName;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    leaveHelper.fetchLeaveHistoryBetweenDates(empCode, startDate, endDate, function (err, results) {
        if (err) {
            errLog.err("Error in leaveController-getLeaveHistoryBetweenDates >> " + err);
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                Error: err,
                Token: req.user[0].token
            }));
        } else {
            if (results && results.length) {
                var arr = [];
                var itemsProcessed = 0;
                async.forEach(results, function (result) {
                    result.status = result.appr ? 'approved' : result.cancel ? 'cancel' : result.rej ? 'rejected' : 'Pending';
                    result.leaveTypeName = leaveType[result.leave_type];
                    result.approvedByName = approvedByName;
                    arr.push(result);
                    itemsProcessed++;
                    if (itemsProcessed === results.length) {
                        return res.json(flashMessage.success(Const.SUCCESS, {Result: arr, Token: req.user[0].token}));
                    }
                });
            } else {
                return res.json(flashMessage.success(Const.INFO_NO_RESULTS_FOUND, {Token: req.user[0].token}));
            }
        }
    });
};
/**
 *
 * @param req
 * @param res
 */
leaveController.cancelLeave = function (req, res) {
    var reqNumber = req.body.reqNum;
    var deviceId = req.user[0].deviceId;
    var reason = "";

    var from = req.user[0].emp_code;
    var to = req.user[0].reportsto;
    var title = leaveTitle["Cancel_Leave"];


    leaveHelper.cancelLeave(reqNumber, function (err) {
        if (err) {
            errLog.err("Error in leaveController-cancelLeave >> " + err);
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                Error: err,
                Token: req.user[0].token
            }));
        } else {
            pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.FETCH_LEAVE_START_AND_END_DATE, [reqNumber], function (err, result) {
                if (err) {
                    errLog.err("Error in cancelleave-rejectLeave-dates >> " + err);
                    return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
                } else {
                    var comensatoryLeave = result[0].comp_start_date ? true : false;
                    kueUtils.createTask(TASK.postLeaveRequestCancel, "", 'postLeaveRequestCancel', 'postLeaveRequestCancel', 'postLeaveRequestCancel', "", "", {
                        leaveDetailsEmpcode: result[0].emp_code,
                        res_leave_start_date: result[0].leave_start_date,
                        res_leave_end_date: result[0].leave_end_date,
                        reqUserEmpName: req.user[0].emp_name,
                        reqNumber: reqNumber,
                        comments: reason,
                        reqUserApprovedLoginName: req.user[0].approvedByLoginName,
                        reqUserLogin: req.user[0].login,
                        empId: req.user[0].empId,
                        comensatoryLeave: comensatoryLeave,
                        from: from,
                        to: to,
                        title: title
                    }, function (err, r) {
                        logger.info("final success reject");
                        return res.json(flashMessage.success(Const.SUCCESS, {
                            Result: "Canceled Successfully",
                            Token: req.user[0].token
                        }));
                    })
                }
            });
        }
    });
};


leaveController.postLeaveRequestCancel = function (job, cb) {

    var reqUserEmpName = job.data.taskData.reqUserEmpName;
    var res_leave_start_date = job.data.taskData.res_leave_start_date;
    var res_leave_end_date = job.data.taskData.res_leave_end_date;
    var reqNumber = job.data.taskData.reqNumber;
    var reason = job.data.taskData.comments;
    var reqUserLogin = job.data.taskData.reqUserLogin;
    var reqUserApprovedLoginName = job.data.taskData.reqUserApprovedLoginName;
    var empId = job.data.taskData.empId;
    var comensatoryLeave = job.data.taskData.comensatoryLeave;
    var inAppNotificationMsg;

    //used for notification
    var from = job.data.taskData.from;
    var to = job.data.taskData.to;
    var title = job.data.taskData.title;

    var sDate = new Date(res_leave_start_date);
    var sMonth = sDate.getMonth() + 1;
    sMonth = sMonth.toString().length == 1 ? '0' + sMonth : sMonth;
    sDate = sDate.getFullYear() + '-' + sMonth + '-' + sDate.getDate();

    var eDate = new Date(res_leave_end_date);
    var eMonth = eDate.getMonth() + 1;
    eMonth = eMonth.toString().length == 1 ? '0' + eMonth : eMonth;
    eDate = eDate.getFullYear() + '-' + eMonth + '-' + eDate.getDate();

    if (comensatoryLeave) {
        sDate = eDate;
    }

    if (sDate == eDate) {
        inAppNotificationMsg = nodeutil.format(emailConfig.cancelTitleInAppForOneDay, sDate, reqUserEmpName.trim());
    } else {
        inAppNotificationMsg = nodeutil.format(emailConfig.cancelTitleInApp, sDate, eDate, reqUserEmpName.trim());
    }

    var userEmailTemplate = emailHelper.createEmailTemplate(emailConfig.cancelTemplate, reqUserEmpName, sDate, eDate, "", reqNumber, reason);
    var empEmail = config.isLocal ? emailConfig.testMail : "" + reqUserLogin.trim() + emailConfig.ssplDomain + "," + reqUserLogin.trim() + emailConfig.splDomain + "";
    var managerEmail = config.isLocal ? emailConfig.testMail : "" + reqUserApprovedLoginName.trim() + emailConfig.ssplDomain + "," + reqUserApprovedLoginName.trim() + emailConfig.splDomain + "";

    kueUtils.createTask(TASK.emailService, "", emailConfig.cancelTemplate.templateNumber, kueConfig.emailService, nodeutil.format(emailConfig.cancelSubject, reqUserEmpName.trim(), empId.trim()), empEmail, managerEmail, userEmailTemplate, function (err, emailSent) {
        if (err) {
            logger.info("Error in leavecontroller-requestleave-sendmail >> " + err);
            return cb(null, 'success');
        } else {
            logger.info("reqUserApprovedLoginNamereqUserApprovedLoginNamereqUserApprovedLoginName >>" + reqUserApprovedLoginName);
            reportingHeadHelper.getManagerEmpCode(reqUserApprovedLoginName.trim(), function (err, managerEmpCode) {
                notificationCtr.createRequestLeaveNotification(from, to, title, "", managerEmpCode, inAppNotificationMsg, function (err, r) {
                    reportingHeadHelper.getManagerDeviceId(managerEmpCode.trim(), function (err, managerDeviceId) {
                        kueUtils.createTask(TASK.gcmPushService, "", emailConfig.cancelTemplate.templateNumber, kueConfig.gcmPushService, nodeutil.format(gcmMsgString[gcmConst.CANCELED_LEAVE], reqUserEmpName.trim()), "", "", {
                            deviceId: managerDeviceId,
                            badge: 1,
                            aid: "",
                            pid: ""
                        }, function (err, emailSent) {
                            return cb(null, 'success');
                        })
                    })
                })
            })
        }
    });
};
/**
 *
 * @param {object} req
 * @param {object} res
 * @return {object} result
 */
leaveController.updateLeaveRequest = function (req, res) {
    var reqNumber = req.body.reqNum;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var leaveType = req.body.leaveType;
    var reason = req.body.reason;
    var address = req.body.address;
    var phone = req.body.phone;
    var compStartDate = req.body.compStartDate;
    var compEndDate = req.body.compEndDate;
    var modifiedDate = new Date();
    var in_integra = req.body.in_integra;
    var emp_code = req.user[0].emp_code;
    var noOfLeaves = req.body.noOfLeaves;
    var values;
    var query;

    logger.info("noOfLeaves " + noOfLeaves);

    if (!startDate || !endDate || !leaveType || !reason || !address || !phone || !noOfLeaves || !reqNumber) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }

    if (leaveType == 3) {
        if (!compStartDate || !compEndDate || !in_integra) {
            return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT));
        }
        endDate = compEndDate;
        query = Query.UPDATE_LEAVE_RESULT_FOR_LEAVETYPE_3;
        values = [reqNumber, startDate, endDate, address, compStartDate, compEndDate, phone, noOfLeaves];
    } else {
        values = [reqNumber, startDate, endDate, address, phone, noOfLeaves];
        query = Query.UPDATE_LEAVE_RESULT;
    }

    leaveHelper.validateRequestLeaveDates(reqNumber, leaveType, startDate, endDate, emp_code, compStartDate, function (err, result) {
        //if the leave already applied for the same startDate and endDate then sending warning msg
        logger.info("======= Is leave already exists >> " + result);
        if (result) {
            return res.json(flashMessage.error(Const.ERR_OVERLAPPING_DATES, {Token: req.user[0].token}));
        } else {//else proceed to apply
            leaveHelper.checkIfUserEligibleToTakeLeave(noOfLeaves, leaveType, emp_code, function (err, results) {
                if (err) {
                    return res.json(flashMessage.error(Const.USER_NOT_ELIGIBLE_FOR_LEAVE, {Token: req.user[0].token}));
                } else {
                    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.UPDATE_LEAVE_DETAILS, [reqNumber, modifiedDate, reason, leaveType], function (err, result) {
                        if (err) {
                            errLog.err("Error in leaveController-updateLeaveRequest-leaveDetails >> " + err);
                            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                                Error: err,
                                Token: req.user[0].token
                            }));
                        } else {
                            pgSqlUtils.executeQuery(pgSqlService.leaveClient, query, values, function (err, result) {
                                if (err) {
                                    errLog.err("Error in leaveController-updateLeaveRequest-leaveResult >> " + err);
                                    return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                                        Error: err,
                                        Token: req.user[0].token
                                    }));
                                } else {
                                    /* var userEmailTemplate = emailHelper.createEmailTemplate(emailConfig.cancelTemplate, req.user[0].emp_name, result[0].leave_start_date, result[0].leave_end_date,"", reqNumber);
                                     emailHelper.sendMail(nodeutil.format(emailConfig.cancelSubject, req.user[0].emp_name.trim(), req.user[0].empId.trim()), req.user[0].login.trim() + emailConfig.ssplDomain, req.user[0].approvedByLoginName.trim() + emailConfig.ssplDomain, userEmailTemplate, function (err, emailSent) {
                                     if (err) {
                                     return res.json(flashMessage.error(Const.ERR_IN_SENDING_MAIL, {Token: req.user[0].token}));
                                     } else {
                                     return res.json(flashMessage.success(Const.SUCCESS, {
                                     Result: "Canceled Successfully",
                                     Token: req.user[0].token
                                     }));
                                     }
                                     });*/
                                    //"<p>Leave request updated <br> from  %s to %s by %s</p>"
                                    var from = req.user[0].emp_code;
                                    var to = req.user[0].reportsto;
                                    var title = leaveTitle["Update_Leave"];
                                    var inAppNotificationMsg = nodeutil.format(emailConfig.updateTitleInApp, startDate, endDate, req.user[0].emp_name.trim());
                                    pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.GET_MANAGER_EMP_ID, [req.user[0].reportsto], function (err, nRes) {
                                        //from, to, title, img, empCode, message
                                        notificationCtr.createRequestLeaveNotification(from, to, title, "", nRes[0].emp_code_entered, inAppNotificationMsg, function (err, r) {
                                            leaveHelper.updateLeaveToMongo(emp_code, reqNumber, in_integra, function (err, result) {
                                                if (err) {
                                                    errLog.err("Error in updateLeaveToMongo >> " + JSON.stringify(err));
                                                    return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                                                        Error: err,
                                                        Token: req.user[0].token
                                                    }));
                                                } else {
                                                    return res.json(flashMessage.success(Const.SUCCESS, {
                                                        Result: result,
                                                        Token: req.user[0].token
                                                    }));
                                                }
                                            })
                                        })
                                    })

                                }
                            });
                        }
                    });
                }
            })
        }
    })
};


leaveController.getHolidayListOfDates = function (req, res) {
    leaveHelper.getHolidayByDates(new Date().getFullYear().toString(), function (err, results) {
        if (err) {
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                Error: err,
                Token: req.user[0].token
            }));
        } else {
            return res.json(flashMessage.success(Const.SUCCESS, {Result: results, Token: req.user[0].token}));
        }
    })
};


module.exports = leaveController;