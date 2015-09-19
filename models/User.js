/**
 * Created by nicolas on 9/19/15.
 */

var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    picture: String,
    accessToken: String,
    uberId: String,
    listOfPlaces: [{
        friendFullName: String,
        name: String,
        latitude: Number,
        longitude: Number,
        message: String,
        category: String
    }],
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);