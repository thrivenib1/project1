var pgSqlService = require('../services/pgSqlService');
var pgSqlUtils = require('../utils/pgSqlUtils');
var Query = require('../utils/queryConstants');
var async = require('async');
var utils = require('../utils/utils');
var logger = require('../services/loggerService').infoLog;
var errLog = require('../services/loggerService').errorLog;
var leaveModel = require('../schemas/leave');
var config = require('../config/config');
var leaveHelper = function () {
};

/**
 * Used to fetch leave history of a Employee by empCode and year
 * @param {number} empCode
 * @param {number} year
 * @param cb
 */
leaveHelper.fetchLeaveHistory = function (empCode, year, cb) {
    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.FETCH_LEAVE_HISTORY, [empCode, year], function (err, data) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, data);
        }
    });
};





/**
 * Used to Fetch the holiday list of the year
 * @param {number} year
 * @param cb
 */
leaveHelper.fetchHolidayList = function (year, cb) {
    pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.FETCH_HOLIDAY_LIST, [year], function (err, data) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, data);
        }
    });
};

/**
 * Fetch the leave balance of the employee for current year
 * @param {number} empCode
 * @param {number} year
 * @param cb
 */
leaveHelper.fetchLeaveBalanceOfEmployee = function (empCode, year, cb) {
    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.GET_LEAVE_BALANCE_OF_EMPLOYEE, [empCode, year], function (err, data) {
        if (err) {
            return cb(err, null);
        } else {
            return cb(null, data);
        }
    });
};

/**
 * Fetch the Recent Leave History
 * @param {number} empCode
 * @param cb
 */
leaveHelper.fetchRecentLeaveHistory = function (empCode, cb) {
    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.FETCH_RECENT_LEAVE_HISTORY, [empCode], function (err, data) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, data);
        }
    });
};

/**
 * Fetching the leave history between the selected dates
 * @param {number} empCode
 * @param {Date} startDate
 * @param {Date} endDate
 * @param cb
 */
leaveHelper.fetchLeaveHistoryBetweenDates = function (empCode, startDate, endDate, cb) {
    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.FETCH_LEAVE_HISTORY_BETWEEN_DATES, [empCode, startDate, endDate], function (err, data) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, data);
        }
    });
};
/**
 * Cancel Leave
 * @param {number} reqNumber
 * @param cb
 */
leaveHelper.cancelLeave = function (reqNumber, cb) {
    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.CANCEL_LEAVE_IN_LEAVE_RESULT, [true, reqNumber], function (err) {
        if (err) {
            return cb(err, null);
        } else {
            return cb(null, 'success');
        }
    });
};


/**
 * @purpose         >> Request Leave (applying same leave multiple times should be avoided)
 * @param startDate >> leave start date
 * @param endDate   >> leave enddate
 * @param cb
 */
