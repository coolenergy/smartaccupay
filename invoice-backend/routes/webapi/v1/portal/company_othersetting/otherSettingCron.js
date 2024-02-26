var CronJob = require('cron').CronJob;
var fs = require('fs');
var handlebars = require('handlebars');
let sendEmail = require('./../../../../../controller/common/sendEmail');
var config = require('./../../../../../config/config');
let common = require('./../../../../../controller/common/common');
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');
let rest_Api = require("../../../../../config/db_rest_api");
let companyCollection = "company";
let tenantsCollection = "tenants";
var ObjectID = require('mongodb').ObjectID;
var customerStateSchema = require('./../../../../../model/customer_monthly_states');

module.exports.customerMonthlyState = async function (req, res) {
    customerMonthlyStateCronFunction();
};

async function customerMonthlyStateCronFunction() {
    try {
        let connection_MDM_main = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
        let All_Compnay = await rest_Api.find(connection_MDM_main, companyCollection, { companystatus: 1, companycode: { $ne: '' } });
        let final_object = [];
        for (const item_new of All_Compnay) {
            let get_data = await common.getCustomerStates(item_new.companycode.toLowerCase());
            if (get_data.status) {
                let item = await rest_Api.findOne(connection_MDM_main, tenantsCollection, { companycode: item_new.companycode });
                let connection_db_api = await db_connection.connection_db_api(item);
                let customerStateCollection = connection_db_api.model(collectionConstant.INVOICE_CUSTOMER_STATES, customerStateSchema);
                for (let i = 0; i < get_data.data.length; i++) {
                    let currenntData = get_data.data[i];
                    let get_one = await customerStateCollection.findOne({ year: currenntData.date.year, month: currenntData.date.month });
                    let reqObject = {
                        year: currenntData.date.year,
                        month: currenntData.date.month,
                        po_expense: 0,
                        po_forms: 0,
                        packing_slip_expense: 0,
                        packing_slip_forms: 0,
                        receiving_slip_expense: 0,
                        receiving_slip_forms: 0,
                        quote_expense: 0,
                        quote_forms: 0,
                        invoice_expense: 0,
                        invoice_forms: 0,
                        unknown_expense: 0,
                        unknown_forms: 0,
                    };
                    if (currenntData.paid.PACKING_SLIP) {
                        reqObject.packing_slip_expense = currenntData.paid.PACKING_SLIP.EXPENSE;
                        reqObject.packing_slip_forms = currenntData.paid.PACKING_SLIP.FORMS;
                    }
                    if (currenntData.paid.RECEIVING_SLIP) {
                        reqObject.receiving_slip_expense = currenntData.paid.RECEIVING_SLIP.EXPENSE;
                        reqObject.receiving_slip_forms = currenntData.paid.RECEIVING_SLIP.FORMS;
                    }
                    if (currenntData.paid.QUOTE) {
                        reqObject.quote_expense = currenntData.paid.QUOTE.EXPENSE;
                        reqObject.quote_forms = currenntData.paid.QUOTE.FORMS;
                    }
                    if (currenntData.paid.INVOICE) {
                        reqObject.invoice_expense = currenntData.paid.INVOICE.EXPENSE;
                        reqObject.invoice_forms = currenntData.paid.INVOICE.FORMS;
                    }
                    if (currenntData.paid.UNKNOWN) {
                        reqObject.unknown_expense = currenntData.paid.UNKNOWN.EXPENSE;
                        reqObject.unknown_forms = currenntData.paid.UNKNOWN.FORMS;
                    }
                    //Update
                    if (get_one) {
                        let update_invoice = await customerStateCollection.updateOne({ _id: ObjectID(get_one._id) }, reqObject);
                    }
                    // Insert
                    else {
                        let add_customer_state = new customerStateCollection(reqObject);
                        let save_customer_state = await add_customer_state.save();
                    }
                }
            }
        }
    } catch (e) {
        console.log("error:=========", e);
    }
}

// '*/1 * * * *'
var customerMonthlyStateCron = new CronJob(config.CRON_JOB.CUSTOMER_STATES, async function () {
    customerMonthlyStateCronFunction();
});
customerMonthlyStateCron.start();
