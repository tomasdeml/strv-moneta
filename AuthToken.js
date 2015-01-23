var jwt = require('jwt-simple');
var tokenSecret = '6i2e{XM(KI?g3I0)jP# (^>8(1o0OY';

 module.exports.generate = function (email) {
    "use strict";
    var payload = { email: email };
    var token = jwt.encode(payload, tokenSecret);

    return token;
};

module.exports.decode = function (token) {
    "use strict";
    try {
        return jwt.decode(token, tokenSecret).email;
    } catch (err) {
        return null;
    }
};