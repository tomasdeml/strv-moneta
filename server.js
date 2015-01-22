var restify = require('restify');
var firebase = require('firebase');
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;

var azure = require('azure-storage'); // TODO REFACTOR

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

function respondByCreatingContact(req, res, next) {
    "use strict";
    
    var rootRef = new firebase('https://resplendent-torch-5630.firebaseio.com/strv-moneta');
    var contactsRef = rootRef.child('contacts');
    var createdContactRef = contactsRef.push({
        firstName: req.params.firstName,
        lastName: req.params.lastName,
        phone: req.params.phone
    });
    
    res.send(201, { key: createdContactRef.key() });
    next();
}

var parseBodyAndRespondByUploadingPhoto = restify.bodyParser({
    multipartHandler: function(part) {
        part.on('data', function(data) {
            var fs = require('fs');
            fs.writeFile('./out.png', data);
        });
    }
});

function respondByUploadingPhotoxxx(req, res, next) {
    var blobSvc = azure.createBlobService();
    blobSvc.createContainerIfNotExists('photoscontainer', function (containerError, containerCreated, containerResponse) {
        if (!containerError) {
            blobSvc.createBlockBlobFromStream('photoscontainer', 'contact-' + req.params.contactId, req, function(blobError, etag, blobResponse) {
                if (!blobError) {
                    res.send(201);
                    next();
                } else {
                    res.send(500);
                    next();
                }
            });
        } else {
            res.send(500);
            next();
        }
    });
    
}

var parseBody = restify.bodyParser();

var server = restify.createServer();
server.use(restify.queryParser());
server.use(passport.initialize());

passport.use(new BearerStrategy(
    function (token, done) {
        //if (err) {
        //    return done(err);
        //}
        //if (!user) {
        //    return done(null, false, { message: 'Incorrect username.' });
        //}
        //if (user.password !== password) {
        //    return done(null, false, { message: 'Incorrect password.' });
        //}
        if (token === 'root')
            return done(null, token);
        
        return done(null, false, { message: 'Incorrect creds' });
    }
));
var authenticate = passport.authenticate('bearer', { session: false });

server.post('/access_token', parseBody, respondByGeneratingAccessToken);
server.post('/accounts', parseBody, respondByCreatingUserAccount);
server.post('/contacts', authenticate, parseBody, respondByCreatingContact);
server.post('/photos', authenticate, parseBodyAndRespondByUploadingPhoto);

var port = process.env.PORT || 8080;
server.listen(port, function () {
    console.log('%s listening at %s', server.name, server.url);
});
