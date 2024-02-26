var express = require('express');
var router = express.Router();
var common = require("./../../../../controller/common/common");

var authController = require('./auth/authController');
var authValidation = require('./auth/authValidation');
router.post('/webapi/v1/login', authValidation.login, authController.login);
router.get('/webapi/v1/getprofile', authController.getProfile);
router.post('/webapi/v1/changepassword', authValidation.changePasswordValidation, authController.changepassword);
router.post('/webapi/v1/savelogindetails', common.checkTokenExistOrNot, authController.savelogindetails);
router.post('/webapi/v1/userlogout', authController.userlogout);
router.post('/webapi/v1/forgetpassword', authController.forgetpassword);
router.post('/webapi/v1/senduserpassword', authValidation.sendUserPasswordValidation, authController.sendUserPassword);
router.post('/webapi/v1/getcompanysetting', authValidation.getCompanySetting, authController.getCompanySetting);
router.post('/webapi/v1/sendotp', authValidation.sendOTP, authController.sendOTP);
router.post('/webapi/v1/submitotp', authValidation.submitOTP, authController.submitOTP);
router.post('/webapi/v1/view_capture', authController.view_capture);
router.post('/webapi/v1/get_view_capture', authController.get_view_capture);
router.post('/webapi/v1/getlogincompanylist', authValidation.getLoginCompanyList, authController.getLoginCompanyList);
router.post('/webapi/v1/sendemailotp', authValidation.sendEmailOTP, authController.sendEmailOTP);
router.post('/webapi/v1/submitemailotp', authValidation.submitEmailOTP, authController.submitEmailOTP);
router.post('/webapi/v1/loginwithemailotp', authValidation.loginWithEmailOTP, authController.loginWithEmailOTP);
router.post('/webapi/v1/emailforgotpassword', authValidation.emailForgotPassword, authController.emailForgotPassword);
router.post('/webapi/v1/sendemailforgotpassword', authValidation.sendEmailForgotPassword, authController.sendEmailForgotPassword);
router.post('/webapi/v1/getmycompanylist', authValidation.getMyCompanyList, authController.getMyCompanyList);

var companySizeController = require('./company_size/companySizeController');
var companySizeValidation = require('./company_size/companySizeValidation');
router.post('/webapi/v1/getcompanysizeocpr', companySizeController.getCompanySizeOcpr);
router.get('/webapi/v1/getcompanysize', common.checkTokenExistOrNot, companySizeController.getCompanySize);
router.post('/webapi/v1/savecompanysize', common.checkTokenExistOrNot, companySizeValidation.saveCompanySize, companySizeController.saveCompanySize);
router.post('/webapi/v1/deletecompanysize', common.checkTokenExistOrNot, companySizeValidation.deleteCompanySize, companySizeController.deleteCompanySize);
router.post('/webapi/v1/importcompanysize', common.checkTokenExistOrNot, companySizeController.importCompanySize);
router.get('/webapi/v1/exportcompanysize', common.checkTokenExistOrNot, companySizeController.exportCompanySize);



var companyTypeController = require('./company_type/companyTypeController');
var companyTypeValidation = require('./company_type/companyTypeValidation');
router.post('/webapi/v1/getcompanytypeocpr', companyTypeController.getCompanyTypeOcpr);
router.get('/webapi/v1/getcompanytype', common.checkTokenExistOrNot, companyTypeController.getCompanyType);
router.post('/webapi/v1/savecompanytype', common.checkTokenExistOrNot, companyTypeValidation.saveCompanyType, companyTypeController.saveCompanyType);
router.post('/webapi/v1/deletecompanytype', common.checkTokenExistOrNot, companyTypeValidation.deleteCompanyType, companyTypeController.deleteCompanyType);
router.post('/webapi/v1/importcompanytype', common.checkTokenExistOrNot, companyTypeController.importCompanyType);
router.get('/webapi/v1/exportcompanytype', common.checkTokenExistOrNot, companyTypeController.exportCompanyType);



var companyCodeController = require('./company_code/companyCodeController');
var companyCodeValidation = require('./company_code/companyCodeValidation');
router.post('/webapi/v1/getcompanycodeocpr', companyCodeValidation.getCompanyCodeOcpr, companyCodeController.getCompanyCodeOcpr);
router.get('/webapi/v1/getcompanycode', common.checkTokenExistOrNot, companyCodeController.getCompanyCode);
router.post('/webapi/v1/savecompanycode', common.checkTokenExistOrNot, companyCodeValidation.saveCompanyCode, companyCodeController.saveCompanyCode);
router.post('/webapi/v1/deletecompanycode', common.checkTokenExistOrNot, companyCodeValidation.deleteCompanyCode, companyCodeController.deleteCompanyCode);
router.post('/webapi/v1/getdatatablecompanycode', common.checkTokenExistOrNot, companyCodeController.getCompanyCodeDatatables);
router.post('/webapi/v1/getonecompanycode', common.checkTokenExistOrNot, companyCodeController.getOneCompanyCode);
router.post('/webapi/v1/importcompnaycode', common.checkTokenExistOrNot, companyCodeController.importCompnayCode);
router.get('/webapi/v1/exportcompnaycode', common.checkTokenExistOrNot, companyCodeController.exportcompnaycode);


var companyMinorityCodeController = require('./company_minority_code/companyMinorityCodeController');
var companyMinorityCodeValidation = require('./company_minority_code/companyMinorityCodeValidation');
router.post('/webapi/v1/getcompanyminoritycodeocpr', companyMinorityCodeController.getCompanyMinorityCodeOCPR);
router.get('/webapi/v1/getcompanyminoritycode', companyMinorityCodeController.getCompanyMinorityCode);
router.post('/webapi/v1/savecompanyminoritycode', common.checkTokenExistOrNot, companyMinorityCodeValidation.saveCompanyMinorityCode, companyMinorityCodeController.saveCompanyMinorityCode);
router.post('/webapi/v1/deletecompanyminoritycode', common.checkTokenExistOrNot, companyMinorityCodeValidation.deleteCompanyMinorityCode, companyMinorityCodeController.deleteCompanyMinorityCode);
router.post('/webapi/v1/importminoritytype', common.checkTokenExistOrNot, companyMinorityCodeController.importMinorityType);
router.get('/webapi/v1/exportminoritytype', common.checkTokenExistOrNot, companyMinorityCodeController.exportMinorityType);


var saveAttechment = require("./../../../../controller/common/saveAttechment");
router.post('/webapi/v1/saveimagesinwasabiv2', saveAttechment.saveImagesInWasabiV2);
router.post('/webapi/v1/saveAttechment', saveAttechment.saveAttechment);
router.post('/webapi/v1/saveAttechmentv2', saveAttechment.saveAttechmentV2);

var quickBookController = require('./quickbook/quickbookController');
var quickBookValidation = require('./quickbook/quickbookValidation');
router.post('/webapi/v1/savequickbookinfo', common.checkTokenExistOrNot, quickBookValidation.savequickBookValidation, quickBookController.savequickBookInfo);
router.post('/webapi/v1/quickbookslogout', common.checkTokenExistOrNot, quickBookController.logout);
router.post('/webapi/v1/isConnecttoQBO', common.checkTokenExistOrNot, quickBookValidation.isConnecttoQBOValidation, quickBookController.isConnectToQBO);
router.post('/webapi/v1/callback/', quickBookController.callback);

var signatureUpload = require("./../../../../controller/common/signatureUpload");
router.post('/webapi/v1/savesignaturewasabiv2', signatureUpload.saveSignatureWasabiv2);

var csiDivisionController = require("./csi_division/csiDivisionController");
var csiDivisionValidation = require("./csi_division/csiDivisionValidation");
router.post('/webapi/v1/getcsidivisionocpr', csiDivisionController.getCSIDivisionOcpr);
router.get('/webapi/v1/getcsidivision', common.checkTokenExistOrNot, csiDivisionController.getCSIDivision);
router.post('/webapi/v1/savecsidivision', common.checkTokenExistOrNot, csiDivisionValidation.saveCSIDivision, csiDivisionController.saveCSIDivision);
router.post('/webapi/v1/deletecsidivision', common.checkTokenExistOrNot, csiDivisionValidation.deleteCSIDivision, csiDivisionController.deleteCSIDivision);
router.post('/webapi/v1/importcsidivision', common.checkTokenExistOrNot, csiDivisionController.importCSIDivision);
router.get('/webapi/v1/exportcsidivision', common.checkTokenExistOrNot, csiDivisionController.exportCSIDivision);

