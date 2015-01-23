var restify = require('restify');
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;

var azure = require('azure-storage'); // TODO REFACTOR

var UserAccount = require('./UserAccount.js');
var Contact = require('./Contact.js');
var AuthToken = require('./AuthToken.js');

function respondWithServerError(res) {
    res.json(500, { type: 'InternalServerError', message: 'Unspecified error occured.' });
}

function respondByGeneratingAccessToken(req, res, next) {
    "use strict";
    UserAccount.validateCredentials(req.params.email, req.params.password, function (error, isValid) {
        if (error) {
            respondWithServerError(res);
        } else if (!isValid) {
            res.json(401, { type: 'InvalidEmailPassword', message: 'Specified e-mail / password combination is not valid.' });
        } else {
            var token = AuthToken.generate(req.params.email);
            res.json(200, { access_token: token });
        }
        next();
    });
}

function respondByCreatingUserAccount(req, res, next) {
    "use strict";
    UserAccount.exists(req.params.email, function (existsError, userExists) {
        if (existsError) {
            respondWithServerError(res);
            next();
        }
        else if (userExists) {
            res.json(409, { type: 'EmailExists', message: 'Specified e-mail address is already registered.' });
            next();
        } else {
            UserAccount.create(req.params.email, req.params.password, function (createError) {
                if (createError) {
                    respondWithServerError(res);
                } else {
                    res.send(201);
                }
                next();
            });
        }
    });
}

function respondByCreatingContact(req, res, next) {
    "use strict"; 
    Contact.create(req.params.firstName, req.params.lastName, req.params.phone, function (error) {
        if (error) {
            respondWithServerError(res);
        } else {
            res.send(201);
        }
        next();
    });
}

var parseBodyAndRespondByUploadingPhoto = restify.bodyParser({
    multipartHandler: function (part) {
        part.on('data', function (data) {
            var fs = require('fs');
            fs.writeFile('./out.png', data);
        });
    }
});

function respondByUploadingPhotoxxx(req, res, next) {
    "use strict";
    var blobSvc = azure.createBlobService();
    blobSvc.createContainerIfNotExists('photoscontainer', function (containerError, containerCreated, containerResponse) {
        if (!containerError) {
            blobSvc.createBlockBlobFromStream('photoscontainer', 'contact-' + req.params.contactId, req, function (blobError, etag, blobResponse) {
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
        var decodedEmail = AuthToken.decode(token);
        
        if (!decodedEmail) {
            done(null, false, { message: 'Invalid token.' });
            return;
        }
        
        UserAccount.exists(decodedEmail, function (error, result) {
            if (result) {
                done(null, decodedEmail);
            } else {
                done(null, false, { message: 'Invalid email' });
            }
        });
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
