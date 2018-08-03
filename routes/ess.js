var express = require('express');
var router = express.Router();
var essController = require('../controllers/essController');

router.get('/getEssQue',essController.getEssQue ,function (res, req, next) {
    next();
});

router.post('/submitSurvey',essController.submitSurvey ,function (res, req, next) {
    next();
});

router.post('/submitReason',essController.submitReason ,function (res, req, next) {
    next();
});

router.get('/updatePoll/:refno/:poll', essController.updatePollFlag, function (res, req, next) {
    next();
});


module.exports = router;

