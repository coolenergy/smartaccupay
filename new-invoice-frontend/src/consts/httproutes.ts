import { configData } from 'src/environments/configData';

export const httpversion = {
  PORTAL_V1: configData.API_URL + 'webapi/v1/portal/',
  V1: configData.API_URL + 'webapi/v1/',
};

export enum httproutes {
  // auth
  GET_COMPANY_SETTINGS = 'getcompanysetting',
  USER_LOGIN = 'login',
  GET_USER_COMPANY = 'getlogincompanylist',
  GET_MY_COMPANY_LIST = 'getmycompanylist',
  SEND_OTP_EMAIL = 'sendemailotp',
  EMAIL_FORGET_PASSWORD = 'emailforgotpassword',
  SEND_EMAIL_FORGET_PASSWORD = 'sendemailforgotpassword',
  SUBMITT_OTP = 'submitemailotp',
  LOGIN_WITH_OTP = 'loginwithemailotp',
  CHANGEPASSWORD = 'changepassword',

  // Dashboard
  GET_DASHBOARD_INVOICE = 'getdashboardinvoice',
  GET_DASHBOARD_INVOICE_COUNTS = 'getdashboardcount',
  DASHBOARD_INVOICE_FOR_TABLE = 'dashboardInvoiceListForTable',
  DASHBOARD_MONTHLY_INVOICE_CHART = 'getdashboardmonthlyinvoicechart',
  DASHBOARD_MONTHLY_HISTORY_CHART = 'getdashboardmonthlyhistorychart',
  GET_DUPLICATE_DOCUMENT_FOR_TABLE = 'getduplicatedocumentsfortable',
  GET_DASHBOARD_JOB_COST = 'getdashboardjobcost',

  // Vendor
  PORTAL_VENDOR_GET_FOR_TABLE = 'getvendorfortable',
  PORTAL_VENDOR_GET_ONE = 'getonevendor',
  PORTAL_VENDOR_SAVE = 'savevendor',
  PORTAL_VENDOR_STATUS_UPDATE = 'vendorStatusUpdate',
  PORTAL_VENDOR_DELETE = 'deletevendor',
  PORTAL_VENDOR_GET_HISTORY = 'getvendorhistory',
  PORTAL_VENDOR_REPORT = 'getvendorreport',
  PORTAL_VENDOR_ALL_DELETE = 'deleteMultipleVendor',
  PORTAL_ALL_VENDOR_STATUS_UPDATE = 'updateMultipleVendorStatus',
  PORTAL_VENDOR_GET = 'getvendor',
  IMPORT_CHECK_VENDOR = 'checkImportVendor',
  IMPORT_VENDOR = 'importVendor',

  // Terms
  PORTAL_TERM_GET = 'getinvoiceterm',
  PORTAL_TERM_SAVE = 'saveinvoiceterm',
  PORTAL_TERM_DELETE = 'deleteinvoiceterm',
  PORTAL_TERM_ALL_DELETE = 'deleteMultipleTeamMember',
  PORTAL_ALL_USER_STATUS_CHANGE = 'updateMultipleUserStatus',
  PORTAL_USER_STATUS_UPDATE = 'updateUserStatus',
  GET_COMPNAY_INFO = 'compnayinformation',
  GET_COMPNAY_TYPE = 'getcompanytype',
  GET_COMPNAY_NIGP = 'getcsidivision',
  GET_COMPNAY_SIZE = 'getcompanysize',
  GET_COMPNAY_ACTIVE_SINEC = 'compnayinformation',
  SAVE_COMPNAY_INFO = 'editcompany',
  PORTAL_ROVUK_SPONSOR_GET_PRIME_WORK_PERFORMED = 'getsupplierprimeworkperformed',
  PORTAL_ROVUK_SPONSOR_GET_CSIDIVISION_WORK_PERFORMED = 'getcsidivision',
  // Attachment
  PORTAL_SAVE_ATTACHMENT = 'saveattechment',