leaveHelper.validateRequestLeaveDates = function (reqNumber, leaveType, startDate, endDate, empCode, compStartDate, cb) {

    var query, values;

    if (leaveType == 3) {//compdate
        if (reqNumber) {
            query = Query.VALIDATE_COMPENSATION_LEAVES_FOR_UPDATE;
            values = [empCode, reqNumber]
        } else {
            query = Query.VALIDATE_COMPENSATION_LEAVES;
            values = [empCode]
        }
        pgSqlUtils.executeQuery(pgSqlService.leaveClient, query, values, function (err, results) {
            if (err) {
                cb(err, null);
            } else {
                var itemsProcessed = 0;
                if (results && results.length) {
                    for (var i = 0; i < results.length; i++) {

                        startDate = new Date(startDate);
                        var sMonth = startDate.getUTCMonth() + 1;
                        sMonth = sMonth.toString().length == 1 ? '0' + sMonth : sMonth;
                        var sDateInternal = startDate.getDate();
                        sDateInternal = sDateInternal.toString().length == 1 ? '0' + sDateInternal : sDateInternal;
                        startDate = startDate.getUTCFullYear() + '-' + sMonth + '-' + sDateInternal;

                        compStartDate = new Date(compStartDate);
                        var cMonth = compStartDate.getUTCMonth() + 1;
                        cMonth = cMonth.toString().length == 1 ? '0' + cMonth : cMonth;
                        var cDateInternal = compStartDate.getDate();
                        cDateInternal = cDateInternal.toString().length == 1 ? '0' + cDateInternal : cDateInternal;
                        compStartDate = compStartDate.getUTCFullYear() + '-' + cMonth + '-' + cDateInternal;

                        var startMonth = results[i].leave_start_date.getUTCMonth() + 1;
                        startMonth = startMonth.toString().length == 1 ? '0' + startMonth : startMonth;
                        var startDateInternal = results[i].leave_start_date.getDate();
                        startDateInternal = startDateInternal.toString().length == 1 ? '0' + startDateInternal : startDateInternal;
                        var dbstartDate = results[i].leave_start_date.getUTCFullYear() + '-' + startMonth + '-' + startDateInternal;

                        var endMonth = results[i].leave_end_date.getUTCMonth() + 1;
                        endMonth = endMonth.toString().length == 1 ? '0' + endMonth : endMonth;
                        var endDateInternal = results[i].leave_end_date.getDate();
                        endDateInternal = endDateInternal.toString().length == 1 ? '0' + endDateInternal : endDateInternal;
                        var dbendDate = results[i].leave_end_date.getUTCFullYear() + '-' + endMonth + '-' + endDateInternal;

                        itemsProcessed++;

                        if (results[i].comp_start_date) {
                            var compStartMonth = results[i].comp_start_date.getUTCMonth() + 1;
                            compStartMonth = compStartMonth.toString().length == 1 ? '0' + compStartMonth : compStartMonth;
                            var compStartDateInternal = results[i].comp_start_date.getDate();
                            compStartDateInternal = compStartDateInternal.toString().length == 1 ? '0' + compStartDateInternal : compStartDateInternal;
                            var dbCompStartDate = results[i].comp_start_date.getUTCFullYear() + '-' + compStartMonth + '-' + compStartDateInternal;
                        }


                        if (results[i].comp_end_date) {
                            var compEndMonth = results[i].comp_end_date.getUTCMonth() + 1;
                            compEndMonth = compEndMonth.toString().length == 1 ? '0' + compEndMonth : compEndMonth;
                            var compEndDateInternal = results[i].comp_end_date.getDate();
                            compEndDateInternal = compEndDateInternal.toString().length == 1 ? '0' + compEndDateInternal : compEndDateInternal;
                            var dbCompEndDate = results[i].comp_end_date.getUTCFullYear() + '-' + compEndMonth + '-' + compEndDateInternal;
                        }

                        if ((startDate == dbstartDate) || (startDate == dbendDate) || (startDate == dbCompStartDate) || (startDate == dbCompEndDate)) {
                            logger.info("leave matches for 1....");
                            logger.info("startDate >> " + startDate);
                            logger.info("dbstartDate >> " + dbstartDate);
                            logger.info("dbendDate >> " + dbendDate);
                            logger.info("dbCompStartDate >> " + dbCompStartDate);
                            logger.info("dbCompEndDate >> " + dbCompEndDate);
                            logger.info("compStartDate >> " + compStartDate);
                            return cb(null, true);
                        }

                        if ((compStartDate == dbstartDate) || (compStartDate == dbendDate) || (compStartDate == dbCompStartDate) || (compStartDate == dbCompEndDate)) {
                            logger.info("leave matches for 2....");
                            logger.info("startDate >> " + startDate);
                            logger.info("dbstartDate >> " + dbstartDate);
                            logger.info("dbendDate >> " + dbendDate);
                            logger.info("dbCompStartDate >> " + dbCompStartDate);
                            logger.info("dbCompEndDate >> " + dbCompEndDate);
                            logger.info("compStartDate >> " + compStartDate);

                            return cb(null, true);
                        }


                        if (itemsProcessed === results.length) {
                            return cb(null, null);
                        }
                    }
                } else {
                    return cb(null, null);
                }
            }
        })
    } else {
        if (reqNumber) {
            query = Query.VALIDATE_BETWEEN_DATES_FOR_UPDATE;
            values = [empCode, reqNumber]
        } else {
            query = Query.VALIDATE_BETWEEN_DATES;
            values = [empCode]
        }
        //validating from and to dates
        pgSqlUtils.executeQuery(pgSqlService.leaveClient, query, values, function (err, results) {
            if (err) {
                cb(err, null);
            } else {
                var itemsProcessed = 0;
                if (results && results.length) {
                    outer: for (var i = 0; i < results.length; i++) {
                        var startMonth = results[i].leave_start_date.getUTCMonth() + 1;
                        startMonth = startMonth.toString().length == 1 ? '0' + startMonth : startMonth;
                        var startDateInternal = results[i].leave_start_date.getDate();
                        startDateInternal = startDateInternal.toString().length == 1 ? '0' + startDateInternal : startDateInternal;

                        var dbstartDate = results[i].leave_start_date.getUTCFullYear() + '-' + startMonth + '-' + startDateInternal;

                        var endMonth = results[i].leave_end_date.getUTCMonth() + 1;
                        endMonth = endMonth.toString().length == 1 ? '0' + endMonth : endMonth;

                        var endDateInternal = results[i].leave_end_date.getDate();
                        endDateInternal = endDateInternal.toString().length == 1 ? '0' + endDateInternal : endDateInternal;

                        var dbendDate = results[i].leave_end_date.getUTCFullYear() + '-' + endMonth + '-' + endDateInternal;
                        itemsProcessed++;

                        var a = new Date(dbstartDate);
                        var b = new Date(dbendDate);


                        var dt = new Date(startDate);
                        var dtNew = new Date(endDate);
                        var dateOne = dt >= a && dt <= b;

                        var dateTwo = dtNew >= a && dtNew <= b;


                        if (dateOne) {
                            return cb(null, true);
                        }

                        if (dateTwo) {
                            return cb(null, true);
                        }

                        if (itemsProcessed === results.length) {
                            return cb(null, null);
                        }
                    }
                } else {
                    return cb(null, null);
                }
            }
        });
    }
};

