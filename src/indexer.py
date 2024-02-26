import pymongo
from pymongo import MongoClient, ASCENDING
from uuid import uuid4
from datetime import datetime
import pprint


class Indexer:
    def __init__(self, conn=None):
        conn = conn or 'mongodb://mongo:27017'
        client = MongoClient(conn)
        self.db = client.rovuk_db

        # If the index already exists, MongoDB will not recreate the index
        self.db.documents.create_index([('searchable', pymongo.TEXT)], name='document_fields')
        self.db.relations.create_index([('relation_id', ASCENDING)], name='relation_id')
        self.db.relations.create_index([('document_id', ASCENDING)], name='document_id')
        self.db.relations.create_index([('document_hash', ASCENDING)], name='document_hash')

    def is_duplicate(self, customer_id, hashes):
        results = self.db.documents.aggregate([
            {'$match': {'customer_id': customer_id, 'document_hash': {'$in': hashes}}},
            {'$group': {'_id': "$document_hash", 'count': {'$sum': 1}}},
        ])

        found_hashes = {
            result['_id']
            for result in results
        }

        return {
            hash_code: hash_code in found_hashes
            for hash_code in hashes
        }

    def update_duplicate_document_bundle(self, customer_id, doc_hash, document_id, s3_docs_bundle_url):
        # n_docs = self.db.documents.count_documents({
        result = self.db.documents.update_many({
            'customer_id': customer_id,
            'document_hash': doc_hash
        }, {
            '$set': {'document_id': document_id, 'url': s3_docs_bundle_url}
        })

        return result.matched_count > 0


    def index(self, customer_id, document_id, s3_docs_bundle_url, doc_hash, documents):
        for doc in documents:
            if doc['parent_i_page'] != -1:
                self.db.documents.update_one({
                    'customer_id': customer_id,
                    'document_id': document_id,
                    'documents.i_page': doc['parent_i_page']
                }, {
                    '$push': {
                        'documents': doc,
                        'searchable': {'$each': list(doc['fields'].values())}
                    }
                })
            else:
                self._index_document(customer_id, document_id, s3_docs_bundle_url, doc)

        self.db.documents.update_many({
            'document_id': document_id
        }, {
            '$set': {'indexed': True, 'document_hash': doc_hash}
        })

    def _index_document(self, customer_id, document_id, s3_docs_bundle_url, document):
        if document['document_type'] == 'PURCHASE_ORDER':
            self._index_purchase_order_document(customer_id, document_id, s3_docs_bundle_url, document)
        elif document['document_type'] == 'PACKING_SLIP':
            self._index_packing_slip_document(customer_id, document_id, s3_docs_bundle_url, document)
        elif document['document_type'] == 'RECEIVING_SLIP':
            self._index_receiving_slip_document(customer_id, document_id, s3_docs_bundle_url, document)
        elif document['document_type'] == 'QUOTE':
            self._index_quote_document(customer_id, document_id, s3_docs_bundle_url, document)
        elif document['document_type'] == 'INVOICE':
            self._index_invoice_document(customer_id, document_id, s3_docs_bundle_url, document)
        elif document['document_type'] == 'UNKNOWN':
            self._index_unknown_document(customer_id, document_id, s3_docs_bundle_url, document)


    def search(self, customer_id, query):
        if 'documents' not in self.db.list_collection_names():
            return []

        documents = list(self.db.documents.find({'customer_id': customer_id, '$text': {'$search': query}}))
        return self._compose_documents(documents)


    def get_documents_by_id(self, customer_id, document_ids):
        print('get_documents_by_id')
        if 'documents' not in self.db.list_collection_names():
            return []

        documents = list(self.db.documents.find({
            'customer_id': customer_id,
            'document_id': {'$in': document_ids},
            'indexed': True,
            # 'document_type': {'$ne': 'UNKNOWN'}
        }))
        documents = self._compose_documents(documents)

        results = {}
        for doc in documents:
            if doc['document_id'] not in results:
                results[doc['document_id']] = []
            results[doc['document_id']].append(doc)

        for did in document_ids:
            if did not in results:
                results[did] = None

        return results

    def _compose_documents(self, documents):
        relation_ids = list({doc['relation_id'] for doc in documents})
        relations = list(self.db.relations.find({"relation_id": {'$in': relation_ids}}))
        related_document_ids = []
        for relation in relations:
            related_document_ids.extend(relation['related'])
        all_related_documents_ids = list(set(related_document_ids))
        all_related_documents = list(self.db.documents.find({"_id": {'$in': all_related_documents_ids}}))
        all_related_documents_map = {document['_id']: document for document in all_related_documents}
        all_relations_map = {relation['relation_id']: relation for relation in relations}

        results = []
        for doc_set in documents:
            doc_set_result = {
                'document_type': doc_set['document_type'],
                'document_id': doc_set['document_id'],
                'document_url': doc_set['url'],
                'document_pages': [{
                        'fields': doc['fields'],
                        'expense_groups': doc.get('expense_groups')
                    }
                    for doc in doc_set['documents']
                ]
            }

            related = all_relations_map[doc_set['relation_id']]['related']
            related = [rel for rel in related if rel != doc_set['_id']]
            doc_set_result['related_documents'] = [{
                    'document_type': all_related_documents_map[rel]['document_type'],
                    'document_id': all_related_documents_map[rel]['document_id'],
                    'document_url': all_related_documents_map[rel]['url'],
                    'document_pages': [{
                            'fields': doc['fields'],
                            'expense_groups': doc.get('expense_groups')
                        }
                        for doc in all_related_documents_map[rel]['documents']
                    ]
                }
                for rel in related
            ]

            results.append(doc_set_result)

        return results

    def calc_stats(self, date_from: str, date_to: str):
        date_from = datetime.fromisoformat(f'{date_from}T00:00:01.000+00:00')
        date_to = datetime.fromisoformat(f'{date_to}T23:59:59.999+00:00')

        results = self.db.documents.aggregate([
            {'$match': {'documents.created_date': {'$gt': date_from, '$lt': date_to}}},
            {'$unwind': "$documents"},
            {'$unwind': "$documents.paid"},
            {'$group': {'_id': "$documents.paid", 'count': {'$sum': 1}}},
        ])

        results = {
            result['_id']: result['count']
            for result in results
        }

        if 'EXPENSE' not in results:
            results['EXPENSE'] = 0

        if 'FORMS' not in results:
            results['FORMS'] = 0

        return results


    def calc_detailed_stats(self, date_from: str, date_to: str):
        date_from = datetime.fromisoformat(f'{date_from}T00:00:01.000+00:00')
        date_to = datetime.fromisoformat(f'{date_to}T23:59:59.999+00:00')

        results = self.db.documents.aggregate([
            {'$match': {'documents.created_date': {'$gt': date_from, '$lt': date_to}}},
            {'$unwind': "$documents"},
            {'$unwind': "$documents.paid"},
            {'$group': {'_id': {"cust_id": "$customer_id",
                                "doc_type": "$document_type",
                                "paid": "$documents.paid"},
                        'count': {'$sum': 1}}},
        ])

        output = {}
        for result in list(results):
            if result['_id']['cust_id'] not in output:
                output[result['_id']['cust_id']] = {
                    'PURCHASE_ORDER': {'EXPENSE': 0, 'FORMS': 0},
                    'PACKING_SLIP': {'EXPENSE': 0, 'FORMS': 0},
                    'RECEIVING_SLIP': {'EXPENSE': 0, 'FORMS': 0},
                    'QUOTE': {'EXPENSE': 0, 'FORMS': 0},
                    'INVOICE': {'EXPENSE': 0, 'FORMS': 0},
                    'UNKNOWN': {'EXPENSE': 0, 'FORMS': 0}
                }

            output[result['_id']['cust_id']][result['_id']['doc_type']][result['_id']['paid']] = result['count']

        return output


    def calc_customer_monthly_stats(self, customer_id: str):
        results = self.db.documents.aggregate([
            {'$match': {'customer_id': customer_id}},
            {'$unwind': "$documents"},
            {'$unwind': "$documents.paid"},
            {'$group': {'_id': {"year": {"$year": "$documents.created_date"},
                                "month": {"$month": "$documents.created_date"},
                                "doc_type": "$document_type",
                                "paid": "$documents.paid"},
                        'count': {'$sum': 1}}},
        ])
        results = list(results)

        output = {}
        for result in list(results):
            ym_key = (result['_id']['year'], result['_id']['month'])
            if ym_key not in output:
                output[ym_key] = {
                    'PURCHASE_ORDER': {'EXPENSE': 0, 'FORMS': 0},
                    'PACKING_SLIP': {'EXPENSE': 0, 'FORMS': 0},
                    'RECEIVING_SLIP': {'EXPENSE': 0, 'FORMS': 0},
                    'QUOTE': {'EXPENSE': 0, 'FORMS': 0},
                    'INVOICE': {'EXPENSE': 0, 'FORMS': 0},
                    'UNKNOWN': {'EXPENSE': 0, 'FORMS': 0}
                }

            output[ym_key][result['_id']['doc_type']][result['_id']['paid']] = result['count']


        def get_ym_key(item):
            ym = item[0]
            return int(ym[0]) * 12 + int(ym[1])

        output = sorted(output.items(), key=lambda item: get_ym_key(item))
        output = [{
                'date': {
                    'year': item[0][0],
                    'month': item[0][1]
                },
                'paid': item[1]
            } for item in output
        ]

        return output


    @staticmethod
    def _generate_uuid():
        return str(uuid4())

    def _relate_to_matched(self, customer_id, matched_document, relation_id):
        # Get existing relations
        src_relation = self.db.relations.find_one({
            'customer_id': customer_id,
            'relation_id': relation_id
        })
        dst_relation = self.db.relations.find_one({
            'customer_id': customer_id,
            'relation_id': matched_document['relation_id']
        })

        # Make common relation
        related = list(set(src_relation['related']).union(set(dst_relation['related'])))

        # Create new relation
        new_relation_id = self._generate_uuid()
        self.db.relations.insert_one({
            'customer_id': customer_id,
            'relation_id': new_relation_id,
            'related': related
        })

        # Update
        for _id in related:
            self.db.documents.update_one({
                '_id': _id
            }, {
                "$set": {'relation_id': new_relation_id}
            })

        return new_relation_id

    def _index_quote_document(self, customer_id, document_id, s3_docs_bundle_url, document):
        n_docs = 0
        if document['fields']['QUOTE_NUMBER'] and document['fields']['VENDOR_NAME']:
            n_docs = self.db.documents.count_documents({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'QUOTE',
                'quote_number': document['fields']['QUOTE_NUMBER'],
                'vendor_name': document['fields']['VENDOR_NAME']
            })

        if n_docs == 0:
            # Add document
            relation_id = self._generate_uuid()
            quote_resp = self.db.documents.insert_one({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'QUOTE',
                'quote_number': document['fields']['QUOTE_NUMBER'],
                'vendor_name': document['fields']['VENDOR_NAME'],
                'documents': [
                    document
                ],
                'relation_id': relation_id,
                'searchable': list(document['fields'].values()),
                'url': s3_docs_bundle_url
            })
            # Add Relation
            self.db.relations.insert_one({
                'customer_id': customer_id,
                'relation_id': relation_id,
                'related': [quote_resp.inserted_id]
            })

            # Match to PO
            if document['fields']['QUOTE_NUMBER'] and document['fields']['VENDOR_NAME']:
                matched_po = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'PURCHASE_ORDER',
                    'quote_number': document['fields']['QUOTE_NUMBER'],
                    'vendor_name': document['fields']['VENDOR_NAME']
                })
                if matched_po:
                    relation_id = self._relate_to_matched(customer_id, matched_po, relation_id)

        else:
            self.db.documents.update_one({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'QUOTE',
                'quote_number': document['fields']['QUOTE_NUMBER'],
                'vendor_name': document['fields']['VENDOR_NAME']
            }, {
                '$push': {
                    'documents': document,
                    'searchable': {'$each': list(document['fields'].values())}
                }
            })


    def _index_unknown_document(self, customer_id, document_id, s3_docs_bundle_url, document):
        # Add document
        relation_id = self._generate_uuid()
        resp = self.db.documents.insert_one({
            'customer_id': customer_id,
            'document_id': document_id,
            'relation_id': relation_id,
            'document_type': 'UNKNOWN',
            'documents': [
                document
            ],
            'url': s3_docs_bundle_url,
            'searchable': list(document['fields'].values()),
        })
        # Add Relation
        self.db.relations.insert_one({
            'customer_id': customer_id,
            'relation_id': relation_id,
            'related': [resp.inserted_id]
        })

    def _index_purchase_order_document(self, customer_id, document_id, s3_docs_bundle_url, document):
        n_docs = 0
        if document['fields']['PO_NUMBER'] and document['fields']['VENDOR_NAME']:
            n_docs = self.db.documents.count_documents({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'PURCHASE_ORDER',
                'po_number': document['fields']['PO_NUMBER'],
                'vendor_name': document['fields']['VENDOR_NAME']
            })

        if n_docs == 0:
            # Add document
            relation_id = self._generate_uuid()
            po_resp = self.db.documents.insert_one({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'PURCHASE_ORDER',
                'po_number': document['fields']['PO_NUMBER'],
                'quote_number': document['fields']['QUOTE_NUMBER'],
                'vendor_name': document['fields']['VENDOR_NAME'],
                'documents': [
                    document
                ],
                'relation_id': relation_id,
                'searchable': list(document['fields'].values()),
                'url': s3_docs_bundle_url
            })
            # Add Relation
            self.db.relations.insert_one({
                'customer_id': customer_id,
                'relation_id': relation_id,
                'related': [po_resp.inserted_id]
            })

            # Match to Quote
            if document['fields']['QUOTE_NUMBER'] and document['fields']['VENDOR_NAME']:
                matched_quote = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'QUOTE',
                    'quote_number': document['fields']['QUOTE_NUMBER'],
                    'vendor_name': document['fields']['VENDOR_NAME']
                })
                if matched_quote:
                    relation_id = self._relate_to_matched(customer_id, matched_quote, relation_id)

            # Match to Invoice
            if document['fields']['PO_NUMBER'] and document['fields']['VENDOR_NAME']:
                matched_invoice = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'INVOICE',
                    'po_number': document['fields']['PO_NUMBER'],
                    'vendor_name': document['fields']['VENDOR_NAME']
                })
                if matched_invoice:
                    relation_id = self._relate_to_matched(customer_id, matched_invoice, relation_id)

            # Match to PS
            if document['fields']['PO_NUMBER'] and document['fields']['VENDOR_NAME']:
                matched_ps = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'PACKING_SLIP',
                    'po_number': document['fields']['PO_NUMBER'],
                    'vendor_name': document['fields']['VENDOR_NAME']
                })
                if matched_ps:
                    relation_id = self._relate_to_matched(customer_id, matched_ps, relation_id)

            # Match to RS
            if document['fields']['PO_NUMBER'] and document['fields']['VENDOR_NAME']:
                matched_ps = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'RECEIVING_SLIP',
                    'po_number': document['fields']['PO_NUMBER'],
                    'vendor_name': document['fields']['VENDOR_NAME']
                })
                if matched_ps:
                    relation_id = self._relate_to_matched(customer_id, matched_ps, relation_id)

        else:
            self.db.documents.update_one({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'PURCHASE_ORDER',
                'po_number': document['fields']['PO_NUMBER'],
                'vendor_name': document['fields']['VENDOR_NAME']
            }, {
                '$push': {
                    'documents': document,
                    'searchable': {'$each': list(document['fields'].values())}
                },
            })

    def _index_invoice_document(self, customer_id, document_id, s3_docs_bundle_url, document):
        n_docs = 0
        if document['fields']['INVOICE_NUMBER'] and document['fields']['VENDOR_NAME']:
            n_docs = self.db.documents.count_documents({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'INVOICE',
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'vendor_name': document['fields']['VENDOR_NAME']
            })

        if n_docs == 0:
            relation_id = self._generate_uuid()
            invoice_resp = self.db.documents.insert_one({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'INVOICE',
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'po_number': document['fields']['PO_NUMBER'],
                'vendor_name': document['fields']['VENDOR_NAME'],
                'documents': [
                    document
                ],
                'relation_id': relation_id,
                'searchable': list(document['fields'].values()),
                'url': s3_docs_bundle_url
            })
            # Add Relation
            self.db.relations.insert_one({
                'customer_id': customer_id,
                'relation_id': relation_id,
                'related': [invoice_resp.inserted_id]
            })

            # Match to PO
            if document['fields']['PO_NUMBER'] and document['fields']['VENDOR_NAME']:
                matched_po = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'PURCHASE_ORDER',
                    'po_number': document['fields']['PO_NUMBER'],
                    'vendor_name': document['fields']['VENDOR_NAME']
                })
                if matched_po:
                    relation_id = self._relate_to_matched(customer_id, matched_po, relation_id)

            # Match to PS
            if document['fields']['INVOICE_NUMBER'] and document['fields']['VENDOR_NAME']:
                matched_ps = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'PACKING_SLIP',
                    'invoice_number': document['fields']['INVOICE_NUMBER'],
                    'vendor_name': document['fields']['VENDOR_NAME']
                })
                if matched_ps:
                    relation_id = self._relate_to_matched(customer_id, matched_ps, relation_id)

            # Match to RS
            if document['fields']['INVOICE_NUMBER'] and document['fields']['VENDOR_NAME']:
                matched_ps = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'RECEIVING_SLIP',
                    'invoice_number': document['fields']['INVOICE_NUMBER'],
                    'vendor_name': document['fields']['VENDOR_NAME']
                })
                if matched_ps:
                    relation_id = self._relate_to_matched(customer_id, matched_ps, relation_id)

        else:
            self.db.documents.update_one({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'INVOICE',
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'vendor_name': document['fields']['VENDOR_NAME']
            }, {
                '$push': {
                    'documents': document,
                    'searchable': {'$each': list(document['fields'].values())}
                }
            })


    def _index_packing_slip_document(self, customer_id, document_id, s3_docs_bundle_url, document):
        n_docs = 0
        if document['fields']['INVOICE_NUMBER'] and document['fields']['PO_NUMBER'] and document['fields']['VENDOR_NAME']:
            n_docs = self.db.documents.count_documents({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'PACKING_SLIP',
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'po_number': document['fields']['PO_NUMBER'],
                'vendor_name': document['fields']['VENDOR_NAME']
            })

        if n_docs == 0:
            # Add document
            relation_id = self._generate_uuid()
            ps_resp = self.db.documents.insert_one({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'PACKING_SLIP',
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'po_number': document['fields']['PO_NUMBER'],
                'vendor_name': document['fields']['VENDOR_NAME'],
                'documents': [
                    document
                ],
                'relation_id': relation_id,
                'searchable': list(document['fields'].values()),
                'url': s3_docs_bundle_url
            })
            # Add Relation
            self.db.relations.insert_one({
                'customer_id': customer_id,
                'relation_id': relation_id,
                'related': [ps_resp.inserted_id]
            })

            # Match to Invoice
            if document['fields']['INVOICE_NUMBER'] and document['fields']['VENDOR_NAME']:
                matched_invoice = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'INVOICE',
                    'invoice_number': document['fields']['INVOICE_NUMBER'],
                    'vendor_name': document['fields']['VENDOR_NAME']
                })
                if matched_invoice:
                    relation_id = self._relate_to_matched(customer_id, matched_invoice, relation_id)

            # Match to PO
            if document['fields']['PO_NUMBER'] and document['fields']['VENDOR_NAME']:
                matched_po = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'PURCHASE_ORDER',
                    'po_number': document['fields']['PO_NUMBER'],
                    'vendor_name': document['fields']['VENDOR_NAME']
                })
                if matched_po:
                    relation_id = self._relate_to_matched(customer_id, matched_po, relation_id)

        else:
            self.db.documents.update_one({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'PACKING_SLIP',
                # Note: since PS does not have a dedicated ID (like PO_NUMBER for PO) we identify it by these:
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'po_number': document['fields']['PO_NUMBER'],
                'vendor_name': document['fields']['VENDOR_NAME']
            }, {
                '$push': {
                    'documents': document,
                    'searchable': {'$each': list(document['fields'].values())}
                }
            })



    def _index_receiving_slip_document(self, customer_id, document_id, s3_docs_bundle_url, document):
        n_docs = 0
        if document['fields']['INVOICE_NUMBER'] and document['fields']['PO_NUMBER'] and document['fields']['VENDOR_NAME']:
            n_docs = self.db.documents.count_documents({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'RECEIVING_SLIP',
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'po_number': document['fields']['PO_NUMBER'],
                'vendor_name': document['fields']['VENDOR_NAME']
            })

        if n_docs == 0:
            # Add document
            relation_id = self._generate_uuid()
            ps_resp = self.db.documents.insert_one({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'RECEIVING_SLIP',
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'po_number': document['fields']['PO_NUMBER'],
                'vendor_name': document['fields']['VENDOR_NAME'],
                'documents': [
                    document
                ],
                'relation_id': relation_id,
                'searchable': list(document['fields'].values()),
                'url': s3_docs_bundle_url
            })
            # Add Relation
            self.db.relations.insert_one({
                'customer_id': customer_id,
                'relation_id': relation_id,
                'related': [ps_resp.inserted_id]
            })

            # Match to Invoice
            if document['fields']['INVOICE_NUMBER'] and document['fields']['VENDOR_NAME']:
                matched_invoice = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'INVOICE',
                    'invoice_number': document['fields']['INVOICE_NUMBER'],
                    'vendor_name': document['fields']['VENDOR_NAME']
                })
                if matched_invoice:
                    relation_id = self._relate_to_matched(customer_id, matched_invoice, relation_id)

            # Match to PO
            if document['fields']['PO_NUMBER'] and document['fields']['VENDOR_NAME']:
                matched_po = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'PURCHASE_ORDER',
                    'po_number': document['fields']['PO_NUMBER'],
                    'vendor_name': document['fields']['VENDOR_NAME']
                })
                if matched_po:
                    relation_id = self._relate_to_matched(customer_id, matched_po, relation_id)

        else:
            self.db.documents.update_one({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'RECEIVING_SLIP',
                # Note: since PS does not have a dedicated ID (like PO_NUMBER for PO) we identify it by these:
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'po_number': document['fields']['PO_NUMBER'],
                'vendor_name': document['fields']['VENDOR_NAME']
            }, {
                '$push': {
                    'documents': document,
                    'searchable': {'$each': list(document['fields'].values())}
                }
            })









