var express = require('express');
var router = express.Router();
var empCtr = require('../controllers/empController');


router.get('/fetchAllEmp', empCtr.fetchAllEmp, function (res, req, next) {
    next();
});




module.exports = router;