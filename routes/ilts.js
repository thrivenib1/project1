var express = require('express');
var router = express.Router();
var logger = require('../services/loggerService').infoLog;
var url = require('../public/QMS/QMSConstants');

var sessionHelper = require('../utils/sessionUtils');
var localStorage = require('localStorage');


//router.get('/ILTS', function (req, res) {
//    res.render("ILTS/ILTSDashboard.html");
//});
//
//
//
//router.post('/ilts/:filename', function (req, res) {
//    logger.info("here -----------");
//    var filename = req.params.filename;
//    res.render(url[filename]);
//});

router.post('/qms/:filename', function (req, res) {
    logger.info("here -----------");
    logger.info("token >>>>>>>>> "+req.body);
    var filename = req.params.filename;
    res.render(url[filename]);
});





module.exports = router;
