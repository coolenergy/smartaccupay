var apDocumentRelationshipSchema = require('./../../../../../model/ap_document_relationship');
var apInvoiceSchema = require('./../../../../../model/ap_invoices');
var apPOSchema = require('./../../../../../model/ap_pos');
var apQuoteSchema = require('./../../../../../model/ap_quotes');
var apPackingSlipSchema = require('./../../../../../model/ap_packagingslips');
var apReceivingSlipSchema = require('./../../../../../model/ap_receivingslips');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('./../../../../../controller/common/connectiondb');
let common = require('./../../../../../controller/common/common');
let collectionConstant = require('./../../../../../config/collectionConstant');
var alertController = require('./../alert/alertController');

module.exports.makeAPDocumentRelationship = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let apDocumentRelationshipCollection = connection_db_api.model(collectionConstant.AP_DOCUMENT_RELATIONSHIP, apDocumentRelationshipSchema);
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            var apPOConnection = connection_db_api.model(collectionConstant.AP_PO, apPOSchema);
            var apQuoteConnection = connection_db_api.model(collectionConstant.AP_QUOUTE, apQuoteSchema);
            var apPackingSlipConnection = connection_db_api.model(collectionConstant.AP_PACKING_SLIP, apPackingSlipSchema);
            var apReceivingSlipConnection = connection_db_api.model(collectionConstant.AP_RECEIVING_SLIP, apReceivingSlipSchema);

            for (let m = 0; m < requestObject.length; m++) {
                console.log("DOCUMENT TYPE *********************************** ", requestObject[m].document_type);
                if (requestObject[m].document_type == 'INVOICE') {
                    // Get One Invoice
                    let get_invoice = await apInvoiceConnection.findOne({ _id: ObjectID(requestObject[m]._id) });

                    // Find Invoice related PO
                    let get_po = await apPOConnection.find({ po_no: requestObject[m].po_no, vendor: ObjectID(requestObject[m].vendor), is_orphan: true });
                    for (let n = 0; n < get_po.length; n++) {
                        // Set PO id in relationship against invoice
                        let add_update_relationship = await saveUpdateAPDocumentRelationship(apDocumentRelationshipCollection, requestObject[m]._id, { related_po: ObjectID(get_po[n]._id) });
                        if (add_update_relationship) {
                            // Update PO with orphan flag and invoice_id
                            let update_packing_slip = await apPOConnection.updateOne({ _id: ObjectID(get_po[n]._id) }, { is_orphan: false, invoice_id: ObjectID(requestObject[m]._id) });
                            console.log("add_update_relationship", add_update_relationship);
                            console.log("update_packing_slip", update_packing_slip);
                        }
                    }

                    // Find Invoice related Quote
                    let get_po_for_quote = await apPOConnection.find({ get_invoice: ObjectID(get_invoice._id) });
                    for (let n = 0; n < get_po_for_quote.length; n++) {
                        let get_quote = await apQuoteConnection.findOne({ quote_no: get_po_for_quote[n].quote_no, vendor: ObjectID(requestObject[m].vendor), is_orphan: true });
                        if (get_quote) {
                            // Set Quote id in relationship against invoice
                            let add_update_relationship = await saveUpdateAPDocumentRelationship(apDocumentRelationshipCollection, requestObject[m]._id, { related_po: ObjectID(get_quote._id) });
                            if (add_update_relationship) {
                                // Update Quote with orphan flag and invoice_id
                                let update_quote = await apQuoteConnection.updateOne({ _id: ObjectID(get_quote._id) }, { is_orphan: false, invoice_id: ObjectID(requestObject[m]._id) });
                                console.log("add_update_relationship", add_update_relationship);
                                console.log("update_quote", update_quote);
                            }
                        }
                    }

                    // Find Invoice related Packing Slip
                    let get_packing_slip = await apPackingSlipConnection.find({ invoice_no: requestObject[m].invoice_no, vendor: ObjectID(requestObject[m].vendor), is_orphan: true });
                    for (let n = 0; n < get_packing_slip.length; n++) {
                        // Set Packing Slip id in relationship against invoice
                        let add_update_relationship = await saveUpdateAPDocumentRelationship(apDocumentRelationshipCollection, requestObject[m]._id, { related_packing_slip: ObjectID(get_packing_slip[n]._id) });
                        if (add_update_relationship) {
                            // Update Packing Slip with orphan flag and invoice_id
                            let update_packing_slip = await apPackingSlipConnection.updateOne({ _id: ObjectID(get_packing_slip[n]._id) }, { is_orphan: false, invoice_id: ObjectID(requestObject[m]._id) });
                            console.log("add_update_relationship", add_update_relationship);
                            console.log("update_packing_slip", update_packing_slip);
                        }
                    }

                    // Find Invoice related Receiving Slip
                    let get_receiving_slip = await apReceivingSlipConnection.find({ invoice_no: requestObject[m].invoice_no, vendor: ObjectID(requestObject[m].vendor), is_orphan: true });
                    for (let n = 0; n < get_receiving_slip.length; n++) {
                        // Set Receiving Slip id in relationship against invoice
                        let add_update_relationship = await saveUpdateAPDocumentRelationship(apDocumentRelationshipCollection, requestObject[m]._id, { related_receiving_slip: ObjectID(get_receiving_slip[n]._id) });
                        if (add_update_relationship) {
                            // Update Receiving Slip with orphan flag and invoice_id
                            let update_receiving_slip = await apReceivingSlipConnection.updateOne({ _id: ObjectID(get_receiving_slip[n]._id) }, { is_orphan: false, invoice_id: ObjectID(requestObject[m]._id) });
                            console.log("add_update_relationship", add_update_relationship);
                            console.log("update_receiving_slip", update_receiving_slip);
                        }
                    }
                } else if (requestObject[m].document_type == 'PURCHASE_ORDER') {
                    // Get Invoice based on invoice_no and vendor
                    let get_invoice = await apInvoiceConnection.findOne({ po_no: requestObject[m].po_no, vendor: ObjectID(requestObject[m].vendor) });
                    if (get_invoice) {
                        console.log("related to Invoice: ", get_invoice._id);
                        // Set PO id in relationship against invoice
                        let add_update_relationship = await saveUpdateAPDocumentRelationship(apDocumentRelationshipCollection, get_invoice._id, { related_po: ObjectID(requestObject[m]._id) });
                        if (add_update_relationship) {
                            // Update PO with orphan flag and invoice_id
                            let update_po = await apPOConnection.updateOne({ _id: ObjectID(requestObject[m]._id) }, { is_orphan: false, invoice_id: ObjectID(get_invoice._id) });
                            console.log("add_update_relationship", add_update_relationship);
                            console.log("update_po", update_po);
                            // Get Quote based on quote_no, vendor and orphan
                            let get_quote = await apQuoteConnection.findOne({ quote_no: requestObject[m].quote_no, vendor: ObjectID(requestObject[m].vendor), is_orphan: false, });
                            if (get_quote) {
                                console.log("Has orphan related quote");
                                // Set Quote id in relationship against invoice
                                let update_quote_relationship = await apDocumentRelationshipCollection.updateOne({ invoice_id: ObjectID(get_invoice._id) }, { $push: { related_quote: ObjectID(get_quote._id) } });
                                if (update_quote_relationship) {
                                    // Update Quote with orphan flag and invoice_id
                                    let update_quote = await apQuoteConnection.updateOne({ _id: ObjectID(get_quote._id) }, { is_orphan: false, invoice_id: ObjectID(get_invoice._id) });
                                    console.log("update_quote_relationship: ", update_quote_relationship);
                                    console.log("update_quote: ", update_quote);
                                }
                            }
                        }
                    }
                } else if (requestObject[m].document_type == 'QUOTE') {
                    // Get PO based on quote_no and vendor
                    let get_po = await apPOConnection.findOne({ quote_no: requestObject[m].quote_no, vendor: ObjectID(requestObject[m].vendor) });
                    if (get_po) {
                        console.log("related to PO: ", get_po._id);
                        // Set Quote id in relationship against invoice
                        let add_update_relationship = await saveUpdateAPDocumentRelationship(apDocumentRelationshipCollection, get_po.invoice_id, { related_quote: ObjectID(requestObject[m]._id) });
                        if (add_update_relationship) {
                            // Update Quote with orphan flag and invoice_id
                            let update_quote = await apQuoteConnection.updateOne({ _id: ObjectID(requestObject[m]._id) }, { is_orphan: false, invoice_id: ObjectID(get_po.invoice_id) });
                            console.log("add_update_relationship", add_update_relationship);
                            console.log("update_quote", update_quote);
                        }
                    }
                } else if (requestObject[m].document_type == 'PACKING_SLIP') {
                    // Get Invoice based on invoice_no and vendor
                    let get_invoice = await apInvoiceConnection.findOne({ invoice_no: requestObject[m].invoice_no, vendor: ObjectID(requestObject[m].vendor) });
                    if (get_invoice) {
                        console.log("related to Invoice: ", get_invoice._id);
                        // Set Packing Slip id in relationship against invoice
                        let add_update_relationship = await saveUpdateAPDocumentRelationship(apDocumentRelationshipCollection, get_invoice._id, { related_packing_slip: ObjectID(requestObject[m]._id) });
                        if (add_update_relationship) {
                            // Update Packing Slip with orphan flag and invoice_id
                            let update_packing_slip = await apPackingSlipConnection.updateOne({ _id: ObjectID(requestObject[m]._id) }, { is_orphan: false, invoice_id: ObjectID(get_invoice._id) });
                            console.log("add_update_relationship", add_update_relationship);
                            console.log("update_packing_slip", update_packing_slip);
                        }
                    }
                } else if (requestObject[m].document_type == 'RECEIVING_SLIP') {
                    // Get Invoice based on invoice_no and vendor
                    let get_invoice = await apInvoiceConnection.findOne({ invoice_no: requestObject[m].invoice_no, vendor: ObjectID(requestObject[m].vendor) });
                    if (get_invoice) {
                        console.log("related to Invoice: ", get_invoice._id);
                        // Set Receiving Slip id in relationship against invoice
                        let add_update_relationship = await saveUpdateAPDocumentRelationship(apDocumentRelationshipCollection, get_invoice._id, { related_receiving_slip: ObjectID(requestObject[m]._id) });
                        if (add_update_relationship) {
                            // Update Receiving Slip with orphan flag and invoice_id
                            let update_receiving_slip = await apReceivingSlipConnection.updateOne({ _id: ObjectID(requestObject[m]._id) }, { is_orphan: false, invoice_id: ObjectID(get_invoice._id) });
                            console.log("add_update_relationship", add_update_relationship);
                            console.log("update_receiving_slip", update_receiving_slip);
                        }
                    }
                }
            }

            // Alert  
            let alertObject = {
                user_id: decodedToken.UserData._id,
                module_name: '',
                module_route: {},
                notification_title: translator.getStr('Document_Process_Success_Alert_Title'),
                notification_description: translator.getStr('Document_Process_Success_Alert_Description'),
            };
            alertController.saveAlert(alertObject, connection_db_api);

            res.send({ message: 'Relationship established successfully.', status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

async function saveUpdateAPDocumentRelationship(collection, invoiceId, requestObject) {
    return new Promise(async function (resolve, reject) {
        let get_data = await collection.findOne({ invoice_id: ObjectID(invoiceId) });
        if (get_data) {
            let query = {};
            // requestObject
            // related_po: { type: [mongoose.ObjectId], default: [] }, // Related PO Ids
            // related_quote: { type: [mongoose.ObjectId], default: [] }, // Related Quote Ids
            // related_packing_slip: { type: [mongoose.ObjectId], default: [] }, // Related Packing Slip Ids
            // related_receiving_slip: { type: [mongoose.ObjectId], default: [] }, // Related Receiving Slip Ids 
            if (requestObject.related_po) {
                query = { invoice_id: ObjectID(invoiceId), related_po: requestObject.related_po };
            } else if (requestObject.related_quote) {
                query = { invoice_id: ObjectID(invoiceId), related_quote: requestObject.related_quote };
            } else if (requestObject.related_packing_slip) {
                query = { invoice_id: ObjectID(invoiceId), related_packing_slip: requestObject.related_packing_slip };
            } else if (requestObject.related_receiving_slip) {
                query = { invoice_id: ObjectID(invoiceId), related_receiving_slip: requestObject.related_receiving_slip };
            }
            let get_one = await collection.findOne(query);
            if (get_one) {
                resolve();
            } else {
                let update_relationship = await collection.updateOne({ invoice_id: ObjectID(invoiceId) }, { $push: requestObject });
                resolve(update_relationship);
            }
        } else {
            requestObject.invoice_id = ObjectID(invoiceId);
            var add_relationship = new collection(requestObject);
            var save_relationship = await add_relationship.save();
            resolve(save_relationship);
        }
    });
}