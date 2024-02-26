var Server = require('quickbooks-js');  
var qbXMLHandler = require('./bin/qbXMLHandler/index.js');
var Client = require('./test/client/client.js');
var soapServer = new Server();
var soapClient = new Client();
soapServer.setQBXMLHandler(qbXMLHandler);
soapServer.run();