var leaveHelper = require('../helpers/leaveHelper');


var graphController = function () {
};

graphController.getLeaveCount = function (req, res) {
    var empCode = req.user[0].emp_code;
    var year = req.body.year | new Date().getFullYear();

    leaveHelper.fetchLeaveHistory(empCode, year, function (err, results) {
        async.forEach(results, function (result) {

        });
    })
};


module.exports = graphController;