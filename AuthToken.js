var jwt = require('jwt-simple');
var tokenSecret = '6i2e{XM(KI?g3I0)jP# (^>8(1o0OY';

 module.exports.generateToken = function (userId) {
    var payload = { userId: userId };
    var token = jwt.encode(payload, tokenSecret);

    return token;
};