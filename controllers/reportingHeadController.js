var pgSqlUtils = require('../utils/pgSqlUtils');
var pgSqlService = require('../services/pgSqlService');
var flashMessage = require('../utils/flashMessageUtils');
var Const = require('../utils/flashMessageStrings').CONST;
var Query = require('../utils/queryConstants');
var logger = require('../services/loggerService').infoLog;
var errLog = require('../services/loggerService').errorLog;
var traceLog = require('../services/loggerService').traceLog;
var pgSqlHelper = require('../helpers/pgSqlHelper');
var constants = require('../utils/constants');
var emailConfig = require('../config/emailConfig');
var emailHelper = require('../helpers/emailHelper');
var reportingHeadHelper = require('../helpers/reportingHeadHelper');
var kueUtils = require('../utils/kueUtils');
var kueConfig = require('../config/kueConfig');
var gcmConst = require('../utils/gcmMessageStrings').gcmConst;
var gcmMsgString = require('../utils/gcmMessageStrings').gcmMsgString;
var leaveHelper = require('../helpers/leaveHelper');
var TASK = require('../utils/taskType').TASK;
var notificationCtr = require('../controllers/notificationController');
var leaveTitle = require('../utils/constants').leaveTitle;

var nodeutil = require('util');
var async = require('async');

var reportingHeadController = function () {
};


//get all the employees under the reporting Head
reportingHeadController.empUnderReportingHead = function (req, res) {
    pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.FETCH_EMP_UNDER_REPORTING_HEAD, [req.user[0].emp_code], function (err, result) {
        if (err) {
            errLog.err("Error in reportingHeadController-empUnderReportingHead >> " + err);
            return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
        } else {
            logger.info("success in empUnderReportingHead");
            return res.json(flashMessage.success(Const.SUCCESS, {Result: result, Token: req.user[0].token}));
        }
    })
};

/***
 * Approve leave by reporting head
 * @param req >> reqnumber and comments(optional) are used from request
 * @param res >> if success return 200 else 404 status code
 */

reportingHeadController.approveLeave = function (req, res) {

    var reqNumber = req.body.reqNum;
    var comments = req.body.comments;

    //On submission of the form, a mail will be sent to the person who has requested for the leave with a copy to HRD and reportingHead.
    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.APPROVE_LEAVE_IN_LEAVE_RESULT, ['t', reqNumber], function (err, result) {
        if (err) {
            errLog.err("Error in reportingHeadController-approveLeave-leaveResult >> " + err);
            return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
        } else {//add comments and approved_by in leave details
            pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.APPROVE_LEAVE_IN_LEAVE_DETAILS, [comments, req.user[0].emp_code, reqNumber], function (err, result) {
                if (err) {
                    errLog.err("Error in reportingHeadController-approveLeave-leaveDetails >> " + err);
                    return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
                } else {
                    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.FETCH_LEAVE_START_AND_END_DATE, [reqNumber], function (err, result) {
                        if (err) {
                            errLog.err("Error in reportingHeadController-approveLeave-dates >> " + err);
                            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
                        } else {
                            var comensatoryLeave = result[0].comp_start_date ? true : false;

                            pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.GET_EMP_CODE_FROM_LEAVE_DETAILS, [reqNumber], function (err, leave_details) {
                                reportingHeadHelper.deductLeave(result, reqNumber, leave_details[0].emp_code, function (err, objResult) {
                                    if (err) {
                                        errLog.err("error in deduct leave");
                                        return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
                                    } else {
                                        kueUtils.createTask(TASK.postLeaveRequestApprove, "", 'postLeaveRequestApprove', 'postLeaveRequestApprove', 'postLeaveRequestApprove', "", "", {
                                            leaveDetailsEmpcode: leave_details[0].emp_code,
                                            res_leave_start_date: result[0].leave_start_date,
                                            res_leave_end_date: result[0].leave_end_date,
                                            reqUserEmpName: req.user[0].emp_name,
                                            reqNumber: reqNumber,
                                            comments: comments,
                                            reqUserApprovedLoginName: req.user[0].approvedByLoginName,
                                            comensatoryLeave: comensatoryLeave,
                                            from: req.user[0].emp_code
                                        }, function (err, r) {
                                            logger.info("final success approve");
                                            return res.json(flashMessage.success(Const.SUCCESS, {
                                                Result: "Approved Successfully",
                                                Token: req.user[0].token
                                            }));
                                        })
                                    }
                                });
                            });
                        }
                    });
                }
            });
        }
    });
};

