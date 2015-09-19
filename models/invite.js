/**
 * Created by nicolas on 9/19/15.
 */

var mongoose = require('mongoose');

var InviteSchema = new mongoose.Schema({
    userEmail: String,
    username: String,
    inviteeEmail: String,
    note: String,
    listOfPlaces: [{
        name: String,
        latitude: Number,
        longitude: Number,
        message: String,
        category: String
    }],
    sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invite', InviteSchema);