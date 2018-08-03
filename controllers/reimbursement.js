var pgSqlUtils = require('../utils/pgSqlUtils');
var pgSqlService = require('../services/pgSqlService');
var flashMessage = require('../utils/flashMessageUtils');
var Const = require('../utils/flashMessageStrings').CONST;
var Query = require('../utils/queryConstants');
var logger = require('../services/loggerService').infoLog;
var errLog = require('../services/loggerService').errorLog;
var utils = require('../utils/utils');
var medicalReimbursementModel = require('../schemas/medicalReimbursement');
var petrolReimbursementModel = require('../schemas/petrolReimbursement');
var async = require('async');
var fs = require('fs');
var pdf = require('html-pdf');
var pdfOptions = {format: 'Letter'};
var sendmail = require('../config/emailConfig').transporter;
var emailConfig = require('../config/emailConfig');
var nodeutil = require('util');

var reimbursementController = function () {
};


reimbursementController.getReimbursement = function (req, res) {
    var reimId = req.params.id;
    var reimType = req.params.type;

    if (!reimId || !reimType) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }

    if (reimType == 'medical') {

        medicalReimbursementModel.findOne({_id: reimId}, function (err, results) {
            if (err) {
                console.log("-------------------------------------");
                console.log(err);
                errLog.err("error in reimbursementController.getReimbursement");
                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
            } else {
                logger.info("success in reimbursementController.getReimbursement");
                return res.json(flashMessage.success(Const.SUCCESS, {
                    Result: results,
                    Token: req.user[0].token
                }));
            }
        })

    } else if (reimType == 'petrol') {

        petrolReimbursementModel.findOne({_id: reimId}, function (err, results) {
            if (err) {
                errLog.err("error in reimbursementController.getReimbursement");
                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
            } else {
                logger.info("success in reimbursementController.getReimbursement");
                return res.json(flashMessage.success(Const.SUCCESS, {
                    Result: results,
                    Token: req.user[0].token
                }));
            }
        })

    } else {
        return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
    }


};

reimbursementController.editReimbursement = function (req, res) {
    var reimId = req.body.id;
    var reimType = req.body.type;
    var billDate = req.body.billDate;
    var billNumber = req.body.billNumber;
    var amount = req.body.amount;

    
    if (!reimId || !reimType || !billDate || !billNumber ||!amount) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }

    if (reimType == 'medical') {

        medicalReimbursementModel.update({_id: reimId}, {
            $set: {
                billDate: billDate,
                billNumber: billNumber,
                amount: amount
            }
        }, function (err, results) {
            if (err) {
                errLog.err("Error in reimbursementController.editReimbursement" + err);
                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
            } else {
                logger.info("success in reimbursementController.editReimbursement");
                return res.json(flashMessage.success(Const.SUCCESS, {
                    Result: results,
                    Token: req.user[0].token
                }));
            }
        })

    } else if (reimType == 'petrol') {
        petrolReimbursementModel.update({_id: reimId}, {
            $set: {
                billDate: billDate,
                billNumber: billNumber,
                amount: amount
            }
        }, function (err, results) {
            if (err) {
                errLog.err("Error in reimbursementController.editReimbursement" + err);
                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
            } else {
                logger.info("success in reimbursementController.editReimbursement");
                return res.json(flashMessage.success(Const.SUCCESS, {
                    Result: results,
                    Token: req.user[0].token
                }));
            }
        })
    } else {
        return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
    }
};

reimbursementController.deleteReimbursement = function (req, res) {
    var reimId = req.params.id;
    var reimType = req.params.type;

    if (!reimId || !reimType) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }

    if (reimType == 'medical') {

        medicalReimbursementModel.remove({
            $and: [{
                _id: reimId
            }]
        }, function (err, results) {
            if (err) {
                errLog.err("error in reimbursementController.deleteReimbursement");
                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
            } else {
                logger.info("success in reimbursementController.deleteReimbursement");
                return res.json(flashMessage.success(Const.SUCCESS, {
                    Result: results,
                    Token: req.user[0].token
                }));
            }
        })

    } else if (reimType == 'petrol') {
        petrolReimbursementModel.remove({
            $and: [{
                _id: reimId
            }]
        }, function (err, results) {
            if (err) {
                errLog.err("error in deletePetrolReimbursement");
                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
            } else {
                logger.info("success in deletePetrolReimbursement");
                return res.json(flashMessage.success(Const.SUCCESS, {
                    Result: results,
                    Token: req.user[0].token
                }));
            }
        })
    }else{
        return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
    }
};