  // User
  PORTAL_USER_GET_FOR_TABLE = 'getUserForTable',
  USER_DELETE = 'deleteteammember',
  USER_SETTING_ROLES_ALL = 'getallrolespermission',
  USER_RECOVER = 'recoverteam',
  USER_HISTORY = 'getuserhistory',
  USER_REPORT = 'getallemployeereport',
  TEAM_HISTORY = 'getuserhistory',
  GET_ALL_USER = 'getalluser',
  GET_SPECIFIC_USERS = 'getspecificusers',
  GET_USER_PROFILE = 'getprofile',
  GET_ONE_USER = 'getoneuser',
  GET_LOCATION = 'getalllocation',
  GET_JOB_TITLE = 'getAlljobtitle',
  GET_JOB_TYPE = 'getAlljobtype',
  GET_DOCUMENT_TYPE = 'getalldoctype',
  GET_LANGUAGE = 'getlanguage',
  GET_DEPARTMENT = 'getalldepartment',
  SAVE_USER = 'saveemployee',
  SAVE_USER_PERSONAL_INFO = 'savepersonalinfo',
  SAVE_USER_CONTACT_INFO = 'savecontactinfo',
  SAVE_USER_INFO = 'saveemployeeinfo',
  SAVE_USER_MOBILE_PIC = 'savemobilephoto',
  SAVE_USER_PASSWORD = 'senduserpassword',


  // Emergency Contact
  GET_EMERGENCY_CONTACT = 'getemergencycontact',
  GET_ONE_EMERGENCY_CONTACT = 'getoneemergencycontact',
  SAVE_EMERGENCY_CONTACT = 'saveemergencycontact',
  DELETE_EMERGENCY_CONTACT = 'deleteemergencycontact',
  GET_RELATIONSHIP = 'getallrelationships',

  // User Document
  GET_USER_DOCUMENT = 'getuserdocument',
  GET_ONE_USER_DOCUMENT = 'getoneuserdocument',
  SAVE_USER_DOCUMENT = 'saveuserdocument',
  EDIT_USER_DOCUMENT = 'edituserdocument',
  DELETE_USER_DOCUMENT = 'deleteuserdocument',

  //Mail box
  MAILBOX_DATA_TABLE = 'getMailboxMonitorForTable',
  SAVE_MAILBOX = 'savemailboxmonitor',
  GET_ONE_MAILBOX = 'getonemailboxmonitor',
  DELETE_MAILBOX = 'deletemailboxmonitor',

  //SMTP
  GET_COMPNAY_SMTP = 'compnaysmtp',
  VERIFY_SMTP = 'compnayverifysmtp',
  SAVE_SMTP = 'compnayupdatesmtp',

