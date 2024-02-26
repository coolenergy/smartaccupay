var express = require('express');
var router = express.Router();
//const accountQuery = require('../buildRequests/accountQuery');
const xml2js = require('xml2js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
 /*  const t =  '{"QBXML":{"QBXMLMsgsRs":[{"AccountQueryRs":[{"$":{"statusCode":"0","statusSeverity":"Info","statusMessage":"Status OK"},"AccountRet":[{"ListID":["80000007-1627017997"],"TimeCreated":["2021-07-23T10:56:37+05:30"],"TimeModified":["2021-07-23T10:56:37+05:30"],"EditSequence":["1627017997"],"Name":["Xoriant-TestAcc01"],"FullName":["Xoriant-TestAcc01"],"IsActive":["true"],"Sublevel":["0"],"AccountType":["Bank"],"Desc":["Xoriant-TestAcc01"],"Balance":["0.00"],"TotalBalance":["0.00"],"CashFlowClassification":["NotApplicable"]},{"ListID":["80000006-1626684536"],"TimeCreated":["2021-07-19T14:18:56+05:30"],"TimeModified":["2021-07-19T14:18:56+05:30"],"EditSequence":["1626684536"],"Name":["Payroll Liabilities"],"FullName":["Payroll Liabilities"],"IsActive":["true"],"Sublevel":["0"],"AccountType":["OtherCurrentLiability"],"SpecialAccountType":["PayrollLiabilities"],"AccountNumber":["24000"],"Desc":["Unpaid payroll liabilities. Amounts withheld or accrued, but not yet paid"],"Balance":["0.00"],"TotalBalance":["0.00"],"CashFlowClassification":["Operating"]},{"ListID":["80000004-1626684534"],"TimeCreated":["2021-07-19T14:18:54+05:30"],"TimeModified":["2021-07-19T14:18:54+05:30"],"EditSequence":["1626684534"],"Name":["Opening Balance Equity"],"FullName":["Opening Balance Equity"],"IsActive":["true"],"Sublevel":["0"],"AccountType":["Equity"],"SpecialAccountType":["OpeningBalanceEquity"],"AccountNumber":["30000"],"Desc":["Opening balances during setup post to this account. The balance of this account should be zero after completing your setup"],"Balance":["0.00"],"TotalBalance":["0.00"],"CashFlowClassification":["Financing"]},{"ListID":["80000003-1626684534"],"TimeCreated":["2021-07-19T14:18:54+05:30"],"TimeModified":["2021-07-19T14:18:54+05:30"],"EditSequence":["1626684534"],"Name":["Retained Earnings"],"FullName":["Retained Earnings"],"IsActive":["true"],"Sublevel":["0"],"AccountType":["Equity"],"SpecialAccountType":["RetainedEarnings"],"AccountNumber":["32000"],"Desc":["Undistributed earnings of the business"],"Balance":["0.00"],"TotalBalance":["0.00"],"CashFlowClassification":["Financing"]},{"ListID":["80000005-1626684536"],"TimeCreated":["2021-07-19T14:18:56+05:30"],"TimeModified":["2021-07-19T14:18:56+05:30"],"EditSequence":["1626684536"],"Name":["Payroll Expenses"],"FullName":["Payroll Expenses"],"IsActive":["true"],"Sublevel":["0"],"AccountType":["Expense"],"SpecialAccountType":["PayrollExpenses"],"AccountNumber":["66000"],"Desc":["Payroll expenses"],"Balance":["0.00"],"TotalBalance":["0.00"],"CashFlowClassification":["None"]}]}]}]}}';
  res.send(t); */
//res.send('Shalaka');

    //set request
   // const getXMLRequest = require('../request-response/getXMLRequest');
   // getXMLRequest.setTempXml(accountQuery.tempRequest);
    //var QuickbooksServer = require('../index');

     setTimeout(function(){
      console.log("Executing"); 
      //get response
      const resp = require('../request-response/getXMLResponse');
      //console.log(resp.getAccountQueryRs());  
      
   
      var parseString = require('xml2js').parseString;
      //var xml = '<?xml version="1.0" encoding="UTF-8" ?><business><company>Code Blog</company><owner>Nic Raboy</owner><employee><firstname>Nic</firstname><lastname>Raboy</lastname></employee><employee><firstname>Maria</firstname><lastname>Campos</lastname></employee></business>';
      parseString(resp.getAccountQueryRs(), function (err, result) {
         // console.log(JSON.stringify(result));
          //res.set('Content-Type', 'application/json');
          res.send(JSON.stringify(result)); 
      });
    
    },1000); 
    
      

});

module.exports = router;