reimbursementController.downloadHtmlToPdf = function (req, res) {

    var persons = req.body.inputHtml;
     logger.info("inside downloadPdf  =========================");
     logger.info(req.body);
    logger.info("inside downloadPdf  =========================");
   // var persons = [{"amount":"641","billNumber":"Gs","billDate":"2017-08-18"},{"amount":"6415","billNumber":"Gs5","billDate":"2017-08-19"}];
    persons = JSON.parse(persons);
    var table = "";
    for (var i = 0; i < persons.length; i++) {
        console.log(persons[i]);
        console.log(persons[i].billDate);
        table +="<tr>";table +="<td>"+persons[i].amount+"</td>";
        table +="<td>"+persons[i].billNumber+"</td>";
        table +="<td>"+persons[i].billDate+"</td>";
        table +="</tr>";
        }
    var t =  nodeutil.format("<!DOCTYPE html><html><head> <style>table { border-collapse: collapse; } table, td, th { border: 1px solid black; } thead.table_head { text-align: center; background-color: #f1871c; color: #fff; } th { padding-left: 0px; padding-right: 0px; } .table > thead > tr > th { padding: 8px 15px 8px 15px; line-height: 1.42857143; vertical-align: top; text-align: center; } table > tbody > tr > td { padding: 8px 15px 8px 15px; line-height: 1.42857143; vertical-align: top; text-align: center; }</style></head><body><div class=\\\"header\\\"></div><div class=\\\"main-content\\\" style=\\\"text-align:center\\\"> <table class=\\\"table table-bordered\\ \" style=\\\"margin-top:3%;margin-left:37%\\\"> <thead class=\\\"table_head\\\"> <tr> <th class=\\\"table_th\\\">Date</th> <th class=\\\"table_th\\\">Amount</th> <th class=\\\"table_th\\\">Bill No</th> </tr> </thead> <tbody class=\\\"tbodyAddBill\\\" id=\\\"tbodyAddBill\\\">%s</tbody> </table></div></body></html>",table);
    var htmlInput = t;

    logger.info(t);
    logger.info("html--------------------");

    var empEmail = req.user[0].login.trim() + emailConfig.ssplDomain + "," + req.user[0].login.trim() + emailConfig.splDomain + "";


  //  var html = "<!DOCTYPE html><html><head><style>table { border-collapse: collapse;}table, td, th { border: 1px solid black;}thead.table_head{text-align: center;background-color: #f1871c; color: #fff;}th { padding-left: 0px;padding-right: 0px;}.table>thead>tr>th {padding: 8px 15px 8px 15px;line-height: 1.42857143;vertical-align: top;text-align: center;}table>tbody>tr>td {padding: 8px 15px 8px 15px;line-height: 1.42857143;vertical-align: top;text-align: center;}</style></head><body><div class=\"header\"></div><div class=\"main-content\" style=\"text-align:center\"><table class=\"table table-bordered\" style=\"margin-top:3%;margin-left:37%\"> <thead class=\"table_head\"> <tr> <th class=\"table_th\">Date </th> <th class=\"table_th\">Amount </th> <th class=\"table_th\">Bill No </th></tr> </thead> <tbody class=\"tbodyAddBill\" id=\"tbodyAddBill\"> </tbody> </table></div></body><script>var persons = [{\"amount\":\"641\",\"billNumber\":\"Gs\",\"billDate\":\"2017-08-18\"},{\"amount\":\"641\",\"billNumber\":\"Gs\",\"billDate\":\"2017-08-18\"},{\"amount\":\"641\",\"billNumber\":\"Gs\",\"billDate\":\"2017-08-18\"},{\"amount\":\"641\",\"billNumber\":\"Gs\",\"billDate\":\"2017-08-18\"},{\"amount\":\"641\",\"billNumber\":\"Gs\",\"billDate\":\"2017-08-18\"}];console.log(persons);var html = \"\";for (var i = 0; i < persons.length; i++) {console.log(persons[i].billDate);html +=\"<tr>\";html +=\"<td>\"+persons[i].amount+\"</td>\";html +=\"<td>\"+persons[i].billNumber+\"</td>\";html +=\"<td>\"+persons[i].billDate+\"</td>\";html +=\"</tr>\";}document.getElementById(\"tbodyAddBill\").innerHTML = html;</script></html>";
    var empId = req.user[0].emp_code_entered.trim();

    pdf.create(htmlInput, pdfOptions).toFile('./' + empId + '.pdf', function (err, result) {
        if (err) {
            console.log("Inside Error");
            console.log(err);
            return res.json("Error in PDF Create",JSON.stringify(err), {Token: req.user[0].token});
        } else {
            logger.info("pdf info ------------");
            logger.info(emailConfig.defaultFromMailId);
            logger.info(empEmail);
            logger.info(emailConfig.defaultHrEmail);
            logger.info("pdf info ------------");

            var mailForEmpAndHr = {
                text: "Hi "+req.user[0].login.trim()+" Please find attached reimbursement copy ",
                from: emailConfig.defaultFromMailId,//"monicak@integramicro.co.in",//iLTS emailConfig.defaultFromMailId
                to: empEmail,//empEmail,//"monicak@integramicro.co.in",//emp
                cc: emailConfig.defaultHrEmail,//emailConfig.defaultHrEmail,//"monicak@integramicro.co.in",//HR  emailConfig.defaultHrEmail
                subject: "Reimbursement For The Current Quarter",
                attachment:
                    [
                        {path: './' + empId + '.pdf', name: 'reimbursement.pdf'}]
            };
            sendmail.send(mailForEmpAndHr, function (err, message) {
                if (err) {
                    console.log("inside Error >> " + err);
                    //return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG,JSON.stringify(err), {Token: req.user[0].token}));
                    return res.json("Error while sending email",JSON.stringify(err), {Token: req.user[0].token});
                } else {
                    console.log("inside Success >> " + JSON.stringify(message));
                    fs.exists('./' + empId + '.pdf', function (exists) {
                        if (exists) {
                            console.log('File exists. Deleting now ...');
                            fs.unlink('./' + empId + '.pdf', function (err) {
                                if (err) {
                                    console.log("Error in fs unlink " + err);
                                    return res.json("Error in fs.unlink",JSON.stringify(err), {Token: req.user[0].token});
                                    //return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG,JSON.stringify(err), {Token: req.user[0].token}));
                                }
                                console.log("fs unlink success");
                                return res.json(flashMessage.success(Const.SUCCESS, {
                                    Result: message,
                                    Token: req.user[0].token
                                }));

                            });
                        } else {
                            console.log('File not found, so not deleting.');
                            return res.json(flashMessage.success(Const.SUCCESS, {
                                Result: message,
                                Token: req.user[0].token
                            }));
                        }
                    });
                }
            });
        }
    });
};

module.exports = reimbursementController;
