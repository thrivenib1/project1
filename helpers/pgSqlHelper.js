var pgSqlUtils = require('../utils/pgSqlUtils');
var pgSqlService = require('../services/pgSqlService');
var Query = require('../utils/queryConstants');
var pgSqlHelper = {};

/**
 *
 * @param empCode - get empName by empCode from offPro from emp_master table
 * @param cb - callback
 */

pgSqlHelper.getEmpNameByEmpCode = function (empCode, cb) {
    pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.GET_EMPNAME_BY_EMPCODE, [empCode], function (err, result) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, result);
        }
    })
};

/**
 *
 * @param cb - callback
 * usage - used to get request number while applying for leave
 */
pgSqlHelper.getRequestNumber = function (cb) {
    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.GET_REQUEST_NUMBER, [], function (err, reqNumber) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, reqNumber[0].inc_id);
        }
    })
};

/**
 * @param reqNumber - Pas the current request number and update after insertion
 * callback is not required because we don't depend on the return value of the function
 */

pgSqlHelper.incRequestNumber = function (reqNumber, cb) {
    ++reqNumber;
    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.INC_REQUEST_NUMBER, [reqNumber], function (err, incrementedReqNum) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, true);
        }
    })
};

/**
 *
 * @param empID
 * @param cb
 */
pgSqlHelper.getEmpCodeByEmpID = function (empID, cb) {
    pgSqlUtils.executeQuery(pgSqlService.offproClient, Query.GET_EMPCODE_BY_EMPID, [empID], function (err, result) {
        if (err) { console.log(err);
            cb(err, null);
        } else {
            cb(null, result);
        }
    })
}

pgSqlHelper.getSlno = function (cb) {
    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.GET_SL_NUMBER, [], function (err, slNumber) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, slNumber[0].sl_no);
        }
    })
};


pgSqlHelper.incSlNumber = function (slNumber) {
    ++slNumber;
    pgSqlUtils.executeQuery(pgSqlService.leaveClient, Query.INC_SL_NUMBER, [slNumber], function (err, incrementedSlNum) {
        return;
    })
};


module.exports = pgSqlHelper;