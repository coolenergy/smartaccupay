var CronJob = require('cron').CronJob;
var config = require('./../../../../../config/config');
let common = require('./../../../../../controller/common/common');
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');
let rest_Api = require("../../../../../config/db_rest_api");
var processInvoiceSchema = require('./../../../../../model/process_invoice');
var invoiceSettingsSchema = require('./../../../../../model/settings');
var ObjectID = require('mongodb').ObjectID;

module.exports.deleteOrphanDocumentCronAPI = async function (req, res) {
    deleteOrphanDocumentCronFunction();
};

async function deleteOrphanDocumentCronFunction() {
    try {
        let connection_MDM_main = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
        let All_Compnay = await rest_Api.find(connection_MDM_main, collectionConstant.SUPER_ADMIN_COMPANY, { companystatus: 1, companycode: { $ne: '' } });
        for (const item_new of All_Compnay) {
            let item = await rest_Api.findOne(connection_MDM_main, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: item_new.companycode });
            let connection_db_api = await db_connection.connection_db_api(item);
            let processInvoiceCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            let invoiceSettingsCollection = connection_db_api.model(collectionConstant.INVOICE_SETTING, invoiceSettingsSchema);
            var get_setting = await invoiceSettingsCollection.findOne({});
            var settings = get_setting.settings;
            if (settings.Archive_Orphan_Document) {
                if (settings.Archive_Orphan_Document.setting_status == 'Active') {
                    let date = new Date(new Date().setDate(new Date().getDate() - Number(settings.Archive_Orphan_Document.setting_value)));
                    let dateEpoch = common.timeDateToepoch(date.setHours(0, 0, 0, 0));
                    let find_data = await processInvoiceCollection.find({ created_at: { $lte: dateEpoch }, is_delete: 0 });
                    console.log("************************************ ", item_new.companycode, "--------", find_data.length);
                    for (let m = 0; m < find_data.length; m++) {
                        let update_data = await processInvoiceCollection.updateOne({ _id: ObjectID(find_data[m]._id) }, { is_delete: 1 });
                        console.log("update_data", update_data);
                    }
                }
            }
        }
        console.log("--------------------Archive orphan document CRON done--------------------");
    } catch (e) {
        console.log(e);
    }
}

var invoiceDueCron = new CronJob(config.CRON_JOB.ARCHIVE_ORPHAN_DOCUMENT, async function () {
    deleteOrphanDocumentCronFunction();
});
// invoiceDueCron.start();