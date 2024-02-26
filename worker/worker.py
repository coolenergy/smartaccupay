import time
import random
# from processor import process_documents_bundle
from redis import Redis
from pottery import Redlock
from pottery.exceptions import ReleaseUnlockedLock
import os
from PyPDF2 import PdfReader, PdfWriter
from io import BytesIO
import boto3
import json
import hashlib
import boto3
import os

from dotenv import load_dotenv
load_dotenv()

from extractors import ExtractorsManager
from indexer import Indexer


def process_documents_bundle(data):
    for _ in range(3):
        print('#'*100)
    print(f'started process_document_bundle: {data}')

    indices = [i for i in range(len(data['document_url'])) if data['document_url'][i] == '/']
    customer_id = data['document_url'][indices[2] + 1: indices[3]]

    indexer = Indexer()
    custom_fields_conf = _load_custom_fields_conf()
    extracted_documents = ExtractorsManager(data['document_url'], custom_fields_conf).extract()

    redis = Redis.from_url('redis://cache:6379/0')
    customer_lock = Redlock(key=customer_id, masters={redis}, auto_release_time=5*60)
    try:
        with customer_lock:
            indexer.index(customer_id, data['document_id'], data['document_url'], data['document_hash'],
                          extracted_documents)

    except ReleaseUnlockedLock:
        print(f'Released unlocked lock for key: {customer_id} of url: {data["document_url"]}')

    print(f'ended process_document_bundle: {data["document_url"]}')


def _load_custom_fields_conf():
    conf = {}
    for conf_name in ['PURCHASE_ORDER', 'PACKING_SLIP', 'QUOTE', 'INVOICE']:
        try:
            with open(f'/data/custom_fields/{conf_name}.json') as f:
                conf_cont = f.read()
                conf[conf_name] = json.loads(conf_cont)

            print(f'Loaded custom_fields_conf for doctype: {conf_name}')
        except Exception as e:
            print(f'No custom_fields_conf for doctype: {conf_name}')

    print(f'Final custom_fields_conf: {conf}')
    return conf