var documentTypeController = require("./document_types/documentTypesController");
var documentTypeValidation = require("./document_types/documentTypesValidation");
router.get('/webapi/v1/getdocumenttype', common.checkTokenExistOrNot, documentTypeController.getDocumentType);
router.post('/webapi/v1/savedocumenttype', common.checkTokenExistOrNot, documentTypeValidation.saveDocumentType, documentTypeController.saveDocumentType);
router.post('/webapi/v1/deletedocumenttype', common.checkTokenExistOrNot, documentTypeValidation.deleteDocumentType, documentTypeController.deleteDocumentType);
router.post('/webapi/v1/getdocumenttypeocpr', documentTypeController.getDocumentTypeOcpr);
router.post('/webapi/v1/importdocumenttype', documentTypeController.importDocumentType);
router.get('/webapi/v1/exportdocumenttype', documentTypeController.exportDocumentType);

var company_othersettingController = require("./company_othersetting/company_othersettingController");
var company_othersettingValidation = require("./company_othersetting/company_othersettingValidation");
var otherSettingCron = require("./company_othersetting/otherSettingCron");
router.get('/webapi/v1/compnayinformation', common.checkTokenExistOrNot, company_othersettingController.compnayinformation);
router.get('/webapi/v1/portal/compnaysmtp', common.checkTokenExistOrNot, company_othersettingController.compnaysmtp);
router.post('/webapi/v1/editcompany', common.checkTokenExistOrNot, company_othersettingController.editCompany);
router.post('/webapi/v1/compnayupdatesmtp', common.checkTokenExistOrNot, company_othersettingValidation.smtpUpdateValidation, company_othersettingController.compnayupdatesmtp);
router.post('/webapi/v1/compnayverifysmtp', common.checkTokenExistOrNot, company_othersettingValidation.smtpUpdateValidation, company_othersettingController.compnayverifysmtp);
router.post('/webapi/v1/sendiframecode', common.checkTokenExistOrNot, company_othersettingValidation.sendIframeCode, company_othersettingController.sendIframeCode);
router.get('/webapi/v1/portal/compnayusage', common.checkTokenExistOrNot, company_othersettingController.compnayUsage);
router.post('/webapi/v1/portal/getcustomerstatesdatatable', common.checkTokenExistOrNot, company_othersettingController.getCustomerStatesDatatable);
router.get('/webapi/v1/portal/getapapicount', common.checkTokenExistOrNot, company_othersettingController.getAPAPICount);
router.get('/webapi/v1/portal/customerMonthlyState', common.checkTokenExistOrNot, otherSettingCron.customerMonthlyState);
router.get('/webapi/v1/portal/getCustomerStates', common.checkTokenExistOrNot, company_othersettingController.getCustomerStates);


var employeeController = require('./employee/employeeController');
var employeeValidation = require('./employee/employeeValidation');
router.get('/webapi/v1/portal/getalluserlist', common.checkTokenExistOrNot, employeeController.getAllUserList);
router.post('/webapi/v1/portal/getspecificusers', common.checkTokenExistOrNot, employeeController.getSpecificUsers);
router.post('/webapi/v1/portal/saveemployee', common.checkTokenExistOrNot, employeeController.saveEmployee);
router.post('/webapi/v1/portal/saveuserdocument', common.checkTokenExistOrNot, employeeController.saveUserDocument);
router.post('/webapi/v1/portal/getuserdocumenthistory', common.checkTokenExistOrNot, employeeController.getUserDocumentHistory);
router.get('/webapi/v1/portal/getalluser', common.checkTokenExistOrNot, employeeController.getAllUser);
router.post('/webapi/v1/portal/getalluserhistory', common.checkTokenExistOrNot, employeeController.getAllUserHistory);
router.post('/webapi/v1/portal/getuserhistory', common.checkTokenExistOrNot, employeeController.getUserHistory);
router.post('/webapi/v1/portal/getoneuser', common.checkTokenExistOrNot, employeeController.getOneUser);
router.post('/webapi/v1/portal/savepersonalinfo', common.checkTokenExistOrNot, employeeController.savePersonalInfo);
router.post('/webapi/v1/portal/savemobilephoto', common.checkTokenExistOrNot, employeeController.saveMobilePhoto);
router.post('/webapi/v1/portal/savecontactinfo', common.checkTokenExistOrNot, employeeController.saveContactInfo);
router.post('/webapi/v1/portal/saveemployeeinfo', common.checkTokenExistOrNot, employeeController.saveEmployeeInfo);
router.post('/webapi/v1/portal/deleteteammember', common.checkTokenExistOrNot, employeeController.deleteTeamMember);
router.post('/webapi/v1/portal/sendappinvitation', common.checkTokenExistOrNot, employeeValidation.sendAppInvitationValidation, employeeController.sendappinvitation);
router.post('/webapi/v1/portal/senddocumentexpiration', common.checkTokenExistOrNot, employeeValidation.sendDocumentExpirationValidation, employeeController.senddocumentexpiration);
router.post('/webapi/v1/portal/saveusersignature', common.checkTokenExistOrNot, employeeValidation.saveSignatureValidation, employeeController.savesignature);
router.get('/webapi/v1/portal/tempAddUserAsProjectProjectWorker', common.checkTokenExistOrNot, employeeController.tempAddUserAsProjectProjectWorker);
router.post('/webapi/v1/portal/updateshowidcardflag', common.checkTokenExistOrNot, employeeValidation.userIdCardFlagUpdateValidation, employeeController.updateShowIDCardFlag);
// router.post('/webapi/v1/portal/getsupplierprojectofuserdatatables', common.checkTokenExistOrNot, employeeController.getSupplierProjectOfUserDatatables);
router.post('/webapi/v1/portal/getallemployeereport', common.checkTokenExistOrNot, employeeController.getAllEmployeeReport);
router.post('/webapi/v1/portal/importemployees', common.checkTokenExistOrNot, employeeController.importEmployees);
router.post('/webapi/v1/portal/checkandinsertimportdata', common.checkTokenExistOrNot, employeeController.checkAndInsertImportData);
router.get('/webapi/v1/portal/getarchiveteams', common.checkTokenExistOrNot, employeeController.getarchiveteams);
router.post('/webapi/v1/portal/recoverteam', common.checkTokenExistOrNot, employeeController.recoverteam);
router.get('/webapi/v1/portal/listManagementUser', common.checkTokenExistOrNot, employeeController.listManagementUser);
router.post('/webapi/v1/portal/importManagementUser', common.checkTokenExistOrNot, employeeController.importManagementUser);
router.post('/webapi/v1/portal/getUserForTable', common.checkTokenExistOrNot, employeeValidation.getUserForTableValidation, employeeController.getUserForTable);
router.post('/webapi/v1/portal/updateUserStatus', common.checkTokenExistOrNot, employeeController.updateUserStatus);
router.post('/webapi/v1/portal/deleteMultipleTeamMember', common.checkTokenExistOrNot, employeeController.deleteMultipleTeamMember);
router.post('/webapi/v1/portal/updateMultipleUserStatus', common.checkTokenExistOrNot, employeeController.updateMultipleUserStatus);
router.post('/webapi/v1/portal/view_capture', common.checkTokenExistOrNot, employeeController.view_capture);
router.post('/webapi/v1/portal/get_view_capture', common.checkTokenExistOrNot, employeeController.get_view_capture);

let employeeCron = require("./employee/employeeCron");
router.post('/webapi/v1/portal/userdocumentexpiryalert', common.checkTokenExistOrNot, employeeCron.userDocumentExpiryAlert);
router.post('/webapi/v1/portal/useremergencycontactalertcron', common.checkTokenExistOrNot, employeeCron.userEmergencyContactAlertCron);

let payrollgroupController = require("./payrollgroup/payrollgroupController");
let payrollgroupValidation = require("./payrollgroup/payrollgroupValidation");
router.get('/webapi/v1/portal/getAllpayroll_group', common.checkTokenExistOrNot, payrollgroupController.getAllpayroll_group);
router.post('/webapi/v1/portal/savepayrollgroup', common.checkTokenExistOrNot, payrollgroupValidation.payrollgroupValidation, payrollgroupController.savePayrollgroup);
router.post('/webapi/v1/portal/deletepayrollgroup', common.checkTokenExistOrNot, payrollgroupValidation.payrollgroupDeleteValidation, payrollgroupController.deletePayrollgroup);

