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

module.exports = require('./lib/server');

const soap = require('soap');

// Define the  URL for QuickBooks Web Connector
const url = 'http://localhost:8080/wsdl?wsdl';

// Create a SOAP client
soap.createClient(url, function(err, client) {
  if (err) {
    console.error('Failed to create SOAP client:', err);
    return;
  }
  console.log(client.serverVersion);


});