if __name__ == '__main__':
    import json

    # -----------------------------------------------------------------------------------------
    def case_1():
        Indexer()._index_quote_document('cust_1', 'doc_id_1', 'doc_url', {
            'fields': {
                'document_type': 'QUOTE',
                'QUOTE_NUMBER': 'q1'
            }
        })

        Indexer()._index_invoice_document('cust_1', 'doc_id_1', 'doc_url', {
            'fields': {
                'document_type': 'INVOICE',
                'INVOICE_NUMBER': 'in1',
                'PO_NUMBER': 'po1',
            }
        })

        Indexer()._index_purchase_order_document('cust_1', 'doc_id_1', 'doc_url', {
            'fields': {
                'document_type': 'PURCHASE_ORDER',
                'PO_NUMBER': 'po1',
                'QUOTE_NUMBER': 'q1'
            }
        })

    def test_relation_case(case, customer_id, drop_db=True):
        if drop_db:
            MongoClient('mongodb://localhost:27017').drop_database('rovuk_db')

        documents = {
            'QUOTE': {
                'document_type': 'QUOTE',
                'fields': {
                    'QUOTE_NUMBER': 'q1',
                    'VENDOR_NAME': 'vend-name-1'
                },
                'parent_i_page': -1
            },
            'INVOICE': {
                'document_type': 'INVOICE',
                'fields': {
                    'INVOICE_NUMBER': 'in1',
                    'PO_NUMBER': 'po1',
                    'VENDOR_NAME': 'vend-name-1'
                },
                'parent_i_page': -1
            },
            'PURCHASE_ORDER': {
                'document_type': 'PURCHASE_ORDER',
                'fields': {
                    'PO_NUMBER': 'po1',
                    'QUOTE_NUMBER': 'q1',
                    'VENDOR_NAME': 'vend-name-1'
                },
                'parent_i_page': -1
            },
            'PACKING_SLIP': {
                'document_type': 'PACKING_SLIP',
                'fields': {
                    'PO_NUMBER': 'po1',
                    'INVOICE_NUMBER': 'in1',
                    'VENDOR_NAME': 'vend-name-1'
                },
                'parent_i_page': -1
            },
            'RECEIVING_SLIP': {
                'document_type': 'RECEIVING_SLIP',
                'fields': {
                    'PO_NUMBER': 'po1',
                    'INVOICE_NUMBER': 'in1',
                    'VENDOR_NAME': 'vend-name-1'
                },
                'parent_i_page': -1
            }
        }

        for doc_type in case:
            if doc_type == 'quote':
                Indexer('mongodb://localhost:27017').index(customer_id, 'doc_id_1',
                                                           'my-s3_docs_bundle_url',
                                                           'doc-hash-1',
                                                           [documents['QUOTE']])
            elif doc_type == 'invoice':
                Indexer('mongodb://localhost:27017').index(customer_id, 'doc_id_1',
                                                           'my-s3_docs_bundle_url',
                                                           'doc-hash-1',
                                                           [documents['INVOICE']])
            elif doc_type == 'po':
                Indexer('mongodb://localhost:27017').index(customer_id, 'doc_id_1',
                                                           'my-s3_docs_bundle_url',
                                                           'doc-hash-1',
                                                           [documents['PURCHASE_ORDER']])
            elif doc_type == 'ps':
                Indexer('mongodb://localhost:27017').index(customer_id, 'doc_id_1',
                                                           'my-s3_docs_bundle_url',
                                                           'doc-hash-1',
                                                           [documents['PACKING_SLIP']])
            elif doc_type == 'rs':
                Indexer('mongodb://localhost:27017').index(customer_id, 'doc_id_1',
                                                           'my-s3_docs_bundle_url',
                                                           'doc-hash-1',
                                                           [documents['RECEIVING_SLIP']])

            else:
                raise Exception(f'Wrong input document type: {doc_type}')

    """Test Relations"""
    # test_relation_case(['quote', 'invoice', 'po'], 'cust_1')
    # test_relation_case(['quote', 'po', 'invoice'], 'cust_1')
    # test_relation_case(['po', 'quote', 'invoice'], 'cust_1')
    # test_relation_case(['po', 'invoice', 'quote'], 'cust_1')
    # test_relation_case(['invoice', 'po', 'quote'], 'cust_1')
    # test_relation_case(['invoice', 'quote', 'po'], 'cust_1')

    # test_relation_case(['quote', 'invoice', 'po'], 'cust_1')
    # test_relation_case(['quote', 'invoice', 'po'], 'cust_1', drop_db=False)

    # --
    # test_relation_case(['ps', 'invoice'], 'cust_1')
    # test_relation_case(['invoice', 'ps'], 'cust_1', drop_db=False)

    # --
    # test_relation_case(['rs', 'invoice'], 'cust_1')
    # test_relation_case(['invoice', 'rs'], 'cust_1')
    # --
    # test_relation_case(['rs', 'po'], 'cust_1')
    # test_relation_case(['po', 'rs'], 'cust_1')

    # --
    # test_relation_case(['invoice', 'ps'], 'cust_1')
    # --
    # test_relation_case(['ps', 'po'], 'cust_1')
    # test_relation_case(['po', 'ps'], 'cust_1')
    # --
    # test_relation_case(['invoice', 'po'], 'cust_1')
    # test_relation_case(['po', 'invoice'], 'cust_1')
    # --
    # test_relation_case(['quote', 'po'], 'cust_1')
    # test_relation_case(['po', 'quote'], 'cust_1')




    # print(Indexer('mongodb://localhost:27017').get_documents_by_id('cust_1', ['doc_id_1']))
    # --


    # test_relation_case(['ps', 'invoice', 'quote', 'po'], 'cust_1')
    # test_relation_case(['po', 'ps', 'invoice', 'quote'], 'cust_1')
    # test_relation_case(['quote', 'invoice', 'ps', 'po'], 'cust_1')
    #
    # --
    # test_relation_case(['quote', 'invoice', 'ps', 'po'], 'cust_1')
    # test_relation_case(['quote', 'invoice', 'ps', 'po'], 'cust_2', drop_db=False)
    # --
    # test_relation_case(['quote', 'invoice', 'ps', 'po'], 'cust_1')
    # test_relation_case(['quote', 'invoice', 'ps', 'po'], 'cust_1', drop_db=False)
    # --




    """Test Search"""
    # test_relation_case(['quote', 'invoice', 'ps', 'po'], 'cust_1')
    # test_relation_case(['quote', 'invoice', 'ps', 'po'], 'cust_1', drop_db=False)
    # print(json.dumps({'search': Indexer('mongodb://localhost:27017').search('cust_1', 'aaa1')}, indent=2))
    # # --
    # test_relation_case(['quote'], 'cust_1')
    # print(json.dumps({'search': Indexer().search('cust_1', 'q1')}, indent=2))
    # --
    # test_relation_case(['invoice', 'ps'], 'cust_1')
    # test_relation_case(['quote'], 'cust_2', drop_db=False)
    # print(json.dumps({'search': Indexer().search('cust_2', 'q1')}, indent=2))
    # --
    # print(json.dumps({'search': Indexer().search('cust_1', '899')}, indent=2))


    def test_index_search():
        MongoClient().drop_database('rovuk_db')

        Indexer()._index_quote_document('cust_1', 'my_s3_url', {
            'document_type': 'QUOTE',
            'fields': {
                'QUOTE_NUMBER': 'q1',
                'FIELD_1': 'value_1'
            }
        })  # , searchable=['aaa1a', 'aaa1b']

        Indexer()._index_quote_document('cust_1', 'my_s3_url', {
            'document_type': 'QUOTE',
            'fields': {
                'QUOTE_NUMBER': 'q1',
                'FIELD_2': 'value_2'
            }
        })  # searchable=['aaa1a', 'aaa2b']

        Indexer()._index_quote_document('cust_1', 'my_s3_url', {
            'document_type': 'QUOTE',
            'fields': {
                'QUOTE_NUMBER': 'q2',
                'FIELD_3': 'value_3'
            }
        })  # searchable=['aaa1a', 'aaa3b']

        Indexer()._index_quote_document('cust_2', 'my_s3_url', {
            'document_type': 'QUOTE',
            'fields': {
                'QUOTE_NUMBER': 'q2',
                'FIELD_3': 'value_3'
            }
        })  # searchable=['aaa1a', 'aaa3b']


        #https://www.mongodb.com/docs/manual/tutorial/limit-number-of-items-scanned-for-text-search/
        # MongoClient().rovuk_db.documents.create_index([("$**", pymongo.TEXT)])  # {$text: {$search: 'value_3'}}
        # MongoClient().rovuk_db.documents.create_index("fields.$**")  # {"documents.fields.FIELD_3": "value_3"}
        #{"documents.fields": "value_1"}
        #

        # https://stackoverflow.com/questions/10610131/checking-if-a-field-contains-a-string


        # MongoClient().rovuk_db.documents.create_index([('searchable', pymongo.TEXT)], name='search_document_fields')  # {$text: {$search: 'value_3'}}
        print(json.dumps({'results': Indexer().search('cust_1', 'value_2')}, indent=2))


    # test_index_search()


    # -----------------------------------------------------------------------------------------
    def load_resp(fn):
        with open(fn) as f:
            response = f.read()
            response = json.loads(response)

        return response

    from extractors import ExtractorsManager

    def test_index_quote():
        fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_QUOTEs_aws_analyze_api/quote_1.pdf.json'
        results_ = ExtractorsManager(load_resp(fn)['ExpenseDocuments']).extract()
        # print(json.dumps(results_, indent=2))
        Indexer()._index_quote_document('cust_1', results_[0])

    def test_index_po():
        # fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_analyze_api/po_PO FNC for Anil.pdf.json'
        fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_analyze_api/po_61cc7994d2045c72475f9ed4po1646925766302.pdf.json'
        results_ = ExtractorsManager(load_resp(fn)['ExpenseDocuments']).extract()
        Indexer()._index_purchase_order_document('cust_1', results_[0])

    def test_index_invoice():
        fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_analyze_api/' \
             'Invoice,8042209225,38077982,PJ WG Renewal 1 year.PDF.json'
        results_ = ExtractorsManager(load_resp(fn)['ExpenseDocuments']).extract()
        print(results_)
        Indexer()._index_invoice_document('cust_1', results_[0])

    def test_index_ps():
        fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_PSs_aws_analyze_api/ps_packingslip.pdf.json'
        results_ = ExtractorsManager(load_resp(fn)['ExpenseDocuments']).extract()
        print(results_)
        Indexer()._index_packing_slip_document('cust_1', results_[0])


    def test_agg():
        import datetime
        from bson.timestamp import Timestamp

        client = MongoClient('mongodb://localhost:27017')
        db = client.rovuk_db

        # db.documents.insert_many([
        #     {
        #         "documents_1": [
        #             {
        #                 "created_date": datetime.datetime.utcnow(),
        #                 "textract": [
        #                     "exp",
        #                     "form"
        #                 ]
        #             },
        #             {
        #                 "created_date": datetime.datetime.utcnow(),
        #                 "textract": [
        #                     "exp"
        #                 ]
        #             }
        #         ]
        #     },
        #     {
        #         "documents_1": [
        #             {
        #                 "created_date": datetime.datetime.utcnow(),
        #                 "textract": [
        #                     "exp"
        #                 ]
        #             }
        #         ]
        #     }
        # ])

        # date_from = datetime.datetime.fromisoformat('2023-02-10T12:40:51.860+00:00')
        # date_to = datetime.datetime.fromisoformat('2023-02-10T12:40:53.860+00:00')
        date_from = datetime.datetime.fromisoformat('2023-02-10T00:00:01.000+00:00')
        date_to = datetime.datetime.fromisoformat('2023-02-28T23:59:59.860+00:00')

        results = db.documents.aggregate([
            # {'$match': {{'documents_1.created_date': {$gt: 70, $lt: 90}}}},
            {'$match': {'documents_1.created_date': {'$gt': date_from, '$lt': date_to}}},
            # {'$match': {'documents_1.created_date': datetime.datetime.fromisoformat('2023-02-10T11:16:48.271+00:00')}},
            {'$unwind': "$documents_1"},
            {'$unwind': "$documents_1.textract"},
            {'$group': {'_id': "$documents_1.textract", 'count': {'$sum': 1}}},
        ])
        import pprint
        pprint.pprint(list(results))
        #https://www.bmc.com/blogs/mongodb-unwind/
        # results = db.documents.count(
        #     {"documents.te": True}
        # )
        # print(results)


    def test_agg_2():
        import datetime

        date_from = datetime.datetime.fromisoformat('2023-02-10T15:43:50.065+00:00')
        date_to = datetime.datetime.fromisoformat('2023-02-28T15:43:52.065+00:00')

        client = MongoClient('mongodb://localhost:27017')
        db = client.rovuk_db

        results = db.documents.aggregate([
            {'$match': {'documents.created_date': {'$gt': date_from, '$lt': date_to}}},
            {'$unwind': "$documents"},
            {'$unwind': "$documents.paid"},
            {'$group': {'_id': "$documents.paid", 'count': {'$sum': 1}}},
        ])
        import pprint
        pprint.pprint(list(results))


    def test_agg_2a():
        import datetime

        date_from = datetime.datetime.fromisoformat('2023-02-10T15:43:50.065+00:00')
        date_to = datetime.datetime.fromisoformat('2023-02-28T15:43:52.065+00:00')

        client = MongoClient('mongodb://localhost:27017')
        db = client.rovuk_db

        results = db.documents.aggregate([
            {'$match': {'documents.created_date': {'$gt': date_from, '$lt': date_to}}},
            {'$unwind': "$documents"},
            {'$unwind': "$documents.paid"},
            # {'$group': {'_id': "$documents.paid", 'count': {'$sum': 1}}},
            {'$group': {'_id': {"cust_id": "$customer_id",
                                "doc_type": "$document_type",
                                "paid": "$documents.paid"},
                        'count': {'$sum': 1}}},
        ])
        results = list(results)
        pprint.pprint(list(results))

        # output = defaultdict(dict)

        output = {}
        for result in list(results):
            if result['_id']['cust_id'] not in output:
                output[result['_id']['cust_id']] = {
                    'other':  {
                        'EXPENSE': 0,
                        'FORMS': 0
                    },
                    'invoice': {
                        'EXPENSE': 0,
                        'FORMS': 0
                    }
                }

            if result['_id']['doc_type'] == 'INVOICE':
                output[result['_id']['cust_id']]['invoice'][result['_id']['paid']] = result['count']
            else:
                output[result['_id']['cust_id']]['other'][result['_id']['paid']] = \
                    output[result['_id']['cust_id']]['other'][result['_id']['paid']] + result['count']


        print('-'*100)
        print(output)


    def test_agg_2b():
        import datetime

        date_from = datetime.datetime.fromisoformat('2023-02-10T15:43:50.065+00:00')
        date_to = datetime.datetime.fromisoformat('2023-02-28T15:43:52.065+00:00')

        client = MongoClient('mongodb://localhost:27017')
        db = client.rovuk_db

        results = db.documents.aggregate([
            {'$match': {'documents.created_date': {'$gt': date_from, '$lt': date_to}}},
            {'$unwind': "$documents"},
            {'$unwind': "$documents.paid"},
            {'$group': {'_id': {"cust_id": "$customer_id",
                                "doc_type": "$document_type",
                                "paid": "$documents.paid"},
                        'count': {'$sum': 1}}},
        ])
        results = list(results)
        pprint.pprint(list(results))

        output = {}
        for result in list(results):
            if result['_id']['cust_id'] not in output:
                output[result['_id']['cust_id']] = {
                    'PURCHASE_ORDER': {'EXPENSE': 0, 'FORMS': 0},
                    'PACKING_SLIP': {'EXPENSE': 0, 'FORMS': 0},
                    'QUOTE': {'EXPENSE': 0, 'FORMS': 0},
                    'INVOICE': {'EXPENSE': 0, 'FORMS': 0},
                    'UNKNOWN': {'EXPENSE': 0, 'FORMS': 0}
                }

            output[result['_id']['cust_id']][result['_id']['doc_type']][result['_id']['paid']] = result['count']

            # output[result['_id']['cust_id']]['other'][result['_id']['paid']] = \
            #     output[result['_id']['cust_id']]['other'][result['_id']['paid']] + result['count']


        print('-'*100)
        print(output)


    def test_agg_2c():
        import datetime

        date_from = datetime.datetime.fromisoformat('2023-02-10T15:43:50.065+00:00')
        date_to = datetime.datetime.fromisoformat('2023-02-28T15:43:52.065+00:00')

        client = MongoClient('mongodb://localhost:27017')
        db = client.rovuk_db

        results = db.documents.aggregate([
            # {'$match': {'documents.created_date': {'$gt': date_from, '$lt': date_to}}},
            {'$match': {'customer_id': 'demo-2-vn'}},
            {'$unwind': "$documents"},
            {'$unwind': "$documents.paid"},
            {'$group': {'_id': {"year": {"$year": "$documents.created_date"},
                                "month": {"$month": "$documents.created_date"},
                                "doc_type": "$document_type",
                                "paid": "$documents.paid"},
                        'count': {'$sum': 1}}},
        ])
        results = list(results)
        # pprint.pprint(results)

        # return

        output = {}
        for result in list(results):
            ym_key = (result['_id']['year'], result['_id']['month'])
            if ym_key not in output:
                output[ym_key] = {
                    'PURCHASE_ORDER': {'EXPENSE': 0, 'FORMS': 0},
                    'PACKING_SLIP': {'EXPENSE': 0, 'FORMS': 0},
                    'QUOTE': {'EXPENSE': 0, 'FORMS': 0},
                    'INVOICE': {'EXPENSE': 0, 'FORMS': 0},
                    'UNKNOWN': {'EXPENSE': 0, 'FORMS': 0}
                }

            # output[result['_id']['month']][result['_id']['doc_type']][result['_id']['paid']] = result['count']
            output[ym_key][result['_id']['doc_type']][result['_id']['paid']] = result['count']


        def get_ym_key(item):
            ym = item[0]
            return int(ym[0]) * 12 + int(ym[1])

        output = sorted(output.items(), key=lambda item: get_ym_key(item))
        output = [{
                'date': {
                    'year': item[0][0],
                    'month': item[0][1]
                },
                'paid': item[1]
            } for item in output
        ]

        print(json.dumps(output, indent=2))



    def test_agg_3():
        import datetime

        date_from = datetime.datetime.fromisoformat('2023-02-10T15:43:50.065+00:00')
        date_to = datetime.datetime.fromisoformat('2023-02-28T15:43:52.065+00:00')

        client = MongoClient('mongodb://localhost:27017')
        db = client.rovuk_db

        hashes = ['3cbb845dc704f1182eb540c51d3d7eceada032ef', 'e53778574454d9f599f4c6e1bd72d7d88dc26cb9']
        results = db.documents.aggregate([
            {'$match': {'customer_id': 'docs-4a', 'document_hash': {'$in': hashes}}},
            {'$group': {'_id': "$document_hash", 'count': {'$sum': 1}}},
        ])
        import pprint
        pprint.pprint(list(results))


    # test_agg_2c()

    # test_agg_3()
    # test_agg_2()
    # test_index_quote()
    # test_index_po()
    # test_index_invoice()
    # test_index_ps()