  //employee
  SETTINGS_CHECK_IMPORT__DOCUMENT_TYPE = 'checkimportdoctype',
  SETTINGS_IMPORT_DOCUMENT_TYPE = 'importdoctype',
  SETTING_DOCUMENT_TYPE_DATA_TABLE = 'getdoctypefortable',
  SETTING_DOCUMENT_TYPE_GET = 'getalldoctype',
  SETTING_DOCUMENT_TYPE_DELETE = 'deletedoctype',
  SETTING_DOCUMENT_TYPE_SAVE = 'savedoctype',
  SETTINGS_CHECK_IMPORT_DEPARTMENTS = 'checkimportdepartment',
  SETTINGS_IMPORT_DEPARTMENTS = 'importdepartment',
  SETTING_DEPARTMENTS_DATA_TABLE = 'getdepartmentfortable',
  SETTING_DEPARTMENTS_GET = 'getalldepartment',
  SETTING_DEPARTMENTS_DELETE = 'deletedepartment',
  SETTING_DEPARTMENTS_SAVE = 'savedepartment',
  SETTINGS_CHECK_IMPORT_JOB_TITLE = 'checkimportjobtitle',
  SETTINGS_IMPORT_JOB_TITLE = 'importjobtitle',
  SETTING_JOB_TITLE_DATA_TABLE = 'getjobtitlefortable',
  SETTING_JOB_TITLE_ALL = 'getAlljobtitle',
  SETTING_JOB_TITLE_DELETE = 'deletejobtitle',
  SETTING_JOB_TITLE_SAVE = 'savejobtitle',
  SETTINGS_CHECK_IMPORT_JOB_TYPE = 'checkimportjobtype',
  SETTINGS_IMPORT_JOB_TYPE = 'importjobtype',
  SETTING_JOB_TYPE_DATA_TABLE = 'getjobtypefortable',
  SETTING_JOB_TYPE_ALL = 'getAlljobtype',
  SETTING_JOB_TYPE_DELETE = 'deletejobtype',
  SETTING_JOB_TYPE_SAVE = 'savejobtype',
  SETTINGS_CHECK_IMPORT_RELATIONSHIP = 'checkimportrelationship',
  SETTINGS_IMPORT_RELATIONSHIP = 'importrelationship',
  SETTING_RELATIONSHIP_DATA_TABLE = 'getrelationshipfortable',
  SETTING_RELATIONSHIP_ALL = 'getallrelationships',
  SETTING_RELATIONSHIP_DELETE = 'deleterelationship',
  SETTING_RELATIONSHIP_SAVE = 'saverelationship',
  SETTINGS_IMPORT_LANGUAGE = 'importlanguage',
  SETTINGS_CHECK_IMPORT_LANGUAGE = 'checkimportlanguage',
  OTHER_LANGUAGE_DATA_TABLE = 'getlanguageForTable',
  OTHER_LANGUAGE_GET = 'getlanguage',
  OTHER_LANGUAGE_DELETE = 'deletelanguage',
  OTHER_LANGUAGE_SAVE = 'savelanguage',

  //other settings
  TERMS_DATA_TABLE = 'gettermfortable',
  OTHER_SETTINGS_GET_TERMS = 'getinvoiceterm',
  OTHER_SETTING_SAVE_TERMS = 'saveinvoiceterm',
  OTHER_SETTING_DELETE_TERMS = 'deleteinvoiceterm',
  OTHER_SETTINGS_IMPORT_TERMS = 'importterm',
  OTHER_SETTINGS_CHECK_IMPORT_TERMS = 'checkimportterm',
  VENDOR_TYPE_DATA_TABLE = 'getvendortypefortable',
  OTHER_SETTINGS_GET_VENDOR_TYPE = 'getvendortype',
  OTHER_SETTINGS_SAVE_VENDOR_TYPE = 'savevendortype',
  OTHER_SETTINGS_DELETE_VENDOR_TYPE = 'deletevendortype',
  OTHER_SETTINGS_IMPORT_VENDOR_TYPE = 'importvendortype',
  OTHER_SETTINGS_CHECK_IMPORT_VENDOR_TYPE = 'checkimportvendortype',
  TEXT_RATE_DATA_TABLE = 'gettax_ratefortable',
  OTHER_SETTINGS_GET_TEXT_RATE = 'gettaxrate',
  OTHER_SETTING_SAVE_TEXT_RATE = 'savetaxrate',
  OTHER_SETTING_DELETE_TEXT_RATE = 'deletetaxrate',
  OTHER_SETTINGS_IMPORT_TEXT_RATE = 'importtaxrate',
  OTHER_SETTINGS_CHECK_IMPORT_TEXT_RATE = 'checkimporttaxrate',
  DOCUMENTS_DATA_TABLE = 'getInvoiceDocumentForTable',
  OTHER_SETTINGS_GET_DOCUMENT = 'getinvoicedocument',
  OTHER_SETTING_SAVE_DOCUMENT = 'saveinvoicedocument',
  OTHER_SETTING_DELETE_DOCUMENT = 'deleteInvoiceDocument',
  OTHER_SETTINGS_IMPORT_DOCUMENT = 'importinvoicedocument',
  OTHER_SETTINGS_CHECK_IMPORT_DOCUMENT = 'checkimportinvoicedocument',
  JOB_NAME_DATA_TABLE = 'getjobnamefortable',
  OTHER_SETTING_SAVE_JOB_NAME = 'savejobname',
  OTHER_SETTINGS_GET_JOB_NAME = 'getjobname',
  OTHER_SETTING_DELETE_JOB_NAME = 'deletejobname',
  OTHER_SETTINGS_IMPORT = 'importjobname',
  OTHER_SETTINGS_CHECK_IMPORT_CLASS = 'checkimportclassname',
  OTHER_SETTINGS_IMPORT_CLASS = 'importclassname',

