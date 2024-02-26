var mongoose = require('mongoose');

var document_relationship_schema = new mongoose.Schema({
    invoice_id: { type: mongoose.ObjectId, default: "" }, // Invoice Id
    related_po: { type: [mongoose.ObjectId], default: [] }, // Related PO Ids
    related_quote: { type: [mongoose.ObjectId], default: [] }, // Related Quote Ids
    related_packing_slip: { type: [mongoose.ObjectId], default: [] }, // Related Packing Slip Ids
    related_receiving_slip: { type: [mongoose.ObjectId], default: [] }, // Related Receiving Slip Ids 
});

module.exports = document_relationship_schema;

/*
[
    {
        "_id": ObjectId(""), // Document Id of Invoice Collection
        "document_type": "INVOICE",
        "invoice_no": "",
        "po_no": "",
        "vendor": ObjectId("")
    },
    {
        "_id": ObjectId(""), // Document Id of PO Collection
        "document_type": "PURCHASE_ORDER",
        "po_no": "",
        "quote_no": "",
        "vendor": ObjectId("")
    },
    {
        "_id": ObjectId(""), // Document Id of Quote Collection
        "document_type": "QUOTE",
        "quote_no": "",
        "vendor": ObjectId("")
    },
    {
        "_id": ObjectId(""), // Document Id of Packing Slip Collection
        "document_type": "PACKING_SLIP",
        "invoice_no": "", 
        "vendor": ObjectId("")
    },
    {
        "_id": ObjectId(""), // Document Id of Receiving Slip Collection
        "document_type": "RECEIVING_SLIP",
        "invoice_no": "", 
        "vendor": ObjectId("")
    }
];


[
     {
        "_id": "6482b04a7020aede01254bfe",
        "document_type": "PURCHASE_ORDER",
        "po_no": "36",
        "quote_no": "44764918",
        "vendor": "6470a3f821196a08deeab40e"
    },{
        "_id":  "6482b0307020aede01253c56",  
        "document_type": "PACKING_SLIP",
        "invoice_no": "2431", 
        "vendor": "6470a3f821196a08deeab40e"
    }, {
        "_id":   "6482b0887020aede01257b4d" , 
        "document_type": "RECEIVING_SLIP",
        "invoice_no": "2431", 
        "vendor": "6470a3f821196a08deeab40e"
    },
    {
        "_id": "64882513a0d8d25fb8969d4b",
        "document_type": "QUOTE",
        "quote_no": "44764918",
        "vendor": "6470a3f821196a08deeab40e"
    }
]
*/