export enum httproutes {

    ADMIN_CHANGEPASSWORD = "/webapi/v1/superadmin/changepassword",


    USER_LOGOUT = "/webapi/v1/userlogout",
    USER_LOGIN_HISTORY = "/webapi/v1/savelogindetails",
    USER_FORGET_PASSWORD = "/webapi/v1/forgetpassword",
    USER_SEND_PASSWORD = "/webapi/v1/senduserpassword",
    EMPLOYEE_CHANGEPASSWORD = "/webapi/v1/changepassword",
    EMPLOYEE_PERSONAL_EDIT = "/webapi/v1/portal/savepersonalinfo",
    EMPLOYEE_PERSONAL_MOBILE_PIC_EDIT = "/webapi/v1/portal/savemobilephoto",
    EMPLOYEE_CONTACT_EDIT = "/webapi/v1/portal/savecontactinfo",
    // EMPLOYEE_EMPLOYEE_EDIT = "/webapi/v1/portal/saveemployee",
    EMPLOYEE_EMPLOYEE_INFO = "/webapi/v1/portal/saveemployeeinfo",
    EMPLOYEE_DOCUMENT = "/webapi/v1/portal/getuserdocument",
    // EMPLOYEE_GET_SPECIFIC = "/webapi/v1/portal/getspecificusers",
    // EMPLOYEE_SAVE_SIGNATURE = "/webapi/v1/portal/saveusersignature",

    //Emergency contact
    EMERGENCY_CONTACT_SAVE = "/webapi/v1/portal/saveemergencycontact",
    REALTIONSHIP_GET_ALL = "/webapi/v1/portal/getallrelationships",
    EMERGENCY_CONTACT_USERS = "/webapi/v1/portal/getemergencycontact",
    EMERGENCY_CONTACT_USERS_DELETE = "/webapi/v1/portal/deleteemergencycontact",
    EMERGENCY_CONTACT_SEND_REMINDER = "/webapi/v1/portal/sendemergencycontactreminder",

    //QuickBook Module
    QUICKBOOK_SAVE_INFO = "/webapi/v1/savequickbookinfo",
    QUICKBOOK_LOGOUT = "/webapi/v1/quickbookslogout",
    QUICKBOOK_ISCONNECT = "/webapi/v1/isConnecttoQBO",

    //save to Database
    SAVE_INVOICE_DATABASE = "/webapi/v1/portal/saveinvoicetoDB",
    SAVE_GLACCOUNTS_DATABASE = "/webapi/v1/portal/saveglaccountstoDB",
    SAVE_VENDORS_DATABASE = "/webapi/v1/portal/savevendorstoDB",

    //Document opration
    TEAM_DOCUMENT_DELETE = "/webapi/v1/portal/deleteuserdocument",
    TEAM_DOCUMENT_EDIT = "/webapi/v1/portal/edituserdocument",
    TEAM_DELETE = "/webapi/v1/portal/deleteteammember",

    //send invitation
    SEND_INVITATION = "/webapi/v1/portal/sendappinvitation",

    // Shift Module - Portal
    PORTAL_SHIFT_NEW_ADD = "/webapi/v1/portal/saveschedule",

    //auth from other app
    LOGIN_FROM_OTHER_APP = "/webapi/v1/loginfromotherapp",

    //Project setting module -portal
    PROJECT_SETTING_COST_CODE_SAVE = "/webapi/v1/portal/savecostcode",
    PROJECT_SETTING_COST_CODE_DATATABLE = "/webapi/v1/portal/getcostcodefordatatable",
    PROJECT_SETTING_COST_CODE = "/webapi/v1/portal/getcostcode",
    PROJECT_SETTING_COST_CODE_DELETE = "/webapi/v1/portal/deletecostcode",
    PROJECT_SAFETY_TALK_PAST_DATATABLE_USER = "/webapi/v1/portal/getpastsafetytalkUserDatatable",
    PROJECT_DECUMENT_EXPIRATION_SEND = "/webapi/v1/portal/senddocumentexpiration",

    //COMMON SAVE IMAGE
    PORTAL_COMMON_COMPANY_SAVE_PROFILE = "/webapi/v1/portal/saveprofileimagescompany",
    PORTAL_ATTECHMENT = "/webapi/v1/portal/saveattechment",
    PORTAL_SINGATURE = "/webapi/v1/portal/savesignature",

    //Location Module - Portal
    PORTAL_LOCATION_GETDATA = "/webapi/v1/portal/getalllocation",