let jobtypeController = require('./jobtype/jobtypeController');
let jobtypeValidation = require('./jobtype/jobtypeValidation');
router.get('/webapi/v1/portal/getAlljobtype', common.checkTokenExistOrNot, jobtypeController.getAlljob_type);
router.post('/webapi/v1/portal/savejobtype', common.checkTokenExistOrNot, jobtypeValidation.jobTypeValidation, jobtypeController.savejobtype);
router.post('/webapi/v1/portal/deletejobtype', common.checkTokenExistOrNot, jobtypeValidation.jobTypeDeleteValidation, jobtypeController.deletejobtype);
router.post('/webapi/v1/portal/getjobtypefortable', common.checkTokenExistOrNot, jobtypeValidation.getjobtypeForTableValidation, jobtypeController.getJobTypeForTable);
router.post('/webapi/v1/portal/checkimportjobtype', common.checkTokenExistOrNot, jobtypeController.checkImportJobType);
router.post('/webapi/v1/portal/importjobtype', common.checkTokenExistOrNot, jobtypeController.importJobType);

let jobtitleController = require('./job_title/jobtitleController');
let jobtitleValidation = require('./job_title/jobtitleValidation');
router.get('/webapi/v1/portal/getAlljobtitle', common.checkTokenExistOrNot, jobtitleController.getAlljob_title);
router.post('/webapi/v1/portal/savejobtitle', common.checkTokenExistOrNot, jobtitleValidation.jobtitleValidation, jobtitleController.saveJobTitle);
router.post('/webapi/v1/portal/deletejobtitle', common.checkTokenExistOrNot, jobtitleValidation.jobtitleDeleteValidation, jobtitleController.deleteJobTitle);
router.post('/webapi/v1/portal/getjobtitlefortable', common.checkTokenExistOrNot, jobtitleValidation.getjobtitleForTableValidation, jobtitleController.getJobTitleForTable);
router.post('/webapi/v1/portal/checkimportjobtitle', common.checkTokenExistOrNot, jobtitleController.checkImportJobTitle);
router.post('/webapi/v1/portal/importjobtitle', common.checkTokenExistOrNot, jobtitleController.importJobTitle);


var departmentController = require("./department/departmentController");
var departmentValidation = require("./department/departmentValidation");
router.get('/webapi/v1/portal/getalldepartment', common.checkTokenExistOrNot, departmentController.getalldepartment);
router.post('/webapi/v1/portal/savedepartment', common.checkTokenExistOrNot, departmentValidation.departmentValidation, departmentController.savedepartment);
router.post('/webapi/v1/portal/deletedepartment', common.checkTokenExistOrNot, departmentValidation.departmentDeleteValidation, departmentController.deleteDepartment);
router.post('/webapi/v1/portal/getdepartmentfortable', common.checkTokenExistOrNot, departmentValidation.getdepartmentForTableValidation, departmentController.getdepartmentForTable);
router.post('/webapi/v1/portal/getdepartmentfortable', common.checkTokenExistOrNot, departmentValidation.getdepartmentForTableValidation, departmentController.getdepartmentForTable);
router.post('/webapi/v1/portal/checkimportdepartment', common.checkTokenExistOrNot, departmentController.checkImportDepartment);
router.post('/webapi/v1/portal/importdepartment', common.checkTokenExistOrNot, departmentController.importDepartment);

var documenttypeController = require('./documenttype/documenttypeController');
var documenttypeValidation = require('./documenttype/documenttypeValidation');
router.get('/webapi/v1/portal/getalldoctype', common.checkTokenExistOrNot, documenttypeController.getalldoctype);
router.post('/webapi/v1/portal/savedoctype', common.checkTokenExistOrNot, documenttypeValidation.documentTypeValidation, documenttypeController.saveDocType);
router.post('/webapi/v1/portal/deletedoctype', common.checkTokenExistOrNot, documenttypeValidation.documentTypeDeleteValidation, documenttypeController.deleteDocType);
router.post('/webapi/v1/portal/getdoctypefortable', common.checkTokenExistOrNot, documenttypeValidation.getdocumentTypeForTableValidation, documenttypeController.getdoctypeForTable);
router.post('/webapi/v1/portal/checkimportdoctype', common.checkTokenExistOrNot, documenttypeController.checkImportDocumentType);
router.post('/webapi/v1/portal/importdoctype', common.checkTokenExistOrNot, documenttypeController.importDocumentType);

let rolespermissionController = require("./roles/rolesandpermissionController");
router.get('/webapi/v1/portal/getallroles', common.checkTokenExistOrNot, rolespermissionController.getAllRoles);
router.get('/webapi/v1/portal/getallrolespermission', common.checkTokenExistOrNot, rolespermissionController.getAllRoles);
router.post('/webapi/v1/portal/saveRoles', common.checkTokenExistOrNot, rolespermissionController.saveRoles);

var emergencycontactsController = require('./emergency_contacts/emergency_contactsController');
var emergencycontactsValidation = require('./emergency_contacts/emergency_contactsValidation');
router.post('/webapi/v1/portal/saveemergencycontact', common.checkTokenExistOrNot, emergencycontactsValidation.emergencycontactsValidation, emergencycontactsController.saveemergencycontact);
router.post('/webapi/v1/portal/deleteemergencycontact', common.checkTokenExistOrNot, emergencycontactsValidation.emergencycontactsDeleteValidation, emergencycontactsController.deleteemergencycontact);
router.post('/webapi/v1/portal/getemergencycontact', common.checkTokenExistOrNot, emergencycontactsController.getemergencycontact);
router.post('/webapi/v1/portal/getoneemergencycontact', common.checkTokenExistOrNot, emergencycontactsController.getoneemergencycontact);
router.post('/webapi/v1/portal/sendemergencycontactreminder', common.checkTokenExistOrNot, emergencycontactsValidation.emergencycontactsSendReminderValidation, emergencycontactsController.sendEmergencyContactReminder);

let userDocumentController = require('./document/documentController');
let userDocumentValidation = require('./document/documentValidation');
router.post('/webapi/v1/portal/getuserdocument', common.checkTokenExistOrNot, userDocumentController.getUserDocument);
router.post('/webapi/v1/portal/getoneuserdocument', common.checkTokenExistOrNot, userDocumentValidation.getOneUserDocument, userDocumentController.getOneUserDocument);
router.post('/webapi/v1/portal/deleteuserdocument', common.checkTokenExistOrNot, userDocumentValidation.deleteDocumentValidation, userDocumentController.deleteUserDocument);
router.post('/webapi/v1/portal/edituserdocument', common.checkTokenExistOrNot, userDocumentController.editUserDocument);

var locationController = require('./location/locationController');
router.post('/webapi/v1/portal/getalllocation', common.checkTokenExistOrNot, locationController.getAllLocation);
router.get('/webapi/v1/portal/getalllocation', common.checkTokenExistOrNot, locationController.getAll_Location);

let settingsController = require('./settings/settingsController');
let settingsValidation = require('./settings/settingsValidation');
let settingsCron = require('./settings/settingsCron');
router.post('/webapi/v1/portal/compnayinformation', common.checkTokenExistOrNot, settingsController.compnayinformation);
router.get('/webapi/v1/portal/getallsetting', common.checkTokenExistOrNot, settingsController.getAllSetting);
router.post('/webapi/v1/portal/getupdatesetting', common.checkTokenExistOrNot, settingsController.getUpdateSetting);
router.post('/webapi/v1/portal/pendingInvoiceToAssignedToUserCronAPI', common.checkTokenExistOrNot, settingsCron.pendingInvoiceToAssignedToUserCronAPI);

