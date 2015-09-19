/**
 * Created by nicolas on 9/19/15.
 */
var express = require('express');
var request = require('request-promise');

var mongoose = require('mongoose');
var Invite = require('../models/invite.js');
var User = require('../models/user.js');

var router = express.Router();

router.post('/uber', function(req, res){
    User.findOne({uberId: req.json.uber_id}, function (err, user){
        if (user == null){
            var userToCreate = {
                accessToken: req.json.access_token,
                uberId: req.json.uber_id,
                firstName: req.json.first_name,
                lastName: req.json.last_name,
                email: req.json.email,
                picture: req.json.picture
            };

            Invite.findOne({inviteeEmail: profile.email}, function(err, invite){

                if (invite != null){
                    userToCreate.listOfPlaces = invite.listOfPlaces.map(function(place){
                        place.friendFullName = invite.fullName;
                        return place
                    });
                }

                User.create(userToCreate, function(err, user){
                   res.json(user)
                })
            })
        } else {
            res.json(user)
        }
    });
});

module.exports = router;