  GET_CLASS_NAME = 'getclassname',
  CLASS_NAME_DATA_TABLE = 'getclassnameForTable',
  SAVE_CLASS_NAME = 'saveclassname',
  DELETE_CLASS_NAME = 'deleteclassname',

  // Document_View
  INVOICE_OTHER_SETTING_UPDATE_ALERTS = 'getupdatesetting',
  PORTAL_ROVUK_INVOICE__SETTINGS_GET_ALL_ALERTS = 'getallsetting',

  // Report
  INVOICE_FOR_REPORT = 'getinvoiceforreport',

  //security
  PORTAL_SETTING_GET = 'getallsetting',
  PORTAL_SETTING_UPDATE = 'getupdatesetting',

  //Alerts
  PORTAL_ROVUK_INVOICE_OTHER_SETTING_UPDATE_ALERTS = 'getupdatesetting',
  PORTAL_SETTING_ROLES_ALL = 'getallrolespermission',
  PORTAL_GET_ALL_USERS = 'getalluser',
  IMPORT_USER = 'checkandinsertimportdata',
  CHECK_IMPORT_USER = 'importemployees',
  // DOCUMENT
  DOCUMENTS_DATATABLE = 'getViewDocumentsDatatableForTable',

  //costcode
  SETTINGS_CHECk_IMPORT_COSTCODE_DATA = 'checkimportcostcode',
  SETTINGS_IMPORT_COSTCODE_DATA = 'importCostCode',
  COSTCODE_DATA_TABLE = 'getCostCodeForTable',
  DELETE_COST_CODE = 'deletecostcode',
  COST_CODE_SAVE = 'savecostcode',
  GET_COST_CODE = 'getallcostcode',

  //usage
  USAGE_DATA_TABLE = 'getCustomerStates',
  PORTAL_SETTING_USEAGE = 'compnayusage',
  GET_AP_API_COUNT = 'getapapicount',


  //role
  SETTING_ROLES_ALL = 'getallrolespermission',
  SETTING_ROLES_SAVE = 'saveRoles',

  //clients
  GET_ALL_COSTCODE = 'getCostCode',
  SAVE_CLIENT = 'saveclient',
  GET_CLIENT = 'getclient',
  CLIENT_DATA_TABLE = 'getClientForTable',
  CLIENT_UPDATE_ALL_STATUS = 'updateMultipleClientStatus',
  CLIENT_DELETE = 'deleteclient',
  CLIENT_GET_ONE = 'getOneClient',
  CLIENT_UPDATE_STATUS = 'updateClientStatus',
  CLIENT_ALL_DELETE = 'deleteMultipleClient',
  CLIENT_GET_HISTORY = 'getClinetHistory',
  CHECK_IMPORT_CLIENT = 'checkimportclient',
  IMPORT_CLIENT = 'importclient',

  // Invoice Message
  GET_INVOICE_MESSAGE_COUNT = 'getinvoicemessagecount',
  GET_INVOICE_MESSAGE_FOR_TABLE = 'getinvoicemessagefortable',
  GET_ONE_INVOICE_MESSAGE = 'getoneinvoicemessage',
  UPDATE_INVOICE_MESSAGE_SEEN_FLAG = 'updateinvoicemessageseenflag',
  SEND_INVOICE_MESSAGE = 'sendinvoicemessage',
  DELETE_INVOICE_MESSAGE = 'deleteinvoicemessage',

