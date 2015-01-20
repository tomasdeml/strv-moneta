var assert = require('should');
var restify = require('restify');

describe('API', function () {
    var client = null;
    
    beforeEach(function () {
        client = restify.createJsonClient({
            url: 'http://localhost:8080',
            version: '*'
        });
    });

    describe('/access_token operation', function() {
        var accessTokenUri = '/access_token';

        describe('when passed invalid credentials', function() {
            var invalidCredentials = { email: 'invalid@example.org', password: 'fail' };

            it('should return HTTP 401 error', function(done) {
                client.post(accessTokenUri, invalidCredentials, function(err, req, res, obj) {
                    res.statusCode.should.equal(401);
                    /*console.log('%d -> %j', res.statusCode, res.headers);
                console.log('%j', obj);*/
                    done();
                });
            });
            it('should return JSON with expected *type* property', function(done) {
                client.post(accessTokenUri, invalidCredentials, function(err, req, res, obj) {
                    obj.should.have.property('type', 'InvalidEmailPassword');
                    done();
                });
            });
            it('should return JSON with expected *message* property', function(done) {
                client.post(accessTokenUri, invalidCredentials, function(err, req, res, obj) {
                    obj.should.have.property('message', 'Specified e-mail / password combination is not valid.');
                    done();
                });
            });
        });

        describe('for valid credentials', function() {
            var validCredentials = { email: 'valid@example.org', password: 'pass' };

            it('should return HTTP 200 OK', function(done) {
                client.post(accessTokenUri, validCredentials, function(err, req, res, obj) {
                    res.statusCode.should.equal(200);
                    done();
                });
            });
            it('should return JSON with *access_token* property', function(done) {
                client.post(accessTokenUri, validCredentials, function(err, req, res, obj) {
                    obj.should.have.property('access_token');
                    done();
                });
            });
        });
    });
});
