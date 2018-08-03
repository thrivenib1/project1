var flashMessage = require('../utils/flashMessageUtils');
var Const = require('../utils/flashMessageStrings').CONST;
var pgSqlHelper = require('../helpers/pgSqlHelper');
var pgSqlService = require('../services/pgSqlService');
var pgSqlUtils = require('../utils/pgSqlUtils');
var hrHelper = require('../helpers/hrHelper');
var Query = require('../utils/queryConstants');
var logger = require('../services/loggerService').infoLog;
var errLog = require('../services/loggerService').errorLog;

var hrController = function () {
};

/**
 * Get Leave Balance by Year
 * @param {object} req
 * @param {object} res
 * @return {object} result
 */
hrController.getLeaveBalanceByYear = function (req, res) {
    var year = req.body.year;
    hrHelper.getLeaveBalanceByYear(year, function (err, result) {
        if (err) {
            errLog.err("Error in hrController-getLeaveBalanceByYear >> " + err);
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                Error: err,
                Token: req.user[0].token
            }));
        } else {
            logger.info("success:getLeaveBalanceByYear");
            return res.json(flashMessage.success(Const.SUCCESS, {Result: result, Token: req.user[0].token}));
        }
    });
};

/**
 * Get Leave Balance by Employee ID
 * @param {object} req
 * @param {object} res
 * @return {object} result
 */
hrController.getLeaveBalanceByEmployeeId = function (req, res) {
    var empID = req.body.empID;
    pgSqlHelper.getEmpCodeByEmpID(empID, function (err, result) {
        if (err) {
            errLog.err("Error in hrController-getLeaveBalanceByEmployeeId-getEmpCodeByEmpID >> " + err);
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                Error: err,
                Token: req.user[0].token
            }));
        } else {
            hrHelper.getLeaveBalanceByEmployeeId(result[0].emp_code, function (err, result) {
                if (err) {
                    errLog.err("Error in hrController-getLeaveBalanceByEmployeeId >> " + err);
                    return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                        Error: err,
                        Token: req.user[0].token
                    }));
                } else {
                    logger.info("success:getLeaveBalanceByEmployeeId");
                    return res.json(flashMessage.success(Const.SUCCESS, {Result: result, Token: req.user[0].token}));
                }
            });
        }
    });
};

/**
 * Get Leave Balance In between Start Date and End date
 * @param {object} req
 * @param {object} res
 * @return {object} result
 */
hrController.getLeaveBalanceBetweenDates = function (req, res) {
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    hrHelper.getLeaveBalanceBetweenDates(startDate, endDate, function (err, result) {
        if (err) {
            errLog.err("Error in hrController-getLeaveBalanceBetweenDates >> " + err);
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                Error: err,
                Token: req.user[0].token
            }));
        } else {
            logger.info("success >> getLeaveBalanceBetweenDates");
            return res.json(flashMessage.success(Const.SUCCESS, {Result: result, Token: req.user[0].token}));
        }
    });
};

/**
 * Get Leave Balance In between Start Date and End date and by Employee ID
 * @param {object} req
 * @param {object} res
 * @return {object} result
 */
hrController.getLeaveBalanceByEmpNameAndDates = function (req, res) {
    var empID = req.body.empID;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    if (!empID || !startDate || !endDate) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {
            Error: err,
            Token: req.user[0].token
        }));
    }
    pgSqlHelper.getEmpCodeByEmpID(empID, function (err, result) {
        if (err) {
            errLog.err("Error in hrController-getLeaveBalanceByEmpNameAndDates-getEmpCodeByEmpID >> " + err);
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                Error: err,
                Token: req.user[0].token
            }));
        } else {
            hrHelper.getLeaveBalanceByEmpNameAndDates(startDate, endDate, result[0].emp_code, function (err, result) {
                if (err) {
                    errLog.err("Error in hrController-getLeaveBalanceByEmpNameAndDates >> " + err);
                    return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                        Error: err,
                        Token: req.user[0].token
                    }));
                } else {
                    logger.info("Error in hrController-getLeaveBalanceByEmpNameAndDates");
                    return res.json(flashMessage.success(Const.SUCCESS, {Result: result, Token: req.user[0].token}));
                }
            });
        }
    });
};

/**
 * Adding and Deleting the leaves
 * @param {object} req
 * @param {object} res
 * @return if success status code 200 if err 404
 */
hrController.creditOrDebitLeaves = function (req, res) {

    var leaveAction = req.body.leaveAction;
    var empCode = req.user[0].emp_code;
    var year = new Date().getYear();
    var leaveNumPl = req.body.leaveNumPl;
    var leaveNumCl = req.body.leaveNumCl;
    var entryTime = new Date().getUTCDate();
    var reason = req.body.reason;
    var entryBy = req.body.entryBy;
    var query = "";
    var values = "";


    if (!leaveAction || !leaveNumCl || !leaveNumPl || !reason || !entryBy) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }
    pgSqlHelper.getSlno(function (err, slNumber) {
        if (leaveAction == "credit_leave") {//slno,emp_code,leave_no_pl,leave_no_cl,entry_time,reason,year,entry_by
            values = [slNumber, empCode, leaveNumPl, leaveNumCl, entryTime, reason, year, entryBy];
            query = Query.INSERT_INTO_LEAVE_CREDIT;
        } else if (leaveAction == "debit_leave") {
            values = [slNumber, empCode, leaveNumPl, leaveNumCl, entryTime, reason, year, entryBy];
            query = Query.INSERT_INTO_LEAVE_DEBIT;
        } else {
            return res.json(flashMessage.error(Const.ERR_INVALID_LEAVE_ACTION, {Token: req.user[0].token}));
        }

        pgSqlUtils.executeQuery(pgSqlService.leaveClient, query, values, function (err, result) {
            if (err) {
                errLog.err("Error in hrController-creditOrDebitLeaves >> " + err);
                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                    Error: err,
                    Token: req.user[0].token
                }));
            } else {
                pgSqlHelper.incSlNumber(slNumber);
                logger.info("success >> creditOrDebitLeaves");
                return res.json(flashMessage.success(Const.SUCCESS, {Result: result, Token: req.user[0].token}));
            }
        })
    });
};

/**
 * Get Employee List
 * @param {object} req
 * @param {object} res
 * @return {object} result
 */
hrController.getEmployeeList = function (req, res) {
    hrHelper.fetchEmployeeList(function (err, result) {
        if (err) {
            errLog.err("Error in hrController-getEmployeeList >> " + err);
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                Error: err,
                Token: req.user[0].token
            }));
        } else {
            logger.info("success:getEmployeeList");
            return res.json(flashMessage.success(Const.SUCCESS, {Result: result, Token: req.user[0].token}));
        }
    })
};

module.exports = hrController;
