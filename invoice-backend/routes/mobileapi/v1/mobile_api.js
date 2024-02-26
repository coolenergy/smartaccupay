var express = require('express');
var router = express.Router();

let common = require("./../../../controller/common/common");

// Auth
var authController = require('./auth/authController');
var authValidation = require('./auth/authValidation');
router.post('/mobile/v1/auth/login', authValidation.login, authController.login);
router.post("/mobile/v1/auth/sendotp", authValidation.sendOTPforLoginValidation, authController.sendOTPforLogin);
router.post("/mobile/v1/auth/submitotp", authValidation.submitEmailOTPforLoginValidation, authController.submitEmailOTPforLogin);
router.post("/mobile/v1/auth/changepassword", authValidation.changePasswordValidation, authController.changePassword);
router.post("/mobile/v1/auth/forgetpassword", authValidation.forgetPasswordValidation, authController.forgetPassword);
router.get("/mobile/v1/auth/getprofile", common.checkTokenExistOrNot, authController.getProfile);
router.post("/mobile/v1/auth/updateuser", common.checkTokenExistOrNot, authController.updateUser);
router.post("/mobile/v1/auth/userlogout", common.checkTokenExistOrNot, authController.userLogout);
router.post("/mobile/v1/auth/savelogindetails", common.checkTokenExistOrNot, authController.saveLoginDetails);
router.post('/mobile/v1/auth/helpmail', authValidation.helpMail, authController.helpMail);
router.post('/mobile/v1/auth/getlogincompanylist', authValidation.getLoginCompanyList, authController.getLoginCompanyList);
router.post('/mobile/v1/auth/sendemailotp', authValidation.sendEmailOTP, authController.sendEmailOTP);
router.post('/mobile/v1/auth/submitemailotp', authValidation.submitEmailOTP, authController.submitEmailOTP);
router.post('/mobile/v1/auth/loginwithemailotp', authValidation.loginWithEmailOTP, authController.loginWithEmailOTP);
router.post('/mobile/v1/auth/emailforgotpassword', authValidation.emailForgotPassword, authController.emailForgotPassword);
router.post('/mobile/v1/auth/sendemailforgotpassword', authValidation.sendEmailForgotPassword, authController.sendEmailForgotPassword);
router.post('/mobile/v1/auth/getmycompanylist', authValidation.getMyCompanyList, authController.getMyCompanyList);
router.get('/mobile/v1/auth/getuserlist', authController.getUserList);

// Invoice
var invoiceController = require('./invoices/invoiceController');
var invoiceValidation = require('./invoices/invoiceValidation');
router.get('/mobile/v1/invoice/getlist', common.checkTokenExistOrNot, invoiceController.getInvoiceList);
router.post('/mobile/v1/invoice/getstatuswise', common.checkTokenExistOrNot, invoiceValidation.getStatusWiseInvoice, invoiceController.getStatusWiseInvoice);
router.post('/mobile/v1/invoice/getone', common.checkTokenExistOrNot, invoiceValidation.getOneInvoice, invoiceController.getOneInvoice);
router.post('/mobile/v1/invoice/updatestatus', common.checkTokenExistOrNot, invoiceValidation.updateInvoiceStatus, invoiceController.updateInvoiceStatus);
router.post('/mobile/v1/invoice/savenote', common.checkTokenExistOrNot, invoiceValidation.saveInvoiceNotes, invoiceController.saveInvoiceNotes);
router.post('/mobile/v1/invoice/deletenote', common.checkTokenExistOrNot, invoiceValidation.deleteInvoiceNote, invoiceController.deleteInvoiceNote);
router.post('/mobile/v1/invoice/updateattachment', common.checkTokenExistOrNot, invoiceValidation.saveInvoiceAttachment, invoiceController.saveInvoiceAttachment);
router.post('/mobile/v1/invoice/packing_slip/savenote', common.checkTokenExistOrNot, invoiceValidation.savePackingSlipNotes, invoiceController.savePackingSlipNotes);
router.post('/mobile/v1/invoice/packing_slip/deletenote', common.checkTokenExistOrNot, invoiceValidation.deletePackingSlipNote, invoiceController.deletePackingSlipNote);
router.post('/mobile/v1/invoice/packing_slip/updateattachment', common.checkTokenExistOrNot, invoiceValidation.savePackingSlipAttachment, invoiceController.savePackingSlipAttachment);
router.post('/mobile/v1/invoice/receivingslip/savenote', common.checkTokenExistOrNot, invoiceValidation.saveReceivingSlipNotes, invoiceController.saveReceivingSlipNotes);
router.post('/mobile/v1/invoice/receivingslip/deletenote', common.checkTokenExistOrNot, invoiceValidation.deleteReceivingSlipNote, invoiceController.deleteReceivingSlipNote);
router.post('/mobile/v1/invoice/receivingslip/updateattachment', common.checkTokenExistOrNot, invoiceValidation.saveReceivingSlipAttachment, invoiceController.saveReceivingSlipAttachment);
router.post('/mobile/v1/invoice/po/savenote', common.checkTokenExistOrNot, invoiceValidation.savePONotes, invoiceController.savePONotes);
router.post('/mobile/v1/invoice/po/deletenote', common.checkTokenExistOrNot, invoiceValidation.deletePONote, invoiceController.deletePONote);
router.post('/mobile/v1/invoice/po/updateattachment', common.checkTokenExistOrNot, invoiceValidation.savePOAttachment, invoiceController.savePOAttachment);
router.post('/mobile/v1/invoice/quote/savenote', common.checkTokenExistOrNot, invoiceValidation.saveQuoteNotes, invoiceController.saveQuoteNotes);
router.post('/mobile/v1/invoice/quote/deletenote', common.checkTokenExistOrNot, invoiceValidation.deleteQuoteNote, invoiceController.deleteQuoteNote);
router.post('/mobile/v1/invoice/quote/updateattachment', common.checkTokenExistOrNot, invoiceValidation.saveQuoteAttachment, invoiceController.saveQuoteAttachment);

