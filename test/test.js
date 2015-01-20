var assert = require('should');
var restify = require('restify');

describe('API', function () {
    var client = restify.createJsonClient({
        url: 'http://localhost:8080',
        version: '*'
    });
    
    describe('/access_token', function () {
        it('should return HTTP 401 error when passed credentials are invalid', function(done) {
            client.post('/access_token', { email: 'invalid@example.org', password: 'fail' }, function(err, req, res, obj) {
                res.statusCode.should.equal(401);
                console.log('%d -> %j', res.statusCode, res.headers);
                console.log('%j', obj);

                done();
            });
        });
        it('should return JSON with expected *type* property when passed credentials are invalid', function (done) {
            client.post('/access_token', { email: 'invalid@example.org', password: 'fail' }, function (err, req, res, obj) {
                obj.should.have.property('type', 'InvalidEmailPassword');
                done();
            });
        });
        it('should return JSON with expected *message* property when passed credentials are invalid', function (done) {
            client.post('/access_token', { email: 'invalid@example.org', password: 'fail' }, function (err, req, res, obj) {
                obj.should.have.property('message', 'Specified e-mail / password combination is not valid.');
                done();
            });
        });
    });
});