let languageController = require("./language/languageController");
let languageValidation = require("./language/languageValidation");
router.get('/webapi/v1/portal/getlanguage', common.checkTokenExistOrNot, languageController.getlanguage);
router.post('/webapi/v1/portal/savelanguage', common.checkTokenExistOrNot, languageValidation.languageValidation, languageController.savelanguage);
router.post('/webapi/v1/portal/deletelanguage', common.checkTokenExistOrNot, languageValidation.languageDeleteValidation, languageController.deletelanguage);
router.post('/webapi/v1/portal/getlanguageForTable', common.checkTokenExistOrNot, languageValidation.getlanguageForTableValidation, languageController.getlanguageForTable);
router.post('/webapi/v1/portal/checkimportlanguage', common.checkTokenExistOrNot, languageController.checkImportlanguage);
router.post('/webapi/v1/portal/importlanguage', common.checkTokenExistOrNot, languageController.importLanguage);

let costCodeController = require('./costcode/costcodeController');
let costCodeValidation = require('./costcode/costCodeValidation');
router.get('/webapi/v1/portal/getallcostcode', common.checkTokenExistOrNot, costCodeController.getallcostcode);
router.post('/webapi/v1/portal/getcostcode', common.checkTokenExistOrNot, costCodeValidation.getCostCodeValidation, costCodeController.getcostcode);
router.post('/webapi/v1/portal/savecostcode', common.checkTokenExistOrNot, costCodeValidation.costCodeValidation, costCodeController.savecostcode);
router.post('/webapi/v1/portal/deletecostcode', common.checkTokenExistOrNot, costCodeValidation.costCodeDeleteValidation, costCodeController.deletecostcode);
router.post('/webapi/v1/portal/getcostcodefordatatable', common.checkTokenExistOrNot, costCodeController.getCostCodeForDatatable);
router.post('/webapi/v1/portal/savexlsxcostcode', common.checkTokenExistOrNot, costCodeController.savexlsxcostcode);
router.post('/webapi/v1/portal/savecostcodeindb', common.checkTokenExistOrNot, costCodeController.savecostcodeindb);
router.post('/webapi/v1/portal/getCostCodeForTable', common.checkTokenExistOrNot, costCodeValidation.getCostCodeForTableValidation, costCodeController.getCostCodeForTable);
router.post('/webapi/v1/portal/checkimportcostcode', common.checkTokenExistOrNot, costCodeController.checkImportCostCode);
router.post('/webapi/v1/portal/importcostcode', common.checkTokenExistOrNot, costCodeController.importCostCode);
router.get('/webapi/v1/portal/getCostCode', common.checkTokenExistOrNot, costCodeController.getCostCode);
router.post('/webapi/v1/portal/checkQBDImportCostcode', common.checkTokenExistOrNot, costCodeController.checkQBDImportCostcode);

let creditcardsettingsController = require("./creditcardsettings/creditcardsettingsController");
let creditcardsettingsValidation = require('./creditcardsettings/creditcardsettingsValidation');
router.get('/webapi/v1/portal/getcreditcardsettings', common.checkTokenExistOrNot, creditcardsettingsController.getcreditcardsettings);
router.post('/webapi/v1/portal/savecreditcardsettings', common.checkTokenExistOrNot, creditcardsettingsValidation.manufacturerValidation, creditcardsettingsController.savecreditcardsettings);
router.post('/webapi/v1/portal/deletecreditcardsettings', common.checkTokenExistOrNot, creditcardsettingsValidation.manufacturerDeleteValidation, creditcardsettingsController.deletecreditcardsettings);

var relationshipsController = require('./relationships/relationshipsController');
var relationshipsValidation = require('./relationships/relationshipsValidation');
router.get('/webapi/v1/portal/getallrelationships', common.checkTokenExistOrNot, relationshipsController.getAllRelationships);
router.post('/webapi/v1/portal/saverelationship', common.checkTokenExistOrNot, relationshipsValidation.relationshipValidation, relationshipsController.saveRelationship);
router.post('/webapi/v1/portal/deleterelationship', common.checkTokenExistOrNot, relationshipsValidation.relationshipDeleteValidation, relationshipsController.deleteRelationship);
router.post('/webapi/v1/portal/getrelationshipfortable', common.checkTokenExistOrNot, relationshipsValidation.getrelationshipForTableValidation, relationshipsController.getRelationshipForTable);
router.post('/webapi/v1/portal/checkimportrelationship', common.checkTokenExistOrNot, relationshipsController.checkImportRelationship);
router.post('/webapi/v1/portal/importrelationship', common.checkTokenExistOrNot, relationshipsController.importRelationship);

let shortcustsController = require("./shortcusts/shortcustsController");
router.get('/webapi/v1/portal/getshortcusts', common.checkTokenExistOrNot, shortcustsController.getusershortcuts);
router.post('/webapi/v1/portal/saveshortcusts', common.checkTokenExistOrNot, shortcustsController.saveusershortcuts);
router.post('/webapi/v1/portal/deleteshortcusts', common.checkTokenExistOrNot, shortcustsController.deleteusershortcuts);

// Location
var locationController = require('./location/locationController');
var locationValidation = require('./location/locationValidation');
router.post('/webapi/v1/portal/getalllocation', common.checkTokenExistOrNot, locationController.getAllLocation);
router.post('/webapi/v1/portal/savelocation', common.checkTokenExistOrNot, locationValidation.locationValidation, locationController.saveLocation);
router.post('/webapi/v1/portal/deletelocation', common.checkTokenExistOrNot, locationValidation.locationDeleteValidation, locationController.deleteLocation);
router.post('/webapi/v1/portal/getonelocation', common.checkTokenExistOrNot, locationValidation.locationDeleteValidation, locationController.getOneLocation);
router.get('/webapi/v1/portal/getalllocation', common.checkTokenExistOrNot, locationController.getAll_Location);
router.post('/webapi/v1/portal/savelocationxslx', common.checkTokenExistOrNot, locationController.saveLocationXslx);
router.post('/webapi/v1/portal/getalllocationhistory', common.checkTokenExistOrNot, locationController.getAllLocationHistory);

let gifLoaderController = require('./gif_loader/gifLoaderController');
let gifLoaderValidation = require('./gif_loader/gifLoaderValidation');
router.post('/webapi/v1/getgifloader', gifLoaderValidation.getGIFLoader, gifLoaderController.getGIFLoader);

let taxRateController = require('./tax_rate/taxRateController');
let taxRateValidation = require('./tax_rate/taxRateValidation');
router.post('/webapi/v1/portal/savetaxrate', common.checkTokenExistOrNot, taxRateValidation.saveTaxRate, taxRateController.saveTaxRate);
router.get('/webapi/v1/portal/gettaxrate', common.checkTokenExistOrNot, taxRateController.getTaxRate);
router.post('/webapi/v1/portal/deletetaxrate', common.checkTokenExistOrNot, taxRateValidation.deleteTaxRate, taxRateController.deleteTaxRate);
router.post('/webapi/v1/portal/checkimporttaxrate', common.checkTokenExistOrNot, taxRateController.checkImportTaxRate);
router.post('/webapi/v1/portal/importtaxrate', common.checkTokenExistOrNot, taxRateController.importTaxRate);
router.post('/webapi/v1/portal/gettax_ratefortable', common.checkTokenExistOrNot, taxRateValidation.getTaxRateForTableValidation, taxRateController.gettax_rateForTable);

let invoice_documentController = require('./invoice_document/documentController');
let invoice_documentValidation = require('./invoice_document/documentValidation');
router.post('/webapi/v1/portal/saveinvoicedocument', common.checkTokenExistOrNot, invoice_documentValidation.saveInvoice_Document, invoice_documentController.saveInvoicedocument);
router.get('/webapi/v1/portal/getinvoicedocument', common.checkTokenExistOrNot, invoice_documentController.getInvoiceDocument);
router.post('/webapi/v1/portal/deleteInvoiceDocument', common.checkTokenExistOrNot, invoice_documentValidation.deleteInvoice_Document, invoice_documentController.deleteInvoiceDocument);
router.post('/webapi/v1/portal/checkimportinvoicedocument', common.checkTokenExistOrNot, invoice_documentController.checkImportInvoiceDocument);
router.post('/webapi/v1/portal/importinvoicedocument', common.checkTokenExistOrNot, invoice_documentController.importInvoiceDocument);
router.post('/webapi/v1/portal/getInvoiceDocumentForTable', common.checkTokenExistOrNot, invoice_documentValidation.getInvoice_DocumentForTableValidation, invoice_documentController.getInvoiceDocumentForTable);