// Recent Activity
let recentActivityController = require('./recent_activity/recentActivityController');
router.post('/mobile/v1/recentactivity/get', common.checkTokenExistOrNot, recentActivityController.getRecentActivity);

// GIF Loader
let gifLoaderController = require('./gif_loader/gifLoaderController');
let gifLoaderValidation = require('./gif_loader/gifLoaderValidation');
router.get('/mobile/v1/getgifloader', gifLoaderController.getGIFLoader);

// Invoice Alert
let alertController = require("./alert/alertController");
let alertValidation = require("./alert/alertValidation");
router.post('/mobile/v1/alert/getall', common.checkTokenExistOrNot, alertController.getAllAlert);
router.post('/mobile/v1/alert/save', common.checkTokenExistOrNot, alertController.saveAlert);
router.post('/mobile/v1/alert/update', common.checkTokenExistOrNot, alertController.updateAlert);
router.post('/mobile/v1/alert/updateall', common.checkTokenExistOrNot, alertController.updateAllAlert);

// AP Invoice
let apInvoiceController = require('./ap_invoice/apInvoiceController');
let apInvoiceValidation = require('./ap_invoice/apInvoiceValidation');
router.get('/mobile/v1/apinvoice/get', common.checkTokenExistOrNot, apInvoiceController.getAPInvoice);
router.post('/mobile/v1/apinvoice/getstatuswise', common.checkTokenExistOrNot, apInvoiceValidation.getStatusWiseAPInvoice, apInvoiceController.getStatusWiseAPInvoice);
router.post('/mobile/v1/apinvoice/getone', common.checkTokenExistOrNot, apInvoiceValidation.getOneAPInvoice, apInvoiceController.getOneAPInvoice);
router.post('/mobile/v1/apinvoice/save', common.checkTokenExistOrNot, apInvoiceController.saveAPInvoice);
router.post('/mobile/v1/apinvoice/delete', common.checkTokenExistOrNot, apInvoiceValidation.deleteAPInvoice, apInvoiceController.deleteAPInvoice);
router.post('/mobile/v1/apinvoice/savenote', common.checkTokenExistOrNot, apInvoiceValidation.saveAPInvoiceNote, apInvoiceController.saveAPInvoiceNote);
router.post('/mobile/v1/apinvoice/deletenote', common.checkTokenExistOrNot, apInvoiceValidation.deleteAPInvoiceNote, apInvoiceController.deleteAPInvoiceNote);
router.post('/mobile/v1/apinvoice/gethistory', common.checkTokenExistOrNot, apInvoiceController.getAPInvoiceHistory);

let invoiceMessageController = require('./invoice_message/invoiceMessageController');
let invoiceMessageValidation = require('./invoice_message/invoiceMessageValidation');
router.get('/mobile/v1/invoicemessage/getcount', common.checkTokenExistOrNot, invoiceMessageController.getInvoiceMessageCount);
router.get('/mobile/v1/invoicemessage/get', common.checkTokenExistOrNot, invoiceMessageController.getInvoiceMessageForTable);
router.post('/mobile/v1/invoicemessage/getone', common.checkTokenExistOrNot, invoiceMessageValidation.getOneInvoiceMessage, invoiceMessageController.getOneInvoiceMessage);
router.get('/mobile/v1/invoicemessage/updateseenflag', common.checkTokenExistOrNot, invoiceMessageController.updateInvoiceMessageSeenFlag);
router.post('/mobile/v1/invoicemessage/sendemessage', common.checkTokenExistOrNot, invoiceMessageValidation.sendInvoiceMessage, invoiceMessageController.sendInvoiceMessage);
router.post('/mobile/v1/invoicemessage/delete', common.checkTokenExistOrNot, invoiceMessageValidation.deleteInvoiceMessage, invoiceMessageController.deleteInvoiceMessage);

module.exports = router;