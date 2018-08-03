var empDao = require('../DAO/empDao');
var errLog = require('../services/loggerService').errorLog;

var employee = function () {
};

/**
 * callback function which returns err if connectivity issue/db issue
 * success callback return an object
 * @param cb
 */
employee.fetchEmp = function (cb) {
    empDao.fetchAllEmployee(function (err, employees) {
        if (err) {
            errLog.err("error in empDao.fetchAllEmployee - > managers/employee");
            cb(err, null);
        } else {
            cb(null, employees)
        }
    })
};


module.exports = employee;