  //mail
  SEND_INVOICE_EMAIL = 'sendInvoiceEmail',

  // Invoice
  INVOICE_SAVE_INVOICE_PROCESS = "saveinvoiceprocess",
  GET_INVOICE_FOR_TABLE = 'getapinvoicefortable',
  GET_ONE_INVOICE = 'getoneapinvoice',
  SAVE_INVOICE = 'saveapinvoice',
  SAVE_OTHER_DOCUMENT_INVOICE = 'saveapotherdocumentinvoice',
  DELETE_INVOICE = 'deleteapinvoice',
  SAVE_INVOICE_NOTE = 'saveapinvoicenote',
  DELETE_INVOICE_NOTE = 'deleteapinvoicenote',
  GET_INVOICE_HISTORY = 'getapinvoicehistory',
  SAVE_INVOICE_INFO = 'saveapinvoiceinfo',
  DELETE_INVOICE_INFO = 'deleteapinvoiceinfo',

  GET_ORPHAN_AP_PO = 'getorphanappo',
  GET_ONE_AP_PO = 'getoneappo',
  SAVE_AP_PO = 'saveappo',
  DELETE_AP_PO = 'deleteappo',
  SAVE_AP_OTHER_DOCUMENT_PO = 'saveapotherdocumentpo',
  GET_ORPHAN_AP_QUOTE = 'getorphanapquote',
  GET_ONE_AP_QUOTE = 'getoneapquote',
  SAVE_AP_QUOTE = 'saveapquote',
  DELETE_AP_QUOTE = 'deleteapquote',
  SAVE_AP_OTHER_DOCUMENT_QUOTE = 'saveapotherdocumentquote',
  GET_ORPHAN_AP_PACKLING_SLIP = 'getorphanappackingslip',
  GET_ONE_AP_PACKLING_SLIP = 'getoneappackingslip',
  SAVE_AP_PACKLING_SLIP = 'saveappackingslip',
  DELETE_AP_PACKLING_SLIP = 'deleteappackingslip',
  SAVE_AP_OTHER_DOCUMENT_PACKLING_SLIP = 'saveapotherdocumentpackingslip',
  GET_ORPHAN_AP_RECEVING_SLIP = 'getorphanapreceivingslip',
  GET_ONE_AP_RECEVING_SLIP = 'getoneapreceivingslip',
  SAVE_AP_RECEVING_SLIP = 'saveapreceivingslip',
  DELETE_AP_RECEVING_SLIP = 'deleteapreceivingslip',
  SAVE_AP_OTHER_DOCUMENT_RECEVING_SLIP = 'saveapotherdocumentreceivingslip',
  GET_AP_OTHER_DOCUMENT = 'getapotherdocument',
  GET_ONE_AP_OTHER_DOCUMENT = 'getoneapotherdocument',

  //QuickBook Module
  QUICKBOOK_SAVE_INFO = "savequickbookinfo",
  QUICKBOOK_LOGOUT = "quickbookslogout",
  QUICKBOOK_ISCONNECT = "/webapi/v1/isConnecttoQBO",
  QUICKBOOK_CALLBACK = "callback",

  //save to Database
  SAVE_INVOICE_DATABASE = "/webapi/v1/portal/saveinvoicetoDB",
  SAVE_GLACCOUNTS_DATABASE = "/webapi/v1/portal/saveglaccountstoDB",
  SAVE_VENDORS_DATABASE = "/webapi/v1/portal/savevendorstoDB",

  // Document Process
  SAVE_DOCUMENT_PROCESS = 'saveapdocumentprocess',

  // Report
  GET_INVOICE_FOR_REPORT = 'getapinvoiceforreports',

  // Header
  GET_HEADER_INVOICE_SERACH = 'getheaderapinvoicesearch',

  // Alerts
  GET_ALL_ALERTS = 'getallinvoicealert',
  UPDATE_ALL_ALERTS = 'updateallinvoicealert',
  UPDATE_ALERT = 'updateinvoicealert',
}
