let common = require('../../../../../controller/common/common');
var QuickBooks = require('node-quickbooks');
var OAuthClient = require('intuit-oauth');
var QuickBooks = require('node-quickbooks');
var MongoClient = require('mongodb').MongoClient;
let config = require('../../../../../config/config');
let collectionConstant = require('../../../../../config/collectionConstant');
let tenantsSchema = require('../../../../../model/tenants');
let db_connection = require('../../../../../controller/common/connectiondb');
QuickBooks.setOauthVersion('2.0');

// Instance of client
var url = `mongodb://${config.DB_HOST}:${config.DB_PORT}/`;
var oauthClient = null;
var companycode = "";
const port = 4207;

// AuthorizationUrl

module.exports.savequickBookInfo = async function (req, res) {
    console.log(req.session);

    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        client_id = req.body.quickbooks_client_id;
        client_secret = req.body.quickbooks_client_secret;
        environment = req.body.environment;
        redirectUri = req.body.redirectUri;
        companycode = req.body.companycode;
        oauthClient = new OAuthClient({
            clientId: client_id,
            clientSecret: client_secret,
            environment: environment,                                // ‘sandbox’ or ‘production’
            redirectUri: redirectUri
        });
        var authUri = oauthClient.authorizeUri({ scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.Payment, OAuthClient.scopes.OpenId, OAuthClient.scopes.Profile], state: 'intuit-test' });
        console.log(authUri);
        res.send({ status: true, authUri: authUri });
    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.callback = async function (req, res) {
    // console.log('==== Callback======', req);
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
        try {
            let requestObject = req.body;
            oauthClient = new OAuthClient({
                clientId: requestObject.client_id,
                clientSecret: requestObject.client_secret,
                environment: requestObject.environment,
                redirectUri: requestObject.redirectUri,
            });
            authResponse = await oauthClient.createToken(req.url);
            // console.log("authResponse.getJson(): ", authResponse.getJson());
            // console.log("authResponse : ", authResponse);
            realmId = oauthClient.getToken().realmId;
            // console.log("this is my console");
            oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);

            let tenantsConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_TENANTS, tenantsSchema);
            var updateObject = {
                is_quickbooks_online: true,
                'quickbook_online.client_id': requestObject.client_id,
                'quickbook_online.client_secret': requestObject.client_secret,
                'quickbook_online.access_token': JSON.parse(oauth2_token_json).access_token,
                'quickbook_online.realmId': realmId,
                'quickbook_online.refresh_token': JSON.parse(oauth2_token_json).refresh_token,
                'quickbook_online.access_token_expires_in': Math.round(new Date().getTime() / 1000) + JSON.parse(oauth2_token_json).expires_in,
                'quickbook_online.refresh_token_expires_in': Math.round(new Date().getTime() / 1000) + JSON.parse(oauth2_token_json).x_refresh_token_expires_in,
            };
            console.log("decodedToken.companycode,", decodedToken.companycode);
            var update_data = await tenantsConnection.updateOne({ companycode: decodedToken.companycode }, updateObject);
            console.log("update_data", update_data);
            res.send({ updateObject, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            admin_connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.refreshToken = async function (companycode) {
    console.log("refreshToken call =======> ");
    var translator = new common.Language('en');
    let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
    try {
        if (oauthClient !== null && oauthClient.isAccessTokenValid()) {
            console.log("The access_token is valid");
        }
        if (oauthClient !== null && !oauthClient.isAccessTokenValid()) {
            console.log("Iam in here!!!");
            oauthClient.refresh()
                .then(async function (authResponse) {
                    console.log('The Refresh Token is  ' + JSON.stringify(authResponse.getJson()));
                    oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
                    let tenantsConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_TENANTS, tenantsSchema);
                    var updateObject = {
                        $set: {
                            'quickbook_online.access_token': JSON.parse(oauth2_token_json).access_token,
                            'quickbook_online.refresh_token': JSON.parse(oauth2_token_json).refresh_token
                        }
                    };
                    await tenantsConnection.updateOne({ companycode: companycode }, updateObject);
                })
                .catch(function (e) {
                    console.error(e);
                });
        }
    } catch (e) {
        console.log(e);
        res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
    } finally {
        admin_connection_db_api.close();
    }
};

module.exports.isConnectToQBO = async function (req, res) {
    console.log('~~~~~~~~ isConnectToQBO');
    if (oauthClient !== null && oauthClient.isAccessTokenValid()) {
        console.log('~~~~~~~~ isConnectToQBO 1');
        res.send({ isConnect: true });
    }
    else if (oauthClient !== null && !oauthClient.isAccessTokenValid()) {
        console.log('~~~~~~~~ isConnectToQBO 2');
        res.send({ isConnect: false });
    }
    else {
        console.log('~~~~~~~~ isConnectToQBO 3');
        res.send({ isConnect: false });
    }
};

module.exports.logout = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
        try {
            let requestObject = req.body;
            oauthClient = new OAuthClient({
                clientId: requestObject.client_id,
                clientSecret: requestObject.client_secret,
                environment: requestObject.environment,
                redirectUri: requestObject.redirectUri,
            });
            let tenantsConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_TENANTS, tenantsSchema);
            var updateObject = {
                is_quickbooks_online: false,
                'quickbook_online.client_id': '',
                'quickbook_online.client_secret': '',
                'quickbook_online.access_token': '',
                'quickbook_online.realmId': '',
                'quickbook_online.refresh_token': '',
                'quickbook_online.access_token_expires_in': 0,
                'quickbook_online.refresh_token_expires_in': 0,
            };
            console.log("sagar: ", oauthClient.isAccessTokenValid());
            if (oauthClient.isAccessTokenValid()) {
                oauthClient.revoke()
                    .then(async function (response) {
                        oauthClient = null;
                        await tenantsConnection.updateOne({ companycode: decodedToken.companycode }, updateObject);
                    });
            }
            if (!oauthClient.isAccessTokenValid()) {
                oauthClient = null;
                await tenantsConnection.updateOne({ companycode: decodedToken.companycode }, updateObject);
            }
            res.send({ message: 'Quickbook Online logout successfully.', status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            admin_connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};
