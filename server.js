var restify = require('restify');
var firebase = require("firebase");

var accountService = require('./accountService.js');

function respondByGeneratingAccessToken(req, res, next) {
    "use strict";
    if (!accountService.validateCredentials(req.params.email, req.params.password)) {
        res.json(401, { type: 'InvalidEmailPassword', message: 'Specified e-mail / password combination is not valid.' });
    } else {
        var token = accountService.generateToken(666);
        res.json(200, { access_token: token });
    }
    next();
}

function respondByCreatingUserAccount(req, res, next) {
    "use strict"; 
    if (accountService.exists(req.params.email)) {
        res.json(409, { type: 'EmailExists', message: 'Specified e-mail address is already registered.' });
    } else {
        accountService.create(req.params.email, req.params.password);
        res.send(201);
    }
    next();
}

var server = restify.createServer();
server.use(restify.bodyParser());
server.post('/access_token', respondByGeneratingAccessToken);
server.post('/accounts', respondByCreatingUserAccount);

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});