reportingHeadController.postLeaveRequestApprove = function (job, cb) {
    var leaveDetailsEmpcode = job.data.taskData.leaveDetailsEmpcode;
    var res_leave_start_date = job.data.taskData.res_leave_start_date;
    var res_leave_end_date = job.data.taskData.res_leave_end_date;
    var reqUserEmpName = job.data.taskData.reqUserEmpName;
    var reqNumber = job.data.taskData.reqNumber;
    var comments = job.data.taskData.comments;
    var reqUserApprovedLoginName = job.data.taskData.reqUserApprovedLoginName;
    var comensatoryLeave = job.data.taskData.comensatoryLeave;
    var from = job.data.taskData.from;
    var inAppNotificationMsg;

    reportingHeadController.getEmpLogin(leaveDetailsEmpcode, function (err, endUser) {
        if (err) {
            errLog.err("error in reportingHeadController.getEmpLogin postLeaveRequestApprove " + JSON.stringify(err));
            return cb(null, 'success');
        } else {
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
                inAppNotificationMsg = nodeutil.format(emailConfig.approveTitleInAppForOneDay, sDate, reqUserEmpName.trim());
            } else {
                inAppNotificationMsg = nodeutil.format(emailConfig.approveTitleInApp, sDate, eDate, reqUserEmpName.trim());
            }

            var bodyTemplate = emailHelper.createEmailTemplate(emailConfig.approveTemplate, endUser.emp_name.trim(), sDate, eDate, reqUserEmpName, reqNumber, comments);

            var empEmail = "" + endUser.login.trim() + emailConfig.ssplDomain + "," + endUser.login.trim() + emailConfig.splDomain + "";
            var managerEmail = "" + reqUserApprovedLoginName.trim() + emailConfig.ssplDomain + "," + reqUserApprovedLoginName.trim() + emailConfig.splDomain + "";

            pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.GET_MANAGER_EMP_ID, [endUser.emp_code], function (err, nRes) {
                if (err) {
                    logger.info("Error in getting empcode while approving leave >> " + err);
                    return cb(null, 'success');
                } else {
                    var to = endUser.emp_code;
                    var title = leaveTitle["Approve_Leave"];
                    notificationCtr.createRequestLeaveNotification(from, to, title, "", nRes[0].emp_code_entered.trim(), inAppNotificationMsg, function (err, r) {
                        kueUtils.createTask(TASK.emailService, "", emailConfig.approveTemplate.templateNumber, kueConfig.emailService, nodeutil.format(emailConfig.approveSubject, endUser.emp_name.trim(), nRes[0].emp_code_entered.trim()), empEmail, empEmail, bodyTemplate, function (err, emailSent) {
                            if (err) {
                                logger.info("Error in reportinghead-approveLeave >> " + err);
                                return cb(null, 'success');
                            } else {
                                reportingHeadHelper.getDeviceIdByReqNumber(reqNumber, function (err, deviceId) {
                                    //if the leave is approved sending notification only for the user
                                    kueUtils.createTask(TASK.gcmPushService, "", emailConfig.approveTemplate.templateNumber, kueConfig.gcmPushService, nodeutil.format(gcmMsgString[gcmConst.APPROVE_LEAVE], reqUserEmpName.trim()), "", "", {
                                        deviceId: deviceId,
                                        badge: 1,
                                        aid: "",
                                        pid: ""
                                    }, function (err, emailSent) {
                                        logger.info("kueservice success for approveLeave");
                                        return cb(null, 'success');
                                    })
                                });
                            }
                        });
                    });
                }

            });
        }
    })
};


