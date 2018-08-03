var express = require('express');
var reimbursementCtr = require('../controllers/reimbursement');
var router = express.Router();

//creating inApp Notifications
router.get('/getReimbursement/:id/:type', reimbursementCtr.getReimbursement, function (req, res, next) {
    next();
});


router.post('/editReimbursement', reimbursementCtr.editReimbursement, function (req, res, next) {
    next();
});

router.get('/deleteReimbursement/:id/:type', reimbursementCtr.deleteReimbursement, function (req, res, next) {
    next();
});

router.post('/downloadHtmlToPdf', reimbursementCtr.downloadHtmlToPdf, function (req, res, next) {
    next();
});

module.exports = router;