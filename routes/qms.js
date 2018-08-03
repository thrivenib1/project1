var express = require('express');
var router = express.Router();
var logger = require('../services/loggerService').infoLog;
var url = require('../public/QMS/QMSConstants');
var sessionHelper = require('../utils/sessionUtils');
var localStorage = require('localStorage');


router.get('/IMSWiki/login', function (req, res) {
    res.render("login.html");
});


router.get('/IMSWiki/imswiki', function (req, res) {
    res.render("imswiki.html");
});

router.get('/IMSWiki/imswiki/v4.00', function (req, res) {
    res.render("imswiki.html");
});

//router.get('/IMSWiki/QMS', function (req, res) {
//    res.render("QMS/pages/QMSDashboard.html");
//});

router.post('/qms/:filename', function (req, res) {
    var filename = req.params.filename;
    res.render(url[filename]);
});


//var $ = jQuery = require('jquery')(window);
var fs = require("fs");

router.get('/IMSWiki/:filename', function (req, res) {
    console.log("req.params.filename ------------------------");
    console.log(req.params.filename);
    var filename = req.params.filename;
    console.log("req.params.filename ------------------------");

    //fs.readFile("/home/monica/Documents/IMSSWIKI/imsswiki/IMSSWIKI/public/QMS/v4.00/HTML/QMS01_QM/Table of Contents.html", "utf8", function(err, data) {

    res.render("QMS/v4.00/HTML/QMS01_QM/"+filename);
    //});

    //res.render("QMS/v4.00/HTML/QMS01_QM/"+filename);

   //console.log($("#content"))


//console.log("before...................");

//    var dom = new JSDOM();
//    console.log(dom.window.document);
//    console.log(dom.window.document.location);
//    console.log(dom.window.document.location.href);
//
//   // console.log(dom.window.document.getElementById('content').load("QMS/v4.00/HTML/QMS01_QM/"+filename));
//    console.log("afterrrrrr...................");


});

router.get('/QMS03_PR/:filename', function (req, res) {
    console.log("req.params.filename ------------------------");
    console.log(req.params.filename);
    var filename = req.params.filename;
    console.log("req.params.filename ------------------------");
    res.render("v4.00/HTML/QMS03_PR/" + filename);
});


module.exports = router;