/**
 * get holiday list dates
 * exclude company leaves and weekends
 * 1.mini 1 day max 3days working days
 */
leaveHelper.getHolidayByDates = function (year, cb) {
    leaveHelper.fetchHolidayList(year, function (err, results) {
        if (err) {
            cb(err, null);
        } else {
            leaveHelper.getHolidayDates(results, function (err, dates) {
                var formatedDates = [];
                var itemsProcessed = 0;
                async.forEach(dates, function (date) {
                    leaveHelper.dateToMmDdYy(date, function (err, newDate) {
                        formatedDates.push(newDate);
                        itemsProcessed++;
                        if (itemsProcessed === formatedDates.length) {
                            cb(null, itemsProcessed);
                        }
                    })
                });

            })
        }
    })
};

leaveHelper.dateToMmDdYy = function (input, cb) {
    var ptrn = /(\d{4})\-(\d{2})\-(\d{2})/;
    if (!input || !input.match(ptrn)) {
        cb('Invalid Date Format');
    } else {
        cb(null, input.replace(ptrn, '$2/$3/$1'))
    }
};

leaveHelper.getHolidayDates = function (holidayList, cb) {
    var holidayDates = [];
    var i = 0;
    holidayList.filter(function (obj) {
        i++;
        holidayDates.push(obj.day);
        if (i == holidayList.length) {
            cb(null, holidayDates)
        }
    });
};

leaveHelper.validateLeave = function (leaveType, year, cb) {

    switch (leaveType) {
        case "1":
            leaveHelper.validateCL(year, function (err, results) {
                if (err) {
                    cb(err, null);
                } else {
                    cb(null, results);
                }
            });

        default:
            break;
    }
};


leaveHelper.checkIfUserEligibleToTakeLeave = function (noOfLeave, leaveType, empCode, cb) {

    if (leaveType == 3) { //($leave_type==3 &&$no_days>3)
        logger.info("allowing COMP to Apply ");
        cb(null, true);
    } else {
        leaveHelper.fetchLeaveBalanceOfEmployee(empCode, new Date().getFullYear(), function (err, results) {
            if (err) {
                cb(err, null)
            } else {
                if (results && results.length) {
                    var pl_avl = results[0].pl_prev + results[0].pl_max - results[0].p_leave;
                    var cl_avl = results[0].cl_max - results[0].c_leave;
                    var balanceCl = results[0].c_leave + results[0].cl_max;
                    var balancePl = results[0].p_leave + results[0].pl_max;
                    var totalCl = Math.abs(results[0].c_leave - noOfLeave);

                    var usedPl = Math.abs(results[0].p_leave);

                    logger.info("balance Cl >>" + balanceCl);
                    logger.info("balance Pl >>" + balancePl);
                    logger.info("noOfLeave >>" + noOfLeave);
                    logger.info("leaveType >>" + leaveType);

                    if (leaveType == 1 && totalCl <= config.maxClLeaves) {//cl (in pcc $leave_type==1 && $no_days>3)
                        logger.info("allowing Cl to Apply ");
                        cb(null, true);
                    } else if (leaveType == 4 && balancePl >= noOfLeave) {//pl ($leave_type==4 && $no_days<=3)
                        logger.info("allowing Pl to Apply ");
                        cb(null, true);
                    } else if (leaveType == 2) {//($leave_type==2 &&$no_days>4)
                        logger.info("allowing LTC to Apply ");
                        cb(null, true);
                    } else if (leaveType == 5) {
                        logger.info("allowing Maternity to Apply ");
                        cb(null, true);
                    } else {
                        cb("Don't Have Enough Leaves", null)
                    }
                } else {
                    cb(null, true);
                }

            }
        });
    }
};

