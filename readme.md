# Install Docker on Ubuntu 22.04
1. `sudo apt update`
2. `sudo apt install apt-transport-https curl gnupg-agent ca-certificates software-properties-common -y`
3. `curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -`
4. `sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"`
5. `sudo apt install docker-ce docker-ce-cli containerd.io -y`
6. `sudo usermod -aG docker $USER`
7. `newgrp docker`
8. `docker version` (To verify that the installation was successful)

# Install Docker Compose on Ubuntu 22.04
1. `mkdir -p ~/.docker/cli-plugins/`
2. `curl -SL https://github.com/docker/compose/releases/download/v2.3.3/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose`
3. `chmod +x ~/.docker/cli-plugins/docker-compose`
4. `docker compose version` (To verify that the installation was successful)

# Get back-end source code
1. `git pull https://github.com/roqrivera/rovuk-invoice.git` </br>
2. `cd rovuk-invoice`

# Set credentials
Edit `.env` file

```
INPUT_AWS_ACCESS_KEY_ID=<Your Wassabi access key id>
INPUT_AWS_SECRET_ACCESS_KEY=<Your Wassabi secret access key>

AWS_ACCESS_KEY_ID=<Your AWS access key>
AWS_SECRET_ACCESS_KEY=<Your AWS secret access key>
AWS_DEFAULT_REGION=us-east-1

API_KEY_VALUE=<Your API key for API endpoints, e.g.: 7bb4fb47-449e-4cb4-a143-959514ddf8fe>
```

# Start back-end
`docker compose up --build --scale worker=N -d` </br>
where **N** is number of workers which will process in parallel submitted documents (e.g. 1, 5, 20, 200, 2000 etc.)
</br>
</br>
**Example:**
</br>
`docker compose up --build --scale worker=10 -d`

# Stop back-end
`docker compose down`

# API usage

### API endpoint: Health check
`curl --location --request GET 'http://db-invoice.rovuk.us:8000/'` </br>
</br>
To test whether back-end is running. Response for successful request: {"status": "OK"}
</br>
</br>
### API endpoint: Documents processing
`
curl --request POST 'http://db-invoice.rovuk.us:8000/process' 
--header 'X-API-KEY: <Your API key>' \
--header 'Content-Type: application/json' \
--data-raw '<Your documents to be processed>'
`
</br>
</br>
To submit documents for processing. Response for successful request: `{"status": "OK"}`
</br>
</br>
Request example:

`curl --location --request POST 'http://db-invoice.rovuk.us:8000/process' \
--header 'X-API-KEY: 7bb4fb47-449e-4cb4-a143-959514ddf8fe' \
--header 'Content-Type: application/json' \
--data-raw '{
    "documents": [
        {
            "document_url": "https://s3.us-east-1.wasabisys.com/r-yuri-0/invoice/invoice_page-1.pdf"
        },
        {
            "document_url": "https://s3.us-east-1.wasabisys.com/r-yuri-0/quote/quote_1.pdf"
        },
        {
            "document_url": "https://s3.us-east-1.wasabisys.com/r-yuri-0/packing-slip/ps_packingslip.pdf"
        },
        {
            "document_url": "https://s3.us-east-1.wasabisys.com/r-yuri-0/purchase-order/po_PO FNC for Anil.pdf"
        }
    ]
}
'
`
</br>
</br>
### API endpoint: Documents search
`curl --location --request GET 'http://db-invoice.rovuk.us:8000/search?customer_id=<Your customer-id>&query=<Your query>' \
--header 'X-API-KEY: <Your API key>'
`
</br>
</br>
To search documents
</br>
</br>
Request Example:
</br>
`curl --location --request GET 'http://db-invoice.rovuk.us:8000/search?customer_id=rovukdata&query=abc123' \
--header 'X-API-KEY: 7bb4fb47-449e-4cb4-a143-959514ddf8fe'
`


**Example 1: a partial document from search response**
```
   {
       "document_type": "INVOICE",
       "document_url": "https://s3.us-east-1/invoice_page-1.pdf",
       "document_pages": [
           {
               "fields": {
                   "INVOICE_NUMBER": "00001",
                   "INVOICE_DATE": "MM/DD/YYYY"
               },
               "expense_groups": [
                   [
                       {
                           "ITEM": "Your item name",
                           "PRODUCT_CODE": null,
                           "UNIT_PRICE": "$0.00",
                           "QUANTITY": "1",
                           "PRICE": "$0.00"
                       },
                       {
                           "ITEM": "Your item name",
                           "PRODUCT_CODE": null,
                           "UNIT_PRICE": "$0.00",
                           "QUANTITY": "1",
                           "PRICE": "$0.00"
                       },
                       
                   ]
               ]
           },
           
       ],
       "related_documents": []
   }
```
Notes: </br>
We receive a list of documents, above is an example of a single document
document_pages - a list of pages which belong to the same document, in this example we see a single page. This is a list of dictionaries.
expense_groups - can be a list of lists or (always) null in case of Packing Slip
In this example we see one expense group with two items.
related_documents - a list of documents related to the current document
</br>
</br>
**Example 2: a partial document from search response**
```
   {
       "document_type": "INVOICE",
       "document_url": "https://s3.us-east-1.wasabisys.com/r-yuri-0/invoice/2405.pdf",
       "document_pages": [
           {
               "fields": {
                   "INVOICE_NUMBER": "119414729-0001",
                   "INVOICE_DATE": "11/12/21",
                   "ORDER_DATE": null,
                   "PO_NUMBER": "UF 373",
                   "INVOICE_TO": "VMG CONSTRUCTION INC"
               },
               "expense_groups": [
                   [
                       {
                           "ITEM": "2-3/4 - 3 YD ARTIC LOADER\nAEA7581 Make",
                           "PRODUCT_CODE": "WNKR9002LKLCD0089",
                           "UNIT_PRICE": "570.00",
                           "QUANTITY": "1.00",
                           "PRICE": "2990.00"
                       }
                   ],
                   [
                       {
                           "ITEM": "DIESEL\nDIESEL 2141XXX0000",
                           "PRODUCT_CODE": "2141XXX0000",
                           "UNIT_PRICE": "5.500",
                           "QUANTITY": "9",
                           "PRICE": "49.50"
                       }
                   ]
               ]
           }
       ],
       "related_documents": []
   }
```

Notes:
</br>
expense_groups - In this example we see two expense groups with one item each.
