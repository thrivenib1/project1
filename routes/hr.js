var express = require('express');
var router = express.Router();
var hrController = require('../controllers/hrController');
var medicalReimbursementCtr = require('../controllers/medicalReimbursementController');
var petrolReimbursementCtr = require('../controllers/petrolReimbursementController');
var feedbackCtr = require('../controllers/feedbackController');


router.post('/getLeaveBalanceByYear', hrController.getLeaveBalanceByYear, function (res, req, next) {
    next();
});

router.post('/getLeaveBalanceByEmpNameAndDates', hrController.getLeaveBalanceByEmpNameAndDates, function (res, req, next) {
    next();
});

router.post('/getLeaveBalanceByEmployeeId', hrController.getLeaveBalanceByEmployeeId, function (res, req, next) {
    next();
});

router.post('/getLeaveBalanceBetweenDates', hrController.getLeaveBalanceBetweenDates, function (res, req, next) {
    next();
});

router.post('/creditOrDebitLeaves', hrController.creditOrDebitLeaves, function (req, res, next) {
    next();
});

router.post('/employeeList', hrController.getEmployeeList, function (req, res, next) {
    next();
});
//=============================== MEDICAL REIMBURSEMENT ============================================================

router.post('/addMedicalReimbursement', medicalReimbursementCtr.addMedicalReimbursement, function (req, res, next) {
    next();
});

router.get('/getMedicalListByEmpId', medicalReimbursementCtr.getMedicalListByEmpId, function (req, res, next) {
    next();
});

router.get('/submitMedicalReimbursement', medicalReimbursementCtr.addReferenceToMedicalReimbursement, function (req, res, next) {
    next();
});

router.get('/getMedicalListByRefNum/:refNumber', medicalReimbursementCtr.getMedicalListByReferenceNum, function (req, res, next) {
    next();
});

router.get('/getMedicalListByReferenceNumHR/:refNumber', medicalReimbursementCtr.getMedicalListByReferenceNumHR, function (req, res, next) {
    next();
});

router.get('/deleteMedicalReimbursement/:refNumber/:id', medicalReimbursementCtr.deleteMedicalReimbursement, function (req, res, next) {
    next();
});

router.get('/getUniqueMedicalList', medicalReimbursementCtr.getUniqueMedicalList, function (req, res, next) {
    next();
});

router.post('/editMedicalReimbursement', medicalReimbursementCtr.editMedicalReimbursement, function (req, res, next) {
    next();
});

router.post('/approveMedicalReimbursement', medicalReimbursementCtr.approveMedicalReimbursement, function (req, res, next) {
    next();
});

router.post('/addMedicalReimbForExistingModel', medicalReimbursementCtr.addMedicalReimbForExistingModel, function (req, res, next) {
    next();
});

router.post('/getMedicalByRefOrEmpcode', medicalReimbursementCtr.getAllMedicalRBYRefOrEmpcode, function (req, res, next) {
    next();
});

router.get('/getAllMedicalBill', medicalReimbursementCtr.getAllMedicalBill, function (req, res, next) {
    next();
});

//=============================== PETROL REIMBURSEMENT ============================================================

router.post('/addPetrolReimbursement', petrolReimbursementCtr.addPetrolReimbursement, function (req, res, next) {
    next();
});

router.get('/getPetrolListByEmpId', petrolReimbursementCtr.getPetrolListByEmpId, function (req, res, next) {
    next();
});

router.get('/submitPetrolReimbursement', petrolReimbursementCtr.addReferenceToPetrolReimbursement, function (req, res, next) {
    next();
});

router.get('/getPetrolListByRefNum/:refNumber', petrolReimbursementCtr.getPetrolListByReferenceNum, function (req, res, next) {
    next();
});

router.get('/getPetrolListByReferenceNumHR/:refNumber', petrolReimbursementCtr.getPetrolListByReferenceNumHR, function (req, res, next) {
    next();
});

router.get('/deletePetrolReimbursement/:refNumber/:id', petrolReimbursementCtr.deletePetrolReimbursement, function (req, res, next) {
    next();
});

router.post('/editPetrolReimbursement', petrolReimbursementCtr.editPetrolReimbursement, function (req, res, next) {
    next();
});

router.get('/getUniquePetrolList', petrolReimbursementCtr.getUniquePetrolList, function (req, res, next) {
    next();
});

router.post('/approvePetrolReimbursement', petrolReimbursementCtr.approvePetrolReimbursement, function (req, res, next) {
    next();
});

router.post('/addPetrolReimbForExistingModel', petrolReimbursementCtr.addPetrolReimbForExistingModel, function (req, res, next) {
    next();
});

router.get('/getAllPetrolBill', petrolReimbursementCtr.getAllPetrolBill, function (req, res, next) {
    next();
});


/*router.post('/getPetrolByRefOrEmpcode', petrolReimbursementCtr.getAllMedicalRBYRefOrEmpcode, function (req, res, next) {
    next();
});*/

//================================== FEEDBACK ===========================================================

router.get('/getAllFeedback', feedbackCtr.getAllFeedback, function (req, res, next) {
    next();
});


module.exports = router;