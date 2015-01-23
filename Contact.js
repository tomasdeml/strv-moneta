var firebase = require('firebase');
var validator = require('validator');

module.exports.create = function (firstName, lastName, phone, callback) {
    "use strict";
    var rootRef = new firebase(process.env.FIREBASE_CONTACTS_URL);
    var contactsRef = rootRef.child('contacts');
    var contact = {
        firstName: validator.escape(firstName),
        lastName: validator.escape(lastName),
        phone: validator.escape(phone)
    };

    contactsRef.push(contact, callback);
};