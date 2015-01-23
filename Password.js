var bcrypt = require('bcrypt-nodejs');

module.exports.hash = function(password, callback) {
    bcrypt.genSalt(10, function(_, salt) {
        bcrypt.hash(password, salt, null, callback);
    });
};

module.exports.compareWithHash = function(password, hash, callback) {
    bcrypt.compare(password, hash, callback);
};