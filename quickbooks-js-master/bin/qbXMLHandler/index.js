/*
 * This file is part of quickbooks-js
 * https://github.com/RappidDevelopment/quickbooks-js
 *
 * Based on qbws: https://github.com/johnballantyne/qbws
 *
 * (c) 2015 johnballantyne
 * (c) 2016 Rappid Development LLC
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
var jwt = require('jsonwebtoken');
var tokensecret = "secretCenturion1#";
var request = require("request")
const https = require('https');
var data2xml = require('data2xml');
var xml2js = require('xml2js');
var configData = require('../../config')
var convert = data2xml({
    xmlHeader: '<?xml version="1.0" encoding="utf-8"?>\n<?qbxml version="13.0"?>\n'
});

// Public
module.exports = {

    /**
     * Builds an array of qbXML commands
     * to be run by QBWC.
     *
     * @param callback(err, requestArray)
     */
    fetchRequests: function (callback) {
        buildRequests(callback);
    },


    /**
     * Called when a qbXML response
     * is returned from QBWC.
     *
     * @param response - qbXML response
     */
    handleResponse: function (response) {
        // console.log('I am Here', response);

        // Here connect the database and Store into the Monogdb

        // Convert xml to json
        const parser = new xml2js.Parser({ explicitArray: false });

        parser.parseString(response, async (err, result) => {
            if (err) {
                console.error(err);
            } else {
                const jsonResponse = JSON.stringify(result, null, 2);
                let jsonObj = JSON.parse(jsonResponse);
                var token ="";
                var postData = JSON.stringify({
                    "useremail":configData.ROVUK_AP_EMAIL,
                    "password":configData.ROVUK_AP_PASSWORD,
                    "companycode":configData.ROVUK_AP_COMPANYCODE,
                });
                // console.log(postData);
                var options = {
                    hostname: configData.HOSTNAME,
                    port: configData.PORT,
                    path: '/webapi/v1/login',
                    method: 'POST',
                    rejectUnauthorized: false,
                    headers: {
                         'Content-Type': 'application/json',
                         'Content-Length': postData.length
                       }
                  };
                  var req = https.request(options, (res) => {
                    // console.log('statusCode:', res.statusCode);
                    // console.log('headers:', res.headers);
                    let data = []
                  
                    res.on('data', (d) => {
                        data.push(d);
                    //   process.stdout.write(d);
                      
                    });

                    res.on('end',()=>{
                        const getdata = JSON.parse(Buffer.concat(data).toString());
                        //console.log("getdata",getdata.data.token);
                        token = getdata.data.token;

                        if (jsonObj.QBXML.QBXMLMsgsRs.ClassQueryRs != undefined) {
                            console.log('Class Data available');
                            // console.log(jsonObj.QBXML.QBXMLMsgsRs.ClassQueryRs.ClassRet);
                            let classArr = jsonObj.QBXML.QBXMLMsgsRs.ClassQueryRs.ClassRet;
                            
                            var postData = JSON.stringify(classArr);
                            console.log(postData);
                            var options = {
                                hostname: configData.HOSTNAME,
                                port: configData.PORT,
                                path: '/webapi/v1/portal/checkQBDImportClassName',
                                method: 'POST',
                                rejectUnauthorized: false,
                                headers: {
                                     'Content-Type': 'application/json',
                                     'Content-Length': postData.length,
                                     'authorization': token
                                   }
                              };
                              var req = https.request(options, (res) => {
                                // console.log('statusCode:', res.statusCode);
                                // console.log('headers:', res.headers);
                              
                                res.on('data', (d) => {
                                //   process.stdout.write(d);
                                });
                              });
                              
                              req.on('error', (e) => {
                                console.error(e);
                              });
                              
                              req.write(postData);
                              req.end();
        
                        }

                        if (jsonObj.QBXML.QBXMLMsgsRs.AccountQueryRs != undefined) {
                            console.log('Account Data available');
                            console.log(jsonObj.QBXML.QBXMLMsgsRs.AccountQueryRs.AccountRet);
                            let accountArr =jsonObj.QBXML.QBXMLMsgsRs.AccountQueryRs.AccountRet
                            var postData = JSON.stringify(accountArr);
                            console.log(postData);
                            var options = {
                                hostname: configData.HOSTNAME,
                                port: configData.PORT,
                                path: '/webapi/v1/portal/checkQBDImportCostcode',
                                method: 'POST',
                                rejectUnauthorized: false,
                                headers: {
                                     'Content-Type': 'application/json',
                                     'Content-Length': postData.length,
                                     'authorization': token
                                   }
                              };
                              var req = https.request(options, (res) => {
                                // console.log('statusCode:', res.statusCode);
                                // console.log('headers:', res.headers);
                              
                                res.on('data', (d) => {
                                //   process.stdout.write(d);
                                });
                              });
                              
                              req.on('error', (e) => {
                                console.error(e);
                              });
                              
                              req.write(postData);
                              req.end();
                        }

                        if (jsonObj.QBXML.QBXMLMsgsRs.CustomerQueryRs != undefined) {
                            console.log('Customer Data available');
                           // console.log(jsonObj.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet);
                            let CustomerArr =jsonObj.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet;
                            var postData = JSON.stringify(CustomerArr);
                                    console.log(postData);
                                    var options = {
                                        hostname: configData.HOSTNAME,
                                        port: configData.PORT,
                                        path: '/webapi/v1/portal/checkQBDImportClient',
                                        method: 'POST',
                                        rejectUnauthorized: false,
                                        headers: {
                                             'Content-Type': 'application/json',
                                             'Content-Length': postData.length,
                                             'authorization': token
                                           }
                                      };
                                      var req = https.request(options, (res) => {
                                        // console.log('statusCode:', res.statusCode);
                                        // console.log('headers:', res.headers);
                                      
                                        res.on('data', (d) => {
                                        //   process.stdout.write(d);
                                        });
                                      });
                                      
                                      req.on('error', (e) => {
                                        console.error(e);
                                      });
                                      
                                      req.write(postData);
                                      req.end();
                        }
                      });

                  });
  
                  req.on('error', (e) => {
                    console.error(e);
                  });
                  
                  req.write(postData);
                  req.end();
                  
                // if (jsonObj.QBXML.QBXMLMsgsRs.VendorQueryRs != undefined) {
                //     console.log('Vendor Data available');
                //     console.log(jsonObj.QBXML.QBXMLMsgsRs.VendorQueryRs.VendorRet);
                // }

                // if (jsonObj.QBXML.QBXMLMsgsRs.BillQueryRs != undefined) {
                //     console.log('Bill Data available');
                //     console.log(jsonObj.QBXML.QBXMLMsgsRs.BillQueryRs.BillRet);
                // }

              

            }
        });
    },

    /**
     * Called when there is an error
     * returned processing qbXML from QBWC.
     *
     * @param error - qbXML error response
     */
    didReceiveError: function (error) {
        console.log(error);
    }
};



