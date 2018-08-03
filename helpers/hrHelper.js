var pgSqlService = require('../services/pgSqlService');
var pgSqlUtils = require('../utils/pgSqlUtils');
var Query = require('../utils/queryConstants');

var hrHelper = function () {
};

/**
 * Fetch the leave balance of all employees by Selected year/ Current year from leave_at_hand table in offpro Database
 * @param year >> Selected year/ Current year
 * @param cb >> callback
 */
hrHelper.getLeaveBalanceByYear = function (year, cb) {
    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.GET_LEAVE_BALANCE_BY_YEAR, [year], function (err, data) {
        if (err) {
            cb(err, null);
        } else {
            cb(err, data);
        }
    });
};

/**
 * Fetch the leave balance of Employee
 * @param empCode >> Generated code of Employee
 * @param cb >> callback
 */
hrHelper.getLeaveBalanceByEmployeeId = function (empCode, cb) {
    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.GET_LEAVE_BALANCE_BY_EMPCODE, [empCode], function (err, data) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, data);
        }
    });
};

/**
 *
 * @param startDate >>
 * @param endDate >>
 * @param cb >> callback
 */
hrHelper.getLeaveBalanceBetweenDates = function (startDate, endDate, cb) {
    //todo >> Find out the required tables and create Query
    pgSqlUtils.executeQuery(pgSqlService.leaveClient, query, [startDate, endDate], function (err, data) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, data)
        }
    });
};

/**
 *
 * @param startDate >>
 * @param endDate >>
 * @param empCode >>
 * @param cb >> callback
 */
hrHelper.getLeaveBalanceByEmpNameAndDates = function (startDate, endDate, empCode, cb) {
    //todo >> Find out the required tables and create Query
    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.FETCH_LEAVE_HISTORY_BETWEEN_DATES, [startDate, endDate, empCode], function (err, data) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, data);
        }
    });
}

/**
 * Fetching Employee list
 * @param cb >> callback
 */
hrHelper.fetchEmployeeList = function (cb) {
    pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.FETCH_EMPLOYEE_LIST, [], function (err, data) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, data);
        }
    });
};

module.exports = hrHelper;