let invoice_termController = require('./invoice_term/termController');
let invoice_termValidation = require('./invoice_term/termValidation');
router.post('/webapi/v1/portal/saveinvoiceterm', common.checkTokenExistOrNot, invoice_termValidation.saveTerm, invoice_termController.saveTerm);
router.get('/webapi/v1/portal/getinvoiceterm', common.checkTokenExistOrNot, invoice_termController.getTerm);
router.post('/webapi/v1/portal/deleteinvoiceterm', common.checkTokenExistOrNot, invoice_termValidation.deleteTerm, invoice_termController.deleteTerm);
router.post('/webapi/v1/portal/checkimportterm', common.checkTokenExistOrNot, invoice_termController.checkImportTerm);
router.post('/webapi/v1/portal/importterm', common.checkTokenExistOrNot, invoice_termController.importTerm);
router.post('/webapi/v1/portal/gettermfortable', common.checkTokenExistOrNot, invoice_termValidation.getTermForTableValidation, invoice_termController.gettermForTable);

let invoice_costcodeController = require('./invoice_cost_code/cost_code.Controller');
let invoice_costcodeValidation = require('./invoice_cost_code/cost_codeValidation');
router.post('/webapi/v1/portal/saveinvoicecostcode', common.checkTokenExistOrNot, invoice_costcodeValidation.savecostcode, invoice_costcodeController.savecostCode);
router.get('/webapi/v1/portal/getinvoicecostcode', common.checkTokenExistOrNot, invoice_costcodeController.getcostCode);
router.post('/webapi/v1/portal/deleteInvoicecostcode', common.checkTokenExistOrNot, invoice_costcodeValidation.deletecostCode, invoice_costcodeController.deleteinvoicecostCode);

let invoiceController = require('./invoices/invoiceController');
let invoiceValidation = require('./invoices/invoiceValidation');
let invoiceCron = require('./invoices/invoiceCron');
router.post('/webapi/v1/portal/saveinvoice', common.checkTokenExistOrNot, invoiceController.saveInvoice);
router.get('/webapi/v1/portal/getinvoice', common.checkTokenExistOrNot, invoiceController.getInvoice);
router.post('/webapi/v1/portal/getinvoicelist', common.checkTokenExistOrNot, invoiceController.getInvoiceList);
router.post('/webapi/v1/portal/getoneinvoice', common.checkTokenExistOrNot, invoiceValidation.getOneInvoice, invoiceController.getOneInvoice);
router.post('/webapi/v1/portal/getinvoiceforreport', common.checkTokenExistOrNot, invoiceController.getInvoiceForReport);
router.post('/webapi/v1/portal/deleteinvoice', common.checkTokenExistOrNot, invoiceValidation.deleteInvoice, invoiceController.deleteInvoice);
router.post('/webapi/v1/portal/updateinvoicestatus', common.checkTokenExistOrNot, invoiceValidation.updateInvoiceStatus, invoiceController.updateInvoiceStatus);
router.post('/webapi/v1/portal/getinvoicedatatable', common.checkTokenExistOrNot, invoiceController.getInvoiceDatatable);
router.post('/webapi/v1/portal/getinvoiceexcelreport', common.checkTokenExistOrNot, invoiceController.getInvoiceExcelReport);
router.post('/webapi/v1/portal/getorphandocumentofinvoice', common.checkTokenExistOrNot, invoiceValidation.getOrphanDocuments, invoiceController.getOrphanDocuments);
router.post('/webapi/v1/portal/getorphandocumentdatatable', common.checkTokenExistOrNot, invoiceController.getOrphanDocumentsDatatable);
router.post('/webapi/v1/portal/getduplicatedocumentdatatable', common.checkTokenExistOrNot, invoiceController.getDuplicateDocumentsDatatable);
router.post('/webapi/v1/portal/getviewdocumetdatatable', common.checkTokenExistOrNot, invoiceController.getViewDocumentsDatatable);
router.post('/webapi/v1/portal/deleteviewdocument', common.checkTokenExistOrNot, invoiceValidation.deleteViewDocument, invoiceController.deleteViewDocument);
router.post('/webapi/v1/portal/getinvoicehistorylog', common.checkTokenExistOrNot, invoiceValidation.getInvoiceHistoryLog, invoiceController.getInvoiceHistoryLog);
router.post('/webapi/v1/portal/saveinvoicenote', common.checkTokenExistOrNot, invoiceValidation.saveInvoiceNotes, invoiceController.saveInvoiceNotes);
router.post('/webapi/v1/portal/deleteinvoicenote', common.checkTokenExistOrNot, invoiceValidation.deleteInvoiceNote, invoiceController.deleteInvoiceNote);
router.post('/webapi/v1/portal/updateinvoiceattachment', common.checkTokenExistOrNot, invoiceValidation.saveInvoiceAttachment, invoiceController.saveInvoiceAttachment);
router.post('/webapi/v1/portal/savepackingslipnote', common.checkTokenExistOrNot, invoiceValidation.savePackingSlipNotes, invoiceController.savePackingSlipNotes);
router.post('/webapi/v1/portal/deletepackingslipnote', common.checkTokenExistOrNot, invoiceValidation.deletePackingSlipNote, invoiceController.deletePackingSlipNote);
router.post('/webapi/v1/portal/updatepackingslipattachment', common.checkTokenExistOrNot, invoiceValidation.savePackingSlipAttachment, invoiceController.savePackingSlipAttachment);
router.post('/webapi/v1/portal/savereceivingslipnote', common.checkTokenExistOrNot, invoiceValidation.saveReceivingSlipNotes, invoiceController.saveReceivingSlipNotes);
router.post('/webapi/v1/portal/deletereceivingslipnote', common.checkTokenExistOrNot, invoiceValidation.deleteReceivingSlipNote, invoiceController.deleteReceivingSlipNote);
router.post('/webapi/v1/portal/updatereceivingslipattachment', common.checkTokenExistOrNot, invoiceValidation.saveReceivingSlipAttachment, invoiceController.saveReceivingSlipAttachment);
router.post('/webapi/v1/portal/saveponote', common.checkTokenExistOrNot, invoiceValidation.savePONotes, invoiceController.savePONotes);
router.post('/webapi/v1/portal/deleteponote', common.checkTokenExistOrNot, invoiceValidation.deletePONote, invoiceController.deletePONote);
router.post('/webapi/v1/portal/updatepoattachment', common.checkTokenExistOrNot, invoiceValidation.savePOAttachment, invoiceController.savePOAttachment);
router.post('/webapi/v1/portal/savequotenote', common.checkTokenExistOrNot, invoiceValidation.saveQuoteNotes, invoiceController.saveQuoteNotes);
router.post('/webapi/v1/portal/deletequotenote', common.checkTokenExistOrNot, invoiceValidation.deleteQuoteNote, invoiceController.deleteQuoteNote);
router.post('/webapi/v1/portal/updatequoteattachment', common.checkTokenExistOrNot, invoiceValidation.saveQuoteAttachment, invoiceController.saveQuoteAttachment);
router.post('/webapi/v1/portal/updateinvoicerelateddocument', common.checkTokenExistOrNot, invoiceValidation.updateInvoiceRelatedDocument, invoiceController.updateInvoiceRelatedDocument);
router.post('/webapi/v1/portal/requestforinvoicefile', common.checkTokenExistOrNot, invoiceValidation.requestForInvoiceFile, invoiceController.requestForInvoiceFile);
router.get('/webapi/v1/portal/deleteOrphanDocumentCronAPI', common.checkTokenExistOrNot, invoiceCron.deleteOrphanDocumentCronAPI);
router.post('/webapi/v1/portal/saveinvoicetoDB', common.checkTokenExistOrNot, invoiceController.saveinvoicetoDB);
router.post('/webapi/v1/portal/saveglaccountstoDB', common.checkTokenExistOrNot, invoiceController.saveglaccountstoDB);

router.post('/webapi/v1/portal/getInvoiceTableForReport', common.checkTokenExistOrNot, invoiceValidation.getInvoiceTableForReportValidation, invoiceController.getInvoiceTableForReport);
router.post('/webapi/v1/portal/getViewDocumentsDatatableForTable', common.checkTokenExistOrNot, invoiceValidation.getViewDocumentsDatatableForTableValidation, invoiceController.getViewDocumentsDatatableForTable);
router.post('/webapi/v1/portal/getOrphanDocumentsForTable', common.checkTokenExistOrNot, invoiceController.getOrphanDocumentsForTable);
router.post('/webapi/v1/portal/getOrphanDocumentsDatatableForTable', common.checkTokenExistOrNot, invoiceController.getOrphanDocumentsDatatableForTable);
router.post('/webapi/v1/portal/getDuplicateDocumentsDatatableForTable', common.checkTokenExistOrNot, invoiceController.getDuplicateDocumentsDatatableForTable);
router.post('/webapi/v1/portal/sendInvoiceEmail', common.checkTokenExistOrNot, invoiceController.sendInvoiceEmail);

