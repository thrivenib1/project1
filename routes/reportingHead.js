var express = require('express');
var router = express.Router();
var reportingHeadController = require('../controllers/reportingHeadController');


router.get('/empUnderReportingHead', reportingHeadController.empUnderReportingHead, function (req, res, next) {
    next();
});


router.post('/approveLeave', reportingHeadController.approveLeave, function (req, res, next) {
    next();
});

router.post('/rejectLeave', reportingHeadController.rejectLeave, function (req, res, next) {
    next();
});

router.post('/leavesToApprove', reportingHeadController.leavesToApprove, function (req, res, next) {
    next();
});

module.exports = router;