/***
 * Reject leave by reporting head
 * @param req >> reqnumber and comments(optional) are used from request
 * @param res >> if success return 200 else 404 status code
 */

reportingHeadController.rejectLeave = function (req, res) {

    var empName = req.body.empName;
    var empId = req.body.empId;
    var login = req.body.login;
    var reqNumber = req.body.reqNum;
    var comments = req.body.comments;
    var manager = req.user[0].login;


    //On submission of the form, a mail will be sent to the person who has requested for the leave with a copy to HRD and reportingHead.
    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.REJECT_LEAVE_IN_LEAVE_RESULT, ['t', reqNumber], function (err, result) {
        if (err) {
            errLog.err("Error in reportingHeadController-rejectLeave-leaveResult >> " + err);
            return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
        } else {//add comments and approved_by in leave details
            pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.REJECT_LEAVE_IN_LEAVE_DETAILS, [comments, req.user[0].emp_code, reqNumber], function (err, result) {
                if (err) {
                    errLog.err("Error in reportingHeadController-rejectLeave-leaveDetails >> " + err);
                    return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
                } else {
                    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.FETCH_LEAVE_START_AND_END_DATE, [reqNumber], function (err, result) {
                        if (err) {
                            errLog.err("Error in reportingHeadController-rejectLeave-dates >> " + err);
                            return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
                        } else {
                            var comensatoryLeave = result[0].comp_start_date ? true : false;
                            pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.GET_EMP_CODE_FROM_LEAVE_DETAILS, [reqNumber], function (err, leave_details) {
                                if (err) {
                                    errLog.err("Error in getting emp_code for reqnumber >>> " + reqNumber + "----" + err);
                                    return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
                                } else {
                                    kueUtils.createTask(TASK.postLeaveRequestReject, "", 'postLeaveRequestApprove', 'postLeaveRequestApprove', 'postLeaveRequestApprove', "", "", {
                                        leaveDetailsEmpcode: leave_details[0].emp_code,
                                        res_leave_start_date: result[0].leave_start_date,
                                        res_leave_end_date: result[0].leave_end_date,
                                        reqUserEmpName: req.user[0].emp_name,
                                        reqNumber: reqNumber,
                                        comments: comments,
                                        reqUserApprovedLoginName: req.user[0].approvedByLoginName,
                                        comensatoryLeave: comensatoryLeave,
                                        from: req.user[0].emp_code
                                    }, function (err, r) {
                                        logger.info("final success reject");
                                        return res.json(flashMessage.success(Const.SUCCESS, {
                                            Result: "Rejected Successfully",
                                            Token: req.user[0].token
                                        }));
                                    })
                                }

                            })

                        }
                    });
                }
            });
        }
    });
};