let invoiceDashboard = require('./dashboard/dashboardController');
router.get('/webapi/v1/portal/getdashboardcount', common.checkTokenExistOrNot, invoiceDashboard.getDashboardCount);
router.get('/webapi/v1/portal/getdashboardinvoice', common.checkTokenExistOrNot, invoiceDashboard.dashboardInvoiceList);
router.post('/webapi/v1/portal/getdashboardmonthlyinvoicechart', common.checkTokenExistOrNot, invoiceDashboard.getDashboardMonthlyInvoiceChart);
router.post('/webapi/v1/portal/getdashboardmonthlyhistorychart', common.checkTokenExistOrNot, invoiceDashboard.getDashboardMonthlyHistoryChart);
router.get('/webapi/v1/portal/getduplicatedocumentsfortable', common.checkTokenExistOrNot, invoiceDashboard.getDuplicateDocumentsForTable);
router.get('/webapi/v1/portal/getdashboardjobcost', common.checkTokenExistOrNot, invoiceDashboard.getDashboardJobCost);


let invoice_vendorController = require('./vendor/vendorController');
let invoice_vendorValidation = require('./vendor/vendorValidation');
router.post('/webapi/v1/portal/savevendor', common.checkTokenExistOrNot, invoice_vendorValidation.saveVendor, invoice_vendorController.saveVendor);
router.get('/webapi/v1/portal/getvendorstatuscount', common.checkTokenExistOrNot, invoice_vendorController.getVendorStatusCount);
router.post('/webapi/v1/portal/getvendor', common.checkTokenExistOrNot, invoice_vendorController.getVendor);
router.post('/webapi/v1/portal/getvendorfortable', common.checkTokenExistOrNot, invoice_vendorValidation.getVendorForTable, invoice_vendorController.getVendorForTable);
router.post('/webapi/v1/portal/getonevendor', common.checkTokenExistOrNot, invoice_vendorValidation.getOneVendor, invoice_vendorController.getOneVendor);
router.post('/webapi/v1/portal/deletevendor', common.checkTokenExistOrNot, invoice_vendorValidation.deleteVendor, invoice_vendorController.deleteVendor);
router.post('/webapi/v1/portal/getvendordatatable', common.checkTokenExistOrNot, invoice_vendorController.getVendorDatatable);
router.post('/webapi/v1/portal/vendorStatusUpdate', common.checkTokenExistOrNot, invoice_vendorValidation.updateVendorStatus, invoice_vendorController.updateVendorStatus);
router.post('/webapi/v1/portal/getvendorhistory', common.checkTokenExistOrNot, invoice_vendorController.getVendorHistory);
router.post('/webapi/v1/portal/getvendorreport', common.checkTokenExistOrNot, invoice_vendorController.getVendorExcelReport);
router.post('/webapi/v1/portal/savevendorstoDB', common.checkTokenExistOrNot, invoice_vendorController.savevendorstoDB);
router.post('/webapi/v1/portal/updateMultipleVendorStatus', common.checkTokenExistOrNot, invoice_vendorValidation.updateMultipleVendorStatus, invoice_vendorController.updateMultipleVendorStatus);
router.post('/webapi/v1/portal/deleteMultipleVendor', common.checkTokenExistOrNot, invoice_vendorValidation.deleteMultipleVendor, invoice_vendorController.deleteMultipleVendor);
router.post('/webapi/v1/portal/importVendor', common.checkTokenExistOrNot, invoice_vendorController.importVendor);
router.post('/webapi/v1/portal/checkImportVendor', common.checkTokenExistOrNot, invoice_vendorController.checkImportVendor);
router.post('/webapi/v1/portal/checkQBDImportVendor', common.checkTokenExistOrNot, invoice_vendorController.checkQBDImportVendor);


let invoice_templateController = require('./template/templateController');
let invoice_templateValidation = require('./template/templateValidation');
router.post('/webapi/v1/portal/savetemplate', common.checkTokenExistOrNot, invoice_templateValidation.saveTemplate, invoice_templateController.savetemplate);
router.get('/webapi/v1/portal/gettemplate', common.checkTokenExistOrNot, invoice_templateController.gettemplate);
router.post('/webapi/v1/portal/deletetemplate', common.checkTokenExistOrNot, invoice_templateValidation.deleteTemplate, invoice_templateController.deleteTemplate);
router.post('/webapi/v1/portal/datatabletemplate', common.checkTokenExistOrNot, invoice_templateValidation.datatableTemplate, invoice_templateController.datatabletemplate);
router.post('/webapi/v1/portal/datatablehistorytemplate', common.checkTokenExistOrNot, invoice_templateValidation.datatablehistoryTemplate, invoice_templateController.historydatatable);

router.post('/webapi/v1/portal/urlToBase64api', common.urlToBase64Api);
var saveAttechment = require("./../../../../controller/common/saveAttechment");
router.post('/webapi/v1/portal/saveattechment', common.checkTokenExistOrNot, saveAttechment.saveAttechment);
router.post('/webapi/v1/portal/saveprofileimagescompany', common.checkTokenExistOrNot, saveAttechment.saveProfileImagesCompany);

let processInvoiceController = require('./process_invoice/processInvoiceController');
let processInvoiceValidation = require('./process_invoice/processInvoiceValidation');
router.get('/webapi/v1/portal/getinvoiceprocess', common.checkTokenExistOrNot, processInvoiceController.getAllProcessInvoice);
router.post('/webapi/v1/portal/getoneinvoiceprocess', common.checkTokenExistOrNot, processInvoiceValidation.getOneProcessInvoice, processInvoiceController.getOneProcessInvoice);
router.post('/webapi/v1/portal/updateinvoiceprocess', common.checkTokenExistOrNot, processInvoiceController.updateProcessInvoice);
router.post('/webapi/v1/portal/saveinvoiceprocess', common.checkTokenExistOrNot, processInvoiceController.saveInvoiceProcess);
router.get('/webapi/v1/portal/importmanagementinvoice', common.checkTokenExistOrNot, processInvoiceController.importManagementInvoice);
router.get('/webapi/v1/portal/importmanagementpo', common.checkTokenExistOrNot, processInvoiceController.importManagementPO);
router.get('/webapi/v1/portal/getprocessprogress', common.checkTokenExistOrNot, processInvoiceController.checkProcessProgress);
router.get('/webapi/v1/portal/importprocessinvoice', common.checkTokenExistOrNot, processInvoiceController.importProcessData);
router.post('/webapi/v1/portal/deleteinvoiceprocess', common.checkTokenExistOrNot, processInvoiceValidation.deleteInvoiceProcess, processInvoiceController.deleteInvoiceProcess);

let recentActivityController = require('./recent_activity/recentActivityController');
router.post('/webapi/v1/portal/getrecentactivity', common.checkTokenExistOrNot, recentActivityController.getRecentActivity);

// Alert
let alertController = require("./alert/alertController");
let supplierAlertValidation = require("./alert/alertValidation");
router.post('/webapi/v1/portal/getallinvoicealert', common.checkTokenExistOrNot, alertController.getAllAlert);
router.get('/webapi/v1/portal/getinvoiceunseencount/:companycode/:userid', alertController.getUnseenCount);
router.post('/webapi/v1/portal/getinvoicealertdatatables', common.checkTokenExistOrNot, alertController.getAlertDatatables);
router.post('/webapi/v1/portal/saveinvoicealert', common.checkTokenExistOrNot, alertController.saveAlert);
router.post('/webapi/v1/portal/updateinvoicealert', common.checkTokenExistOrNot, alertController.updateAlert);
router.post('/webapi/v1/portal/updateallinvoicealert', common.checkTokenExistOrNot, alertController.updateAllAlert);
router.post('/webapi/v1/portal/getinvoicealertexcelreport', common.checkTokenExistOrNot, alertController.getAlertExcelReport);