    //setting module -portal
    PORTAL_SETTING_USEAGE = "/webapi/v1/portal/compnayusage",
    PORTAL_SETTING_CUSTOMER_STATES = "/webapi/v1/portal/getcustomerstatesdatatable",
    PORTAL_SETTING_SMTP = "/webapi/v1/portal/compnaysmtp",
    PORTAL_SETTING_SMTP_UPDATE = "/webapi/v1/portal/compnayupdatesmtp",
    PORTAL_SETTING_GET = "/webapi/v1/portal/getallsetting",
    PORTAL_SETTING_UPDATE = "/webapi/v1/portal/getupdatesetting",
    PORTAL_SETTING_COMPANY_GET = "/webapi/v1/portal/compnayinformation",
    PORTAL_SETTING_COMPANY_UPDATE = "/webapi/v1/portal/compnayupdateinformation",
    PORTAL_SETTING_QUICKBOOK_UPDATE = "/webapi/v1/portal/compnayupdatequickbooks",

    //Company Module
    PORTAL_COMPANY_COSTCODE_GET = "/webapi/v1/portal/getcostcode",
    // PORTAL_COMPANY_STATUS_GET = "/webapi/v1/portal/getstatussetting",
    PORTAL_COMPANY_COSTCODE_XLSX_SAVE = "/webapi/v1/portal/savexlsxcostcode",
    PORTAL_CHECK_AND_INSERT_COSTCODE = "/webapi/v1/portal/savecostcodeindb",
    PORTAL_COMPANY_VENDOR_GET_BY_ID = "/webapi/v1/portal/getvendor",
    PORTAL_COMPANY_VENDOR_DELETE = "/webapi/v1/portal/deletevendor",
    PORTAL_COMPANY_VENDOR_SAVE_XSLX = "/webapi/v1/portal/savevendorxslx",
    PORTAL_COMPANY_VENDOR_SAVE_REPORT = "/webapi/v1/portal/getallvendorreport",
    PORTAL_COMPANY_VENDOR_STATUS_CHANGE = "/webapi/v1/portal/updatevendorstatus",

    //setting document module -portal
    PORTAL_SETTING_DOCUMENT_TYPE_SAVE = "/webapi/v1/portal/savedoctype",
    PORTAL_SETTING_DOCUMENT_TYPE_GET = "/webapi/v1/portal/getalldoctype",
    PORTAL_SETTING_DOCUMENT_TYPE_DELETE = "/webapi/v1/portal/deletedoctype",

    //setting departmeny module -portal
    PORTAL_SETTING_DEPARTMENTS_SAVE = "/webapi/v1/portal/savedepartment",
    PORTAL_SETTING_DEPARTMENTS_GET = "/webapi/v1/portal/getalldepartment",
    PORTAL_SETTING_DEPARTMENTS_DELETE = "/webapi/v1/portal/deletedepartment",

    //setting job tital module -portal
    PORTAL_SETTING_JOB_TITLE_ALL = "/webapi/v1/portal/getAlljobtitle",
    PORTAL_SETTING_JOB_TITLE_SAVE = "/webapi/v1/portal/savejobtitle",
    PORTAL_SETTING_JOB_TITLE_DELETE = "/webapi/v1/portal/deletejobtitle",

    //setting job type -portal
    PORTAL_SETTING_JOB_TYPE_ALL = "/webapi/v1/portal/getAlljobtype",
    PORTAL_SETTING_JOB_TYPE_SAVE = "/webapi/v1/portal/savejobtype",
    PORTAL_SETTING_JOB_TYPE_DELETE = "/webapi/v1/portal/deletejobtype",

    //setting relationship module -portal
    PORTAL_SETTING_RELATIONSHIP_ALL = "/webapi/v1/portal/getallrelationships",
    PORTAL_SETTING_RELATIONSHIP_SAVE = "/webapi/v1/portal/saverelationship",
    PORTAL_SETTING_RELATIONSHIP_DELETE = "/webapi/v1/portal/deleterelationship",

    //setting payroll group module -portal
    PORTAL_SETTING_PAYROLLGROUP_ALL = "/webapi/v1/portal/getAllpayroll_group",
    PORTAL_SETTING_PAYROLLGROUP_SAVE = "/webapi/v1/portal/savepayrollgroup",
    PORTAL_SETTING_PAYROLLGROUP_DELETE = "/webapi/v1/portal/deletepayrollgroup",