reportingHeadController.postLeaveRequestReject = function (job, cb) {

    var leaveDetailsEmpcode = job.data.taskData.leaveDetailsEmpcode;
    var res_leave_start_date = job.data.taskData.res_leave_start_date;
    var res_leave_end_date = job.data.taskData.res_leave_end_date;
    var reqUserEmpName = job.data.taskData.reqUserEmpName;
    var reqNumber = job.data.taskData.reqNumber;
    var comments = job.data.taskData.comments;
    var reqUserApprovedLoginName = job.data.taskData.reqUserApprovedLoginName;
    var comensatoryLeave = job.data.taskData.comensatoryLeave;
    var from = job.data.taskData.from;
    var inAppNotificationMsg;

    reportingHeadController.getEmpLogin(leaveDetailsEmpcode, function (err, endUser) {
        if (err) {
            errLog.err("Error in getting getEmpLogin " + err);
            return cb(null, 'success');
        } else {

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
                inAppNotificationMsg = nodeutil.format(emailConfig.rejectTitleInAppForOneDay, sDate, reqUserEmpName.trim())
            } else {
                inAppNotificationMsg = nodeutil.format(emailConfig.rejectTitleInApp, sDate, eDate, reqUserEmpName.trim())
            }
            pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.GET_MANAGER_EMP_ID, [endUser.emp_code], function (err, nRes) {
                if (err) {
                    logger.info("Error in getting empcode while approving leave >> " + err);
                    return cb(null, 'success');
                } else {
                    var bodyTemplate = emailHelper.createEmailTemplate(emailConfig.rejectTemplate, endUser.emp_name.trim(), sDate, eDate, reqUserEmpName, reqNumber, comments);

                    var empEmail = "" + endUser.login.trim() + emailConfig.ssplDomain + "," + endUser.login.trim() + emailConfig.splDomain + "";
                    var managerEmail = "" + reqUserApprovedLoginName.trim() + emailConfig.ssplDomain + "," + reqUserApprovedLoginName.trim() + emailConfig.splDomain + "";

                    var to = endUser.emp_code;
                    var title = leaveTitle["Reject_Leave"];

                    notificationCtr.createRequestLeaveNotification(from, to, title, "", endUser.emp_code_entered, inAppNotificationMsg, function (err, r) {
                        kueUtils.createTask(TASK.emailService, "", emailConfig.rejectTemplate.templateNumber, kueConfig.emailService, nodeutil.format(emailConfig.rejectSubject, endUser.emp_name.trim(), nRes[0].emp_code_entered.trim()), empEmail, empEmail, bodyTemplate, function (err, emailSent) {
                            if (err) {
                                logger.info("Error in reportinghead-reject >> " + err);
                                return cb(null, 'success');
                            } else {
                                reportingHeadHelper.getDeviceIdByReqNumber(reqNumber, function (err, deviceId) {
                                    kueUtils.createTask(TASK.gcmPushService, "", emailConfig.rejectTemplate.templateNumber, kueConfig.gcmPushService, nodeutil.format(gcmMsgString[gcmConst.REJECT_LEAVE], reqUserEmpName.trim()), "", "", {
                                        deviceId: deviceId,
                                        badge: 1,
                                        aid: "",
                                        pid: ""
                                    }, function (err, emailSent) {
                                        logger.info("kueservice success for rejectleave");
                                        return cb(null, 'success');
                                    })
                                })
                            }
                        });
                    });
                }
            });
        }
    })
}

reportingHeadController.getEmpLogin = function (emp_code, cb) {
    pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.GET_EMP_CODE_BY_EMP_ID, [emp_code], function (err, user) {
        if (err) {
            return cb(err, null);
        } else {
            pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.GET_MANAGER_EMP_ID, [emp_code], function (err, euser) {
                if (err) {
                    return cb(err, null);
                }
                else {
                    user[0].emp_code_entered = euser[0].emp_code_entered;
                    return cb(null, user[0]);
                }
            })

        }
    })
};

/**
 *
 * @param req >> emp_code getting from req
 * @param res >> list of pending approval leave
 */
