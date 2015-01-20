var bcrypt = require('bcrypt-nodejs');
var accessTokenSecret = '6i2e{XM(KI?g3I0)jP# (^>8(1o0OY';
var jwt = require('jwt-simple');

// TODO Callback
module.exports.exists = function exists(email) {
    return 'existing@example.org' === email;
};

// TODO Callback
module.exports.validateCredentials = function(email, password) {
    return email === 'valid@example.org' && password === 'pass';
};

// TODO Callback
function hashPassword(password) {
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}

// TODO Callback
module.exports.create = function(email, password) {
    var passwordHash = hashPassword(password);
    // TODO
};

module.exports.generateToken = function(userId) {
    var payload = { userId: userId };
    var token = jwt.encode(payload, accessTokenSecret);
    return token;
};

