from fastapi import FastAPI, Query
from typing import List
from pydantic import BaseModel
from indexer import Indexer
from starlette.status import HTTP_403_FORBIDDEN
import os
from fastapi import Security, Depends, HTTPException
from fastapi.security.api_key import APIKeyHeader

from redis import Redis
from rq import Queue
import boto3
import hashlib


from dotenv import load_dotenv
load_dotenv()



authorizer = APIKeyHeader(name='X-API-KEY', auto_error=True)


async def auth(api_key_value: str = Security(authorizer)):
    if api_key_value == os.environ['API_KEY_VALUE']:
        return
    else:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN, detail="Not authenticated"
        )


app = FastAPI()
q = Queue(connection=Redis.from_url('redis://cache:6379/0'))

indexer = Indexer()


@app.get("/")
def health_check():
    print('health_check')
    return {"status": "OK"}


def _calc_document_bundle_hash(documents_bundle_url):
    indices = [i for i in range(len(documents_bundle_url)) if documents_bundle_url[i] == '/']
    endpoint_url = documents_bundle_url[:indices[2]]
    bucket = documents_bundle_url[indices[2] + 1: indices[3]]
    key = documents_bundle_url[indices[3] + 1:]

    # Connect to source s3
    input_s3 = boto3.client(
        's3',
        endpoint_url=endpoint_url,
        aws_access_key_id=os.getenv('INPUT_AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('INPUT_AWS_SECRET_ACCESS_KEY')
    )

    # Get bucket object
    result = input_s3.get_object(Bucket=bucket, Key=key)
    raw_bytes_data = result['Body'].read()

    # Hash
    h1 = hashlib.sha1()
    h1.update(raw_bytes_data)
    return h1.hexdigest()  # 160 bits



class Document(BaseModel):
    document_url: str
    document_id: str


class Documents(BaseModel):
    documents: List[Document]


@app.post("/process")
async def process(data: Documents, _=Depends(auth)):
    print(f'process: {data=}')
    if len(data.documents) == 0:
        return {}

    document_hashes = {
        document.document_url: _calc_document_bundle_hash(document.document_url)
        for document in data.documents
    }

    document_url = data.documents[0].document_url
    indices = [i for i in range(len(document_url)) if document_url[i] == '/']
    customer_id = document_url[indices[2] + 1: indices[3]]

    hashes_status = indexer.is_duplicate(customer_id, list(document_hashes.values()))

    response = {}
    for document in data.documents:
        if not hashes_status[document_hashes[document.document_url]]:
            r = q.enqueue(
                'worker.process_documents_bundle', {
                    'document_url': document.document_url,
                    'document_id': document.document_id,
                    'document_hash': document_hashes[document.document_url]
                },
                job_timeout=600  # 10min
            )
            print('sent_task:', document.document_url, r)
            response[document.document_id] = 'SENT_FOR_PROCESSING'
        else:
            print('duplicate:', document)
            response[document.document_id] = 'ALREADY_EXISTS'

    return response


@app.get("/get_documents_by_id")
async def get_documents_by_id(customer_id: str, document_id: List[str] = Query(default=None), _=Depends(auth)):
    print(f'get_documents_by_id: {customer_id=}, {document_id=}')
    return indexer.get_documents_by_id(customer_id, document_id)


@app.get("/search")
async def search(customer_id: str, query: str, _=Depends(auth)):
    print(f'search: {customer_id=}, {query=}')
    return indexer.search(customer_id, query)


@app.get("/stats")
async def stats(date_from: str, date_to: str, _=Depends(auth)):
    print(f'stats: {date_from=}, {date_to=}')
    return indexer.calc_stats(date_from, date_to)


@app.get("/detailed_stats")
async def detailed_stats(date_from: str, date_to: str, _=Depends(auth)):
    print(f'detailed_stats: {date_from=}, {date_to=}')
    return indexer.calc_detailed_stats(date_from, date_to)


@app.get("/customer_monthly_stats")
async def customer_monthly_stats(customer_id: str, _=Depends(auth)):
    print(f'customer_monthly_stats: {customer_id=}')
    return indexer.calc_customer_monthly_stats(customer_id)