reportingHeadController.leavesToApprove = function (req, res) {
    var reportingManagerCode = req.user[0].emp_code;
    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.FETCH_LEAVES_TO_APPROVE, [reportingManagerCode], function (err, results) {
        if (err) {
            errLog.err("Error in reportingHeadController-leavesToApprove >> " + err);
            return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
        } else {
            if (results && results.length) {
                var arr = [];
                var itemsProcessed = 0;
                async.forEach(results, function (result) {
                    leaveHelper.getLeaveFromMongo(result.req_no, result.emp_code, function (err, leaveFromMongo) {
                        if (err) {
                            errLog.err("Error in leaveHelper.getLeaveFromMongo >> " + JSON.stringify(err));
                            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                                Error: err,
                                Token: req.user[0].token
                            }));
                        } else {
                            pgSqlHelper.getEmpNameByEmpCode(result.emp_code, function (err, data) {
                                if (err) {
                                    errLog.err("Error in reportingHeadController-leavesToApprove-getEmpNameByEmpCode >> " + err);
                                    return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                                        Error: err,
                                        Token: req.user[0].token
                                    }));
                                } else {
                                    result.in_integra = leaveFromMongo ? leaveFromMongo.in_integra : "";
                                    result.leaveTypeDesc = constants.leaveTypes[result.leave_type];
                                    result.empName = data[0].emp_name;
                                    result.empId = data[0].emp_code_entered;
                                    result.login = data[0].login;
                                    arr.push(result);
                                    itemsProcessed++;
                                    if (itemsProcessed === results.length) {
                                        logger.info("success in leavesToApprove");
                                        return res.json(flashMessage.success(Const.SUCCESS, {
                                            Result: arr,
                                            Token: req.user[0].token
                                        }));
                                    }
                                }
                            });
                        }
                    })

                });
            } else {
                return res.json(flashMessage.success(Const.INFO_NO_RESULTS_FOUND, {Token: req.user[0].token}));
            }
        }
    });
};

/**
 *
 * @param req - get all the reqNums
 * @param res
 */

reportingHeadController.bulkLeaveApproval = function (req, res) {

    var reqNumber = req.body.reqNums;
    var comments = req.body.comments;

    //On submission of the form, a mail will be sent to the person who has requested for the leave with a copy to HRD and reportingHead.
    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.APPROVE_LEAVE_IN_LEAVE_RESULT, ['t', reqNumber], function (err, result) {
        if (err) {
            errLog.err("Error in reportingHeadController-approveLeave-leaveResult >> " + err);
            return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
        } else {//add comments and approved_by in leave details
            pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.APPROVE_LEAVE_IN_LEAVE_DETAILS, [comments, req.user[0].emp_code, reqNumber], function (err, result) {
                if (err) {
                    errLog.err("Error in reportingHeadController-approveLeave-leaveDetails >> " + err);
                    return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
                } else {
                    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.FETCH_LEAVE_START_AND_END_DATE, [reqNumber], function (err, result) {
                        if (err) {
                            errLog.err("Error in reportingHeadController-approveLeave-dates >> " + err);
                            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
                        } else {
                            var comensatoryLeave = result[0].comp_start_date ? true : false;

                            pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.GET_EMP_CODE_FROM_LEAVE_DETAILS, [reqNumber], function (err, leave_details) {
                                reportingHeadHelper.deductLeave(result, reqNumber, leave_details[0].emp_code, function (err, objResult) {
                                    if (err) {
                                        errLog.err("error in deduct leave");
                                        return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
                                    } else {
                                        kueUtils.createTask(TASK.postLeaveRequestApprove, "", 'postLeaveRequestApprove', 'postLeaveRequestApprove', 'postLeaveRequestApprove', "", "", {
                                            leaveDetailsEmpcode: leave_details[0].emp_code,
                                            res_leave_start_date: result[0].leave_start_date,
                                            res_leave_end_date: result[0].leave_end_date,
                                            reqUserEmpName: req.user[0].emp_name,
                                            reqNumber: reqNumber,
                                            comments: comments,
                                            reqUserApprovedLoginName: req.user[0].approvedByLoginName,
                                            comensatoryLeave: comensatoryLeave
                                        }, function (err, r) {
                                            logger.info("final success approve");
                                            return res.json(flashMessage.success(Const.SUCCESS, {
                                                Result: "Approved Successfully",
                                                Token: req.user[0].token
                                            }));
                                        })
                                    }
                                });
                            });
                        }
                    });
                }
            });
        }
    });
};


module.exports = reportingHeadController;