leaveHelper.getAvailableLeave = function (empCode, year, cb) {
    leaveHelper.fetchLeaveHistory(empCode, year, function (err, r) {
        var itemsProcessed = 0;
        var cl_Applied = 0;
        var pl_Applied = 0;
        var cl_Used = 0;
        var pl_Used = 0;

        if (r && r.length) {
            async.forEach(r, function (lev_result) {
                lev_result.status = lev_result.appr ? 'approved' : lev_result.cancel ? 'cancel' : lev_result.rej ? 'rejected' : 'Pending';
                itemsProcessed++;
                //Available cl/pl leaves
                if (lev_result.status == 'Pending' && lev_result.leave_type == 1) {//CL
                    cl_Applied = cl_Applied + lev_result.no_leaves;
                } else if (lev_result.status == 'Pending' && lev_result.leave_type == 4) {//PL
                    pl_Applied = pl_Applied + lev_result.no_leaves;
                }
                //used cl/pl leaves
                if (lev_result.status == 'approved' && lev_result.leave_type == 1) {
                    cl_Used = cl_Used + lev_result.no_leaves;
                } else if (lev_result.status == 'approved' && lev_result.leave_type == 4) {
                    pl_Used = pl_Used + lev_result.no_leaves;
                }

                if (itemsProcessed === r.length) {
                    cb(null, {clApplied: cl_Applied, plApplied: pl_Applied, clUsed: cl_Used, plUsed: pl_Used})
                }
            })
        } else {
            cb(null, {clApplied: cl_Applied, plApplied: pl_Applied, clUsed: cl_Used, plUsed: pl_Used});
        }
    })
};


leaveHelper.addLeaveToMongo = function (empCode, reqNum, in_integra, cb) {
    var leaveDoc = new leaveModel();
    leaveDoc.empCode = empCode;
    leaveDoc.reqNum = reqNum;
    leaveDoc.in_integra = in_integra;
    leaveDoc.save(function (err, done) {
        if (err) {
            logger.info("addLeaveToMongo :: failure ");
            return cb(err, null);
        } else {
            logger.info("addLeaveToMongo :: success ");
            return cb(null, 'Success');
        }
    })
};


leaveHelper.updateLeaveToMongo = function (empCode, reqNum, in_integra, cb) {
    leaveModel.findOne({
        $and: [{
            empCode: empCode,
            reqNum: reqNum
        }]
    }, function (err, result) {
        if (result) {
            leaveModel.update({
                $and: [{
                    empCode: empCode,
                    reqNum: reqNum
                }]
            }, {$set: {in_integra: in_integra}}, {multi: false}, function (err, result) {
                if (err) {
                    cb(err, null);
                } else {
                    cb(null, result);
                }
            })
        } else {
            var leaveDoc = new leaveModel();
            leaveDoc.empCode = empCode;
            leaveDoc.reqNum = reqNum;
            leaveDoc.in_integra = in_integra;
            leaveDoc.save(function (err, done) {
                if (err) {
                    logger.trace("updateLeaveToMongo :: failure ");
                    return cb(err, null);
                } else {
                    logger.trace("updateLeaveToMongo :: success ");
                    return cb(null, 'Success');
                }
            })
        }
    })

};

leaveHelper.getLeaveFromMongo = function (reqNum, empCode, cb) {
    leaveModel.findOne({
        $and: [{
            empCode: empCode,
            reqNum: reqNum
        }]
    }, function (err, results) {
        if (err) {
            errLog.err("error in getting leaves from mongo >> " + JSON.stringify(err));
            cb(err, null);
        } else {
            cb(null, results);
        }
    })
};


module.exports = leaveHelper;