// Mailbox Monitor
let mailboxMonitorController = require("./mailbox_monitor/mailboxMonitorController");
let mailboxMonitorValidation = require("./mailbox_monitor/mailboxMonitorValidation");
let mailBoxMonitorCron = require("./mailbox_monitor/mailBoxMonitorCron");
router.get('/webapi/v1/portal/getallmailboxmonitor', common.checkTokenExistOrNot, mailboxMonitorController.getAllMailboxMonitor);
router.post('/webapi/v1/portal/getmailboxmonitordatatable', common.checkTokenExistOrNot, mailboxMonitorController.getMailboxMonitorDatatable);
router.post('/webapi/v1/portal/getonemailboxmonitor', common.checkTokenExistOrNot, mailboxMonitorValidation.getOneMailboxMonitor, mailboxMonitorController.getOneMailboxMonitor);
router.post('/webapi/v1/portal/savemailboxmonitor', common.checkTokenExistOrNot, mailboxMonitorValidation.saveMailboxMonitor, mailboxMonitorController.saveMailboxMonitor);
router.post('/webapi/v1/portal/deletemailboxmonitor', common.checkTokenExistOrNot, mailboxMonitorValidation.deleteMailboxMonitor, mailboxMonitorController.deleteMailboxMonitor);
router.get('/webapi/v1/portal/mailboxMonitorCronAPI', mailBoxMonitorCron.mailboxMonitorCronAPI);
router.post('/webapi/v1/portal/getMailboxMonitorForTable', common.checkTokenExistOrNot, mailboxMonitorValidation.getMailboxMonitorForTableValidation, mailboxMonitorController.getMailboxMonitorForTable);


// Invoice Progress
let invoiceProgressController = require("./invoice_progress/invoiceProgressController");
let invoiceProgressValidation = require("./invoice_progress/invoiceProgressValidation");
router.get('/webapi/v1/portal/getallinvoiceprogress', invoiceProgressController.getAllInvoiceProgress);
router.get('/webapi/v1/portal/getinvoiceprogress/:companycode/:userid', invoiceProgressController.getInvoiceProgress);

let vendor_typeController = require('./vendor_type/vendor_typeController');
let vendor_typeValidation = require('./vendor_type/vendor_typeValidation');

router.post('/webapi/v1/portal/savevendortype', common.checkTokenExistOrNot, vendor_typeValidation.savevendortype, vendor_typeController.savevendortype);
router.get('/webapi/v1/portal/getvendortype', common.checkTokenExistOrNot, vendor_typeController.getvendortype);
router.post('/webapi/v1/portal/deletevendortype', common.checkTokenExistOrNot, vendor_typeValidation.deletevendortype, vendor_typeController.deletevendortype);
router.post('/webapi/v1/portal/checkimportvendortype', common.checkTokenExistOrNot, vendor_typeController.checkImportVendorType);
router.post('/webapi/v1/portal/importvendortype', common.checkTokenExistOrNot, vendor_typeController.importVendorType);
router.post('/webapi/v1/portal/getvendortypefortable', common.checkTokenExistOrNot, vendor_typeValidation.getVendorTypeForTableValidation, vendor_typeController.getVendorTypeForTable);


let job_nameController = require('./job_name/job_nameController');
let job_nameValidation = require('./job_name/job_nameValidation');

router.post('/webapi/v1/portal/savejobname', common.checkTokenExistOrNot, job_nameValidation.savejobname, job_nameController.savejobname);
router.get('/webapi/v1/portal/getjobname', common.checkTokenExistOrNot, job_nameController.getjobname);
router.post('/webapi/v1/portal/deletejobname', common.checkTokenExistOrNot, job_nameValidation.deletejobname, job_nameController.deletejobname);
router.post('/webapi/v1/portal/importjobname', common.checkTokenExistOrNot, job_nameController.importjobname);
router.post('/webapi/v1/portal/getjobnamefortable', common.checkTokenExistOrNot, job_nameValidation.getJobNameForTableValidation, job_nameController.getJobNameForTable);


let clientController = require('./client/clientController');
let clientValidation = require('./client/clientValidation');
router.post('/webapi/v1/portal/saveclient', common.checkTokenExistOrNot, clientValidation.saveclientValidation, clientController.saveclient);
router.get('/webapi/v1/portal/getclient', common.checkTokenExistOrNot, clientController.getclient);
router.post('/webapi/v1/portal/deleteclient', common.checkTokenExistOrNot, clientValidation.deleteclientvalidation, clientController.deleteclient);
router.post('/webapi/v1/portal/getClinetHistory', common.checkTokenExistOrNot, clientController.getClinetHistory);
router.post('/webapi/v1/portal/updateClientStatus', common.checkTokenExistOrNot, clientController.updateClientStatus);
router.post('/webapi/v1/portal/updateMultipleClientStatus', common.checkTokenExistOrNot, clientController.updateMultipleClientStatus);
router.post('/webapi/v1/portal/deleteMultipleClient', common.checkTokenExistOrNot, clientController.deleteMultipleClient);
router.post('/webapi/v1/portal/getClientForTable', common.checkTokenExistOrNot, clientController.getClientForTable);
router.post('/webapi/v1/portal/getOneClient', common.checkTokenExistOrNot, clientController.getOneClient);
router.post('/webapi/v1/portal/checkimportclient', common.checkTokenExistOrNot, clientController.checkImportClient);
router.post('/webapi/v1/portal/importclient', common.checkTokenExistOrNot, clientController.importClient);
router.post('/webapi/v1/portal/checkQBDImportClient', common.checkTokenExistOrNot, clientController.checkQBDImportClient);


var classNameController = require('./class_name/class_nameController');
var Class_nameValidation = require('./class_name/class_nameValidation');
router.post('/webapi/v1/portal/saveclassname', common.checkTokenExistOrNot, classNameController.saveclassname);
router.post('/webapi/v1/portal/deleteclassname', common.checkTokenExistOrNot, classNameController.deleteclassname);
router.get('/webapi/v1/portal/getclassname', common.checkTokenExistOrNot, classNameController.getclassname);
router.post('/webapi/v1/portal/getclassnameForTable', common.checkTokenExistOrNot, classNameController.getclassnameForTable);
router.post('/webapi/v1/portal/checkimportclassname', common.checkTokenExistOrNot, classNameController.checkImportClassName);
router.post('/webapi/v1/portal/importclassname', common.checkTokenExistOrNot, classNameController.importClassName);
router.post('/webapi/v1/portal/checkQBDImportClassName', common.checkTokenExistOrNot, classNameController.checkQBDImportClassName);


let invoiceMessageController = require('./invoice_message/invoiceMessageController');
let invoiceMessageValidation = require('./invoice_message/invoiceMessageValidation');
router.get('/webapi/v1/portal/getinvoicemessagecount', common.checkTokenExistOrNot, invoiceMessageController.getInvoiceMessageCount);
router.get('/webapi/v1/portal/getinvoicemessagefortable', common.checkTokenExistOrNot, invoiceMessageController.getInvoiceMessageForTable);
router.post('/webapi/v1/portal/getoneinvoicemessage', common.checkTokenExistOrNot, invoiceMessageValidation.getOneInvoiceMessage, invoiceMessageController.getOneInvoiceMessage);
router.get('/webapi/v1/portal/updateinvoicemessageseenflag', common.checkTokenExistOrNot, invoiceMessageController.updateInvoiceMessageSeenFlag);
router.post('/webapi/v1/portal/sendinvoicemessage', common.checkTokenExistOrNot, invoiceMessageValidation.sendInvoiceMessage, invoiceMessageController.sendInvoiceMessage);
router.post('/webapi/v1/portal/deleteinvoicemessage', common.checkTokenExistOrNot, invoiceMessageValidation.deleteInvoiceMessage, invoiceMessageController.deleteInvoiceMessage);

