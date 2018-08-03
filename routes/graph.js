var express = require('express');
var router = express.Router();
var graphController = require('../controllers/graphController');


router.get('/getLeaveCount', graphController.getLeaveCount, function (req, res, next) {
    next();
});


module.exports = router;