    //setting roles module -portal
    PORTAL_SETTING_ROLES_ALL = "/webapi/v1/portal/getallrolespermission",
    PORTAL_SETTING_ROLES_SAVE = "/webapi/v1/portal/saveRoles",

    OTHER_SETTING_CREDIT_CARD_GET = "/webapi/v1/portal/getcreditcardsettings",

    //other setting term module -portal
    OTHER_TERM_GET = "/webapi/v1/portal/getinvoiceterm",
    OTHER_TERM_SAVE = "/webapi/v1/portal/saveinvoiceterm",
    OTHER_TERM_DELETE = "/webapi/v1/portal/deleteInvoiceterm",

    //ID CARD SAVE 
    ID_CARD_SAVE = "/webapi/v1/portal/updateshowidcardflag",

    //other setting language module -portal
    OTHER_LANGUAGE_GET = "/webapi/v1/portal/getlanguage",
    OTHER_LANGUAGE_SAVE = "/webapi/v1/portal/savelanguage",
    OTHER_LANGUAGE_DELETE = "/webapi/v1/portal/deletelanguage",


    //SHORTCUTS 
    SHORTCUTS_SAVE = "/webapi/v1/portal/saveshortcusts",
    SHORTCUTS_GET = "/webapi/v1/portal/getshortcusts",
    SHORTCUTS_DELETE = "/webapi/v1/portal/deleteshortcusts",


    COMPNAY_INFO_OTHER_SETTING_GET = "/webapi/v1/compnayinformation",
    COMPNAY_SMTP_OTHER_SETTING_GET = "/webapi/v1/portal/compnaysmtp",

    COMPNAY_INFO_OTHER_SETTING_UPDATE = "/webapi/v1/editcompany",
    COMPNAY_SMTP_OTHER_SETTING_UPDATE = "/webapi/v1/compnayupdatesmtp",
    COMPNAY_SMTP_OTHER_SETTING_VERIFY = "/webapi/v1/compnayverifysmtp",



    // Employee
    PORTAL_GET_ALL_USERS = "/webapi/v1/portal/getalluser", // For display in team menu
    PORTAL_GET_ALL_USERS_LIST = "/webapi/v1/portal/getalluserlist", // For display user list in dropdown
    PORTAL_GET_MANAGEMENT_USERS = "/webapi/v1/portal/listManagementUser",
    PORTAL_IMPORT_MANAGEMENT_USERS = "/webapi/v1/portal/importManagementUser",

    // Project User
    // PORTAL_GET_USERS_FOR_ADD_PROJECT_USERS = "/webapi/v1/portal/getsuersforaddprojectUser",
    PORTAL_SAVE_PROJECT_USER = "/webapi/v1/portal/savesupplierprojectuser",
    // PORTAL_GET_PROJECT_USER_DATATABLES = "/webapi/v1/portal/getsupplierprojectuserdatatables",
    // PORTAL_GET_PROJECT_USER_HISTORY_DATATABLES = "/webapi/v1/portal/getsupplierprojectuserhistorydatatables",
    PORTAL_GET_USER_PROJECTS_DATATABLES = "/webapi/v1/portal/getsupplierprojectofuserdatatables",



    // Dashboard Charts
    DASHBOARD_CHART_GET_TOTAL_PROJECT_VALUE = "/webapi/v1/portal/getprojectvalue",
    DASHBOARD_CHART_GET_MINORITY_PARTICIPATION = "/webapi/v1/portal/getminorityparticipationvalue",
    DASHBOARD_CHART_GET_TOTAL_NUMBER_BY_DIVISION = "/webapi/v1/portal/getnigpdivisionvalue",
    DASHBOARD_CHART_GET_TOTAL_CONTRACT_VALUE_BYPRIME = "/webapi/v1/portal/gettotalcontractvaluebyprime",
    DASHBOARD_CHART_GET_PROJECT_NUMBER_OF_PAYMENT = "/webapi/v1/portal/getprojectnumberofpayment",
    DASHBOARD_CHART_GET_TOTAL_VALUE_BY_MINORITY = "/webapi/v1/portal/gettotalvaluebyminority",
    DASHBOARD_CHART_GET_SIGNED_UNSIGNED_DAILY_REPORT = "/webapi/v1/portal/getsignedunsigneddailyreport",
    DASHBOARD_CHART_GET_MINORITY_NON_MINORITY_PARTICIPATION = "/webapi/v1/portal/getminorityvsnonminorityparticipation",

    // Users Bulk Upload
    PORTAL_CHECK_AND_INSERT = "/webapi/v1/portal/checkandinsertimportdata",
    PORTAL_EMPLOYEE_REPORT = "/webapi/v1/portal/getallemployeereport",
    PORTAL_EMPLOYEE_IMPORT = "/webapi/v1/portal/importemployees",


    PORTAL_COMPANY_EMPLOYEE_SETTING = "",
    PORTAL_CHECK_AND_INSERT_EMP_SETTING = "",



    SPONSOR_PORTAL_GET_USER_DOCUMENT_HISTORY_DATATABLES = "/webapi/v1/portal/getuserdocumenthistory",



    GET_CHART_LIST = "/webapi/v1/portal/getchartlist",
    SAVE_CHART_LIST = "/webapi/v1/portal/savechartlist",


    TEAM_RECOVER = "/webapi/v1/portal/recoverteam",
    TEAM_AECHIVE = "/webapi/v1/portal/getarchiveteams",
    GET_COMPANY_SETTINGS = "/webapi/v1/getcompanysetting",
    SEND_SUPPLIER_OTP_EMAIL = "/webapi/v1/sendotp",
    SUBMITT_SUPPLIER_OTP = "/webapi/v1/submitemailotp",


    DAILY_REPORT_PROJECT_VIEW = "/webapi/v2/portal/dailyreportpdf",


    PROJECT_ATTACHMENT_HISTORY = "/webapi/v2/portal/getprojectattachmenthistorydatatable",

    PROJECT_TASK_HISTORY = "/webapi/v2/portal/gettaskhistorydatatable",



    PORTAL_COMPANY_OTHER_SETTING = "/webapi/v2/portal/importothersetting",

    PORTAL_ROVUK_SPONSOR_GET_COMPNAY_CODE = "/webapi/v1/getcompanycode",


    PORTAL_ROVUK_SPONSOR_GET_COMPNAY_TYPE = "/webapi/v1/getcompanytype",



    PORTAL_ROVUK_SPONSOR_GET_COMPNAY_SIZE = "/webapi/v1/getcompanysize",

    PORTAL_ROVUK_SPONSOR_GET_PRIME_WORK_PERFORMED = "/webapi/v1/getsupplierprimeworkperformed",

    PORTAL_ROVUK_SPONSOR_GET_CSIDIVISION_WORK_PERFORMED = "/webapi/v1/getcsidivision",
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<invoice-other-setting-term>>>>>>>>>>>>>>>>>>>>>>>>
    PORTAL_ROVUK_INVOICE_OTHER_SETTINGS_GET_TERMS = "/webapi/v1/portal/getinvoiceterm",
    PORTAL_ROVUK_INVOICE_OTHER_SETTING_SAVE_TERMS = "/webapi/v1/portal/saveinvoiceterm",
    PORTAL_ROVUK_INVOICE_OTHER_SETTING_DELETE_TERMS = "/webapi/v1/portal/deleteinvoiceterm",
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<invoice-other-setting-Text-reat>>>>>>>>>>>>>>>>>>>>>>>>
    PORTAL_ROVUK_INVOICE_OTHER_SETTINGS_GET_TEXT_RATE = "/webapi/v1/portal/gettaxrate",
    PORTAL_ROVUK_INVOICE_OTHER_SETTING_SAVE_TEXT_RATE = "/webapi/v1/portal/savetaxrate",
    PORTAL_ROVUK_INVOICE_OTHER_SETTING_DELETE_TEXT_RATE = "/webapi/v1/portal/deletetaxrate",
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<invoice-other-setting-document>>>>>>>>>>>>>>>>>>>>>>>>
    PORTAL_ROVUK_INVOICE_OTHER_SETTINGS_GET_DOCUMENT = "/webapi/v1/portal/getinvoicedocument",
    PORTAL_ROVUK_INVOICE_OTHER_SETTING_SAVE_DOCUMENT = "/webapi/v1/portal/saveinvoicedocument",
    PORTAL_ROVUK_INVOICE_OTHER_SETTING_DELETE_DOCUMENT = "/webapi/v1/portal/deleteInvoiceDocument",

    PORTAL_DASHBOARD_COUNT_GETDATA = "/webapi/v1/portal/getdashboardcount",
    PORTAL_DASHBOARD_CARD_COUNT_GETDATA = "/webapi/v1/portal/getdashboardinvoice",
    PORTAL_DASHBOARD_GET_CHART_DATA = "/webapi/v1/portal/getdashboardchart",
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<invoice-other-setting-Alerta>>>>>>>>>>>>>>>>>>>>>>>>
    PORTAL_ROVUK_INVOICE__SETTINGS_GET_ALL_ALERTS = "/webapi/v1/portal/getallsetting",
    PORTAL_ROVUK_INVOICE_OTHER_SETTING_UPDATE_ALERTS = "/webapi/v1/portal/getupdatesetting",

    PORTAL_ROVUK_INVOICE_TEAM_NEW_HISTORY = "/webapi/v1/portal/getuserhistory",
    GET_GIF_LOADER = "/webapi/v1/getgifloader",
    // vendor module
    INVOICE_SAVE_VENDOR_FORM = "/webapi/v1/portal/savevendor",
    INVOICE_GET_ONE_VENDOR = "/webapi/v1/portal/getonevendor",
    INVOICE_GET_VENDOR_DATATABLES = "/webapi/v1/portal/getvendordatatable",
    INVOICE_ARCHIVE_VENDOR = "/webapi/v1/portal/deletevendor",
    INVOICE_GET_VENDOR_HISTORY = "/webapi/v1/portal/getvendorhistory",
    INVOICE_GET_VENDOR_REPORT = "/webapi/v1/portal/getvendorreport",
    INVOICE_CHANGE_VENDOR_STATUS = "/webapi/v1/portal/vendorStatusUpdate",
    INVOICE_VENDOR_STATUS_COUNT = "/webapi/v1/portal/getvendorstatuscount",
    INVOICE_VENDOR_GET = "/webapi/v1/portal/getvendor",

    // invoice module
    INVOICE_SAVE_INVOICE_PROCESS = "/webapi/v1/portal/saveinvoiceprocess",
    INVOICE_GET_INVOICE_PROCESS = "/webapi/v1/portal/getinvoiceprocess",
    INVOICE_PROCESS_PROGRESS = "/webapi/v1/portal/getprocessprogress",
    INVOICE_PROCESS_INVOICE_DATA = "/webapi/v1/portal/importprocessinvoice",
    INVOICE_IMPORT_MANAGEMENT_INVOICE = "/webapi/v1/portal/importmanagementinvoice",
    INVOICE_IMPORT_MANAGEMENT_PO = "/webapi/v1/portal/importmanagementpo",
    PORTAL_INVOICE_REPORT = "/webapi/v1/portal/getinvoiceexcelreport",
    PORTAL_INVOICE_GET_ORPHAN_DOCUMENTS = "/webapi/v1/portal/getorphandocumentofinvoice",
    PORTAL_SAVE_INVOICE_NOTES = "/webapi/v1/portal/saveinvoicenote",
    PORTAL_DELETE_INVOICE_NOTES = "/webapi/v1/portal/deleteinvoicenote",
    PORTAL_INVOICE_ATTCHMENTS = "/webapi/v1/portal/updateinvoiceattachment",
    PORTAL_VIEW_DOCUMENTS_DATATABLE = "/webapi/v1/portal/getviewdocumetdatatable",
    PORTAL_ORPHAN_DOCUMENTS_DATATABLE = "/webapi/v1/portal/getorphandocumentdatatable",
    PORTAL_DUPLICATE_DOCUMENTS_DATATABLE = "/webapi/v1/portal/getduplicatedocumentdatatable",
    PORTAL_DELETE_DOCUMENTS = "/webapi/v1/portal/deleteviewdocument",
    INVOICE_DOCUMENT_PROCESS_SAVE = "/webapi/v1/portal/updateinvoiceprocess",
    INVOICE_DOCUMENT_PROCESS_GET = "/webapi/v1/portal/getoneinvoiceprocess",
    INVOICE_REQUESR_FOR_INVOICE_FILES = "/webapi/v1/portal/requestforinvoicefile",

    INVOICE_GET_LIST = "/webapi/v1/portal/getinvoice",
    INVOICE_GET_STATUS_VISE_LIST = "/webapi/v1/portal/getinvoicelist",

    INVOICE_GET_ONE_INVOICE = "/webapi/v1/portal/getoneinvoice",
    INVOICE_GET_INVOICE_FOR_REPORT = "/webapi/v1/portal/getinvoiceforreport",
    INVOICE_SAVE_INVOICE = "/webapi/v1/portal/saveinvoice",
    INVOICE_GET_INVOICE_DATATABLE = "/webapi/v1/portal/getinvoicedatatable",
    INVOICE_UPDATE_INVOICE_STATUS = "/webapi/v1/portal/updateinvoicestatus",

    PORTAL_COMPANY_GET_COST_CODE = "/webapi/v1/portal/getinvoicecostcode",


    INVOICE_GET_DASHBOARD_HISTORY = "/webapi/v1/portal/getrecentactivity",
    INVOICE_GET_INVOICE_HISTORY = "/webapi/v1/portal/getinvoicehistorylog",

    // PACKING_SLIP NOTS & ATTCHMENTS
    PORTAL_SAVE_PACKING_SLIP_NOTES = "/webapi/v1/portal/savepackingslipnote",
    PORTAL_DELETE_PACKING_SLIP_NOTES = "/webapi/v1/portal/deletepackingslipnote",
    PACKING_PACKING_SLIP_ATTCHMENTS = "/webapi/v1/portal/updatepackingslipattachment",
    PORTAL_UPDATE_PACKING_SLIP = "/webapi/v1/portal/updateinvoicerelateddocument",

    //P.O Slip NOTS & ATTCHMENTS
    PORTAL_SAVE_P_O_NOTES = "/webapi/v1/portal/saveponote",
    PORTAL_DELETE_P_O_NOTES = "/webapi/v1/portal/deleteponote",
    PORTAL_P_O_ATTCHMENTS = "/webapi/v1/portal/updatepoattachment",
    PORTAL_UPDATE_P_O = "/webapi/v1/portal/updateinvoicerelateddocument",

    // Receiving Slip  NOTS & ATTCHMENTS
    PORTAL_SAVE_Receiving_Slip_NOTES = "/webapi/v1/portal/savereceivingslipnote",
    PORTAL_DELETE_Receiving_Slip_NOTES = "/webapi/v1/portal/deletereceivingslipnote",
    PORTAL_Receiving_Slip_ATTCHMENTS = "/webapi/v1/portal/updatereceivingslipattachment",
    PORTAL_UPDATE_Receiving_Slip = "/webapi/v1/portal/updateinvoicerelateddocument",

    // Quote NOTS & ATTCHMENTS
    PORTAL_SAVE_Quote_NOTES = "/webapi/v1/portal/savequotenote",
    PORTAL_DELETE_Quote_NOTES = "/webapi/v1/portal/deletequotenote",
    PORTAL_Quote_ATTCHMENTS = "/webapi/v1/portal/updatequoteattachment",
    PORTAL_UPDATE_QUOTE = "/webapi/v1/portal/updateinvoicerelateddocument",


    // MAILBOX_MONITOR
    PORTAL_ROVUK_INVOICE_SETTINGS_SAVE_MAILBOX_MONITOR = "/webapi/v1/portal/savemailboxmonitor",
    PORTAL_ROVUK_INVOICE_SETTINGS_MAILBOX_MONITOR_GET_DATA_TABLE = "/webapi/v1/portal/getmailboxmonitordatatable",
    PORTAL_ROVUK_INVOICE_SETTINGS_MAILBOX_MONITOR_GET_ONE_DATA = "/webapi/v1/portal/getonemailboxmonitor",
    PORTAL_ROVUK_INVOICE_SETTINGS_MAILBOX_MONITOR_DELETE = "/webapi/v1/portal/deletemailboxmonitor",

    // Invoice Progress
    PORTAL_GET_ALL_INVOICE_PROGRESS = "/webapi/v1/portal/getallinvoiceprogress",
    PORTAL_GET_INVOICE_PROGRESS = "/webapi/v1/portal/getinvoiceprogress",

    // Alerts
    PORTAL_GET_ALL_ALERTS = "/webapi/v1/portal/getallinvoicealert",
    PORTAL_GET_UNSEEN_ALERT_COUNT = "/webapi/v1/portal/getinvoiceunseencount",
    PORTAL_SAVE_ALERT = "/webapi/v1/portal/saveinvoicealert",
    PORTAL_UPDATE_ALERT = "/webapi/v1/portal/updateinvoicealert",
    ALERTS_DATATABLE = "/webapi/v1/portal/getinvoicealertdatatables",
    ALERTS_REPORT_SEND = "/webapi/v1/portal/getinvoicealertexcelreport",
    PORTAL_UPDATE_ALL_ALERT = "/webapi/v1/portal/updateallinvoicealert",
}