let apInvoiceController = require('./ap_invoice/apInvoiceController');
let apInvoiceValidation = require('./ap_invoice/apInvoiceValidation');
router.post('/webapi/v1/portal/getapinvoicefortable', common.checkTokenExistOrNot, apInvoiceValidation.getAPInvoiceForTable, apInvoiceController.getAPInvoiceForTable);
router.post('/webapi/v1/portal/getoneapinvoice', common.checkTokenExistOrNot, apInvoiceValidation.getOneAPInvoice, apInvoiceController.getOneAPInvoice);
router.post('/webapi/v1/portal/saveapinvoice', common.checkTokenExistOrNot, apInvoiceController.saveAPInvoice);
router.post('/webapi/v1/portal/saveapotherdocumentinvoice', common.checkTokenExistOrNot, apInvoiceController.saveAPOtherDocumentInvoice);
router.post('/webapi/v1/portal/deleteapinvoice', common.checkTokenExistOrNot, apInvoiceValidation.deleteAPInvoice, apInvoiceController.deleteAPInvoice);
router.post('/webapi/v1/portal/saveapinvoicenote', common.checkTokenExistOrNot, apInvoiceValidation.saveAPInvoiceNote, apInvoiceController.saveAPInvoiceNote);
router.post('/webapi/v1/portal/deleteapinvoicenote', common.checkTokenExistOrNot, apInvoiceValidation.deleteAPInvoiceNote, apInvoiceController.deleteAPInvoiceNote);
router.post('/webapi/v1/portal/getapinvoicehistory', common.checkTokenExistOrNot, apInvoiceController.getAPInvoiceHistory);
router.post('/webapi/v1/portal/getapinvoiceforreports', common.checkTokenExistOrNot, apInvoiceController.getAPInvoiceForReports);
router.post('/webapi/v1/portal/getheaderapinvoicesearch', common.checkTokenExistOrNot, apInvoiceValidation.getHeaderAPInvoiceSerach, apInvoiceController.getHeaderAPInvoiceSerach);
router.post('/webapi/v1/portal/saveapinvoiceinfo', common.checkTokenExistOrNot, apInvoiceValidation.saveAPInvoiceInfo, apInvoiceController.saveAPInvoiceInfo);
router.post('/webapi/v1/portal/deleteapinvoiceinfo', common.checkTokenExistOrNot, apInvoiceValidation.deleteAPInvoiceInfo, apInvoiceController.deleteAPInvoiceInfo);
router.post('/webapi/v1/portal/checkqbdimportapinvoices', common.checkTokenExistOrNot, apInvoiceController.checkQBDImportapInvoices);
router.get('/webapi/v1/portal/getapprovedapinvoicesforqbd', common.checkTokenExistOrNot, apInvoiceController.getApprovedapInvoicesForQBD);

let apDocumentProcessController = require('./ap_document_process/apDocumentProcessController');
let apDocumentProcessValidation = require('./ap_document_process/apDocumentProcessValidation');
router.get('/webapi/v1/portal/getapdocumentprocess', common.checkTokenExistOrNot, apDocumentProcessController.getAPDocumentProcess);
router.post('/webapi/v1/portal/getoneapdocumentprocess', common.checkTokenExistOrNot, apDocumentProcessValidation.getOneAPDocumentProcess, apDocumentProcessController.getOneAPDocumentProcess);
router.post('/webapi/v1/portal/saveapdocumentprocess', common.checkTokenExistOrNot, apDocumentProcessValidation.saveAPDocumentProcess, apDocumentProcessController.saveAPDocumentProcess);

let apPOController = require('./ap_po/apPOController');
let apPOValidation = require('./ap_po/apPOValidation');
router.get('/webapi/v1/portal/getappo', common.checkTokenExistOrNot, apPOController.getAPPO);
router.post('/webapi/v1/portal/getorphanappo', common.checkTokenExistOrNot, apPOController.getOrphanAPPO);
router.post('/webapi/v1/portal/getoneappo', common.checkTokenExistOrNot, apPOValidation.getOneAPPO, apPOController.getOneAPPO);
router.post('/webapi/v1/portal/saveappo', common.checkTokenExistOrNot, apPOController.saveAPPO);
router.post('/webapi/v1/portal/saveapotherdocumentpo', common.checkTokenExistOrNot, apPOController.saveAPOtherDocumentPO);
router.post('/webapi/v1/portal/deleteappo', common.checkTokenExistOrNot, apPOValidation.deleteAPPO, apPOController.deleteAPPO);

let apQuoteController = require('./ap_quote/apQuoteController');
let apQuoteValidation = require('./ap_quote/apQuoteValidation');
router.get('/webapi/v1/portal/getapquote', common.checkTokenExistOrNot, apQuoteController.getAPQuote);
router.post('/webapi/v1/portal/getorphanapquote', common.checkTokenExistOrNot, apQuoteController.getOrphanAPQuote);
router.post('/webapi/v1/portal/getoneapquote', common.checkTokenExistOrNot, apQuoteValidation.getOneAPQuote, apQuoteController.getOneAPQuote);
router.post('/webapi/v1/portal/saveapquote', common.checkTokenExistOrNot, apQuoteController.saveAPQuote);
router.post('/webapi/v1/portal/saveapotherdocumentquote', common.checkTokenExistOrNot, apQuoteController.saveAPOtherDocumentQuote);
router.post('/webapi/v1/portal/deleteapquote', common.checkTokenExistOrNot, apQuoteValidation.deleteAPQuote, apQuoteController.deleteAPQuote);

let apPackingSlipController = require('./ap_packing_slip/apPackingSlipController');
let apPackingSlipValidation = require('./ap_packing_slip/apPackingSlipValidation');
router.get('/webapi/v1/portal/getappackingslip', common.checkTokenExistOrNot, apPackingSlipController.getAPPackingSlip);
router.post('/webapi/v1/portal/getorphanappackingslip', common.checkTokenExistOrNot, apPackingSlipController.getOrphanAPPackingSlip);
router.post('/webapi/v1/portal/getoneappackingslip', common.checkTokenExistOrNot, apPackingSlipValidation.getOneAPPackingSlip, apPackingSlipController.getOneAPPackingSlip);
router.post('/webapi/v1/portal/saveappackingslip', common.checkTokenExistOrNot, apPackingSlipController.saveAPPackingSlip);
router.post('/webapi/v1/portal/saveapotherdocumentpackingslip', common.checkTokenExistOrNot, apPackingSlipController.saveAPOtherDocumentPackingSlip);
router.post('/webapi/v1/portal/deleteappackingslip', common.checkTokenExistOrNot, apPackingSlipValidation.deleteAPPackingSlip, apPackingSlipController.deleteAPPackingSlip);

let apReceivingSlipController = require('./ap_receiving_slip/apReceivingSlipController');
let apReceivingSlipValidation = require('./ap_receiving_slip/apReceivingSlipValidation');
router.get('/webapi/v1/portal/getapreceivingslip', common.checkTokenExistOrNot, apReceivingSlipController.getAPReceivingSlip);
router.post('/webapi/v1/portal/getorphanapreceivingslip', common.checkTokenExistOrNot, apReceivingSlipController.getOrphanAPReceivingSlip);
router.post('/webapi/v1/portal/getoneapreceivingslip', common.checkTokenExistOrNot, apReceivingSlipValidation.getOneAPReceivingSlip, apReceivingSlipController.getOneAPReceivingSlip);
router.post('/webapi/v1/portal/saveapreceivingslip', common.checkTokenExistOrNot, apReceivingSlipController.saveAPReceivingSlip);
router.post('/webapi/v1/portal/saveapotherdocumentreceivingslip', common.checkTokenExistOrNot, apReceivingSlipController.saveAPOtherDocumentReceivingSlip);
router.post('/webapi/v1/portal/deleteapreceivingslip', common.checkTokenExistOrNot, apReceivingSlipValidation.deleteAPReceivingSlip, apReceivingSlipController.deleteAPReceivingSlip);

let apOtherDocumentController = require('./ap_other_document/apOtherDocumentController');
let apOtherDocumentValidation = require('./ap_other_document/apOtherDocumentValidation');
router.post('/webapi/v1/portal/getapotherdocument', common.checkTokenExistOrNot, apOtherDocumentController.getAPOtherDocument);
router.post('/webapi/v1/portal/getoneapotherdocument', common.checkTokenExistOrNot, apOtherDocumentValidation.getOneAPOtherDocument, apOtherDocumentController.getOneAPOtherDocument);

let apDocumentRelationshipController = require('./ap_document_relationship/apDocumentRelationshipController');
router.post('/webapi/v1/portal/makeapdocumentrelationship', common.checkTokenExistOrNot, apDocumentRelationshipController.makeAPDocumentRelationship);

module.exports = router;