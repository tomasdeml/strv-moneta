var assert = require('should');
var restify = require('restify');

describe('API', function () {
    var protocol = 'http';
    var host = 'localhost';
    var port = 8080;
    
    var client = restify.createJsonClient({
        url: protocol + '://' + host + ':' + port,
        version: '*',
        headers: { 'Authorization': 'Bearer root' }
    });
    
    describe('/accounts operation', function () {
        var accountsOperationUri = '/accounts';
        
        describe('when passed fresh credentials', function () {
            var freshAccount = { email: (Math.random() + '@example.org'), password: 'pass' };
            
            it('should return HTTP 201 Created', function (done) {
                client.post(accountsOperationUri, freshAccount, function (err, req, res, obj) {
                    res.statusCode.should.equal(201);
                    done();
                });
            });
        });
        
        describe('when passed existing credentials', function () {
            var existingAccount = { email: 'existing@example.org', password: 'pass' };
            
            it('should return HTTP 409 Conflict', function (done) {
                client.post(accountsOperationUri, existingAccount, function (err, req, res, obj) {
                    res.statusCode.should.equal(409);
                    done();
                });
            });
        });
    });
    
    describe('/access_token operation', function () {
        var accessTokenOperationUri = '/access_token';
        
        describe('when passed invalid credentials', function () {
            var invalidCredentials = { email: 'invalid@example.org', password: 'fail' };
            
            it('should return HTTP 401 Unauthorized', function (done) {
                client.post(accessTokenOperationUri, invalidCredentials, function (err, req, res, obj) {
                    res.statusCode.should.equal(401);
                    /*console.log('%d -> %j', res.statusCode, res.headers);
                console.log('%j', obj);*/
                    done();
                });
            });
            it('should return JSON with expected *type* property', function (done) {
                client.post(accessTokenOperationUri, invalidCredentials, function (err, req, res, obj) {
                    obj.should.have.property('type', 'InvalidEmailPassword');
                    done();
                });
            });
            it('should return JSON with expected *message* property', function (done) {
                client.post(accessTokenOperationUri, invalidCredentials, function (err, req, res, obj) {
                    obj.should.have.property('message', 'Specified e-mail / password combination is not valid.');
                    done();
                });
            });
        });
        
        describe('when passed valid credentials', function () {
            var validCredentials = { email: 'valid@example.org', password: 'pass' };
            
            it('should return HTTP 200 OK', function (done) {
                client.post(accessTokenOperationUri, validCredentials, function (err, req, res, obj) {
                    res.statusCode.should.equal(200);
                    done();
                });
            });
            it('should return JSON with *access_token* property', function (done) {
                client.post(accessTokenOperationUri, validCredentials, function (err, req, res, obj) {
                    obj.should.have.property('access_token');
                    done();
                });
            });
        });
    });
    
    describe('/contacts operation', function () {
        var contactsOperationUri = '/contacts';
        
        describe('when passed a contact', function () {
            var contact = { firstName: 'John', lastName: 'Doe', phone: '555-123-456' };
            
            it('should return HTTP 201 Created', function (done) {
                client.post(contactsOperationUri, contact, function (err, req, res, obj) {
                    res.statusCode.should.equal(201);
                    done();
                });
            });
            
            it('should return a key for the created contact', function (done) {
                client.post(contactsOperationUri, contact, function (err, req, res, obj) {
                    obj.should.have.property('key');
                    done();
                });
            });
        });
    });
    
    describe('/photos operation', function () {
        var photosOperationUri = '/photos?contactId=';
        
        describe('when posted a photo data blob', function () {
            it('should return HTTP 201 Created', function (done) {
                var options = {
                    host: host,
                    port: port,
                    path: photosOperationUri + Math.random(),
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data; boundary=XXX',
                        'Authorization': 'Bearer root'
                    }
                };
                
                var http = require('http');
                var postReq = http.request(options, function (res) {
                    res.statusCode.should.equal(201);
                    res.on('data', function (chunk) {
                        console.log('Response: ' + chunk);
                    });
                    res.on('end', function () {
                        done();
                    });
                });
                
                postReq.write('--XXX--\r\n');
                postReq.write('Content-Disposition: form-data; name="name"\r\n');
                postReq.write('\r\n');
                
                var fs = require('fs');
                var stream = fs.createReadStream('./test/TestFile.jpg');
                
                stream.on('data', function (data) {
                    postReq.write(data);
                });
                
                stream.on('end', function () {
                    postReq.write('\r\n--XXX--');
                    postReq.end();
                });
            });
        });
    });
});
