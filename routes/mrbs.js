var express = require('express');
var router = express.Router();
var mrbsCtr = require('../controllers/mrbsController');


router.post('/bookRoom', mrbsCtr.bookRoom, function (res, req, next) {
    next();
});

router.get('/getRoomNames', mrbsCtr.getRoomNames, function (res, req, next) {
    next();
});

router.get('/getArea', mrbsCtr.getArea, function (res, req, next) {
    next();
});




module.exports = router;
