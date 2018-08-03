var empQueries = require('../utils/queryUtils/employee');
var sqlConnection = require('../services/sqlService').sqlConnection;
var logger = require('../services/loggerService').infoLog;
var errLog = require('../services/loggerService').errorLog;

var empDao = function () {
};

/**
 *
 * @param cb
 */

empDao.fetchAllEmployee = function (cb) {
    sqlConnection.query(empQueries.GET_ALL_EMPLOYEES, function (err, rows) {
        if (err) {
            errLog.err("error from empDao.fetchAllEmployee");
            cb(err, null);
        } else {
            logger.info("success from emp-dao");
            cb(null, rows);
        }
    });
};


module.exports = empDao;