function buildRequests(callback) {
    console.log('buildRequests call');

    // var postData = JSON.stringify(
    //     {
    //         "is_delete":0
    //     }
    // );
    // console.log(postData);
    // var options = {
    // hostname: configData.HOSTNAME,
    // port: configData.PORT,
    // path: '/webapi/v1/portal/getclassnameForTable',
    // method: 'POST',
    // rejectUnauthorized: false,
    // headers: {
    //     'Content-Type': 'application/json',
    //     'Content-Length': postData.length,
    //     'authorization': token
    //     }
    // };
    // var req = https.request(options, (res) => {
    // // console.log('statusCode:', res.statusCode);
    // // console.log('headers:', res.headers);
                              
    // res.on('data', (d) => {
    // //   process.stdout.write(d);
    // });
    // });
                              
    // req.on('error', (e) => {
    //     console.error(e);
    // });
                              
    // req.write(postData);
    // req.end();
    // Call API and get data from Database to upload on the Quickbooks Desktop

    var requests = new Array();
    var xml = convert(
        'QBXML',
        {
            QBXMLMsgsRq: {
                _attr: { onError: 'stopOnError' },
                // VendorQueryRq: {
                //     MaxReturned: 1000,
                //     ActiveStatus: "ActiveOnly" // All, ActiveOnly, InactiveOnly 
                // },
                CustomerQueryRq: {
                    MaxReturned: 1000,
                },
                ClassQueryRq: {
                    MaxReturned: 1000,
                },
                // BillQueryRq: {
                //     MaxReturned: 1000,
                // },
                AccountQueryRq: {
                    MaxReturned: 1000,
                },
                // VendorAddRq : {
                //     VendorAdd: {
                //         Name: "CI PVT.LTD WITH ADDRESS",
                //         CompanyName: "Centurion Infotech",
                //         FirstName: "Krunal",
                //         LastName: "Tailor",
                //         VendorAddress: {
                //             Addr1: "123 Main Street",
                //             City: "Anytown",
                //             State: "CA",
                //             PostalCode: "12345",
                //             Country: "United States"
                //         },
                //         Email: "krunal@centurioninfotech.com"
                //     }
                // },
                // CustomerAddRq : {
                //     CustomerAdd : {
                //         Name: "Ridaro",
                //         CompanyName: "Ridaro Inc.",
                //         FirstName: "Roque",
                //         LastName: "Rivera",
                //         BillAddress: {
                //             Addr1: "Eastern XYZ University",
                //             Addr2: "College of Engineering",
                //             Addr3: "123 XYZ Road",
                //             City: "Orlando",
                //             State: "FL",
                //             PostalCode: "06268",
                //             Country: "United States"
                //         },
                //         Phone: "860-634-1602",
                //         Email: "keith@consolibyte.com"
                //     }
                // }
                // ClassAddRq : {
                //     ClassAdd : {
                //         Name: "Marketing",
                //         IsActive: true
                //     }
                // },
                // BillAddRq : {
                //     BillAdd : {
                //         VendorRef : {
                //             FullName  : "Bob's Burger Joint",
                //         },
                //         TxnDate : "2023-05-30",
                //         DueDate : "2023-06-30",
                //         RefNumber : "1234567",
                //         ExpenseLineAdd: {
                //             AccountRef: {
                //                 FullName : "Utilities"
                //             },
                //             Amount: "807.06"
                //         }
                //     }
                // },
                // AccountAddRq: {
                //     AccountAdd : {
                //         Name: "Centurion Infotech",
                //         AccountType: "Bank",
                //         BankNumber: "0350039560"
                //     }
                // },


                /// A/P Database connect - Mongo Databse
            },
        }
    );

    requests.push(xml);

    return callback(null, requests);
}