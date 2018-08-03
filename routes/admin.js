var express = require('express');
var router = express.Router();
var adminCtr = require('../controllers/adminController');


router.get('/allowReimbursement', adminCtr.allowReimbursement, function (res, req, next) {
    next();
});

router.get('/blockReimbursement', adminCtr.blockReimbursement, function (res, req, next) {
    next();
});


module.exports = router;