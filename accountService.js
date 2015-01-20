var bcrypt = require('bcrypt-nodejs');
var accessTokenSecret = '6i2e{XM(KI?g3I0)jP# (^>8(1o0OY';
var jwt = require('jwt-simple');

module.exports.exists = function exists(email) {
    return 'existing@example.org' === email;
};

function hashPassword(password) {
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}

module.exports.create = function(email, password) {
    var passwordHash = hashPassword(password);
};

module.exports.generateToken = function(userId) {
    var payload = { userId: userId };
    var token = jwt.encode(payload, accessTokenSecret);
    return token;
};

