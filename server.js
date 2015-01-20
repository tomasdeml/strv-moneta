var restify = require('restify');
var firebase = require("firebase");
var jwt = require('jwt-simple');

var accessTokenSecret = '6i2e{XM(KI?g3I0)jP# (^>8(1o0OY';

function respondWithAccessToken(req, res, next) {
    if (req.params.email !== 'valid@example.org' || req.params.password !== 'pass') {
        res.json(401, { type: 'InvalidEmailPassword', message: 'Specified e-mail / password combination is not valid.' });
    } else {
        var payload = { userId: 'bar' };
        var token = jwt.encode(payload, accessTokenSecret);

        res.json(200, { access_token: token });
    }
    next();
}

function respond(req, res, next) {
    res.send('hello ' + req.params.name);
    next();
}

var server = restify.createServer();
server.use(restify.bodyParser());
server.post('/access_token', respondWithAccessToken);

server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});
