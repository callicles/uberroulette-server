/**
 * Created by nicolas on 9/19/15.
 */

var mongoose = require('mongoose');

var InviteSchema = new mongoose.Schema({
    userEmail: String,
    fullName: String,
    inviteeEmail: String,
    listOfPlaces: [{
        name: String,
        latitude: Number,
        longitude: Number,
        message: String
    }],
    sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invite', InviteSchema);