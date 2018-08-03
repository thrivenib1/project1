var emp = require('../managers/employee');
var flashMessage = require('../utils/flashMessageUtils');
var Const = require('../utils/flashMessageStrings').CONST;
var errLog = require('../services/loggerService').errorLog;

var empController = function () {
};

/**
 * @param request method - GET
 * @param req
 * @param res
 *
 * controller  talk to manager
 */
empController.fetchAllEmp = function (req, res) {
    emp.fetchEmp(function (err, employees) {
        if (err) {
            errLog.err("error in empController.fetchAllEmp - controller-empcontroller");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                Error: err,
                Token: req.user[0].token
            }));
        } else {
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: employees,
                Token: req.user[0].token
            }));
        }
    })
};



module.exports = empController;