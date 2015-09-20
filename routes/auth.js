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

    console.log(req.body)

    User.findOne({uberId: req.body.uberId}, function (err, user){
        if (user == null){
            var userToCreate = {
                accessToken: req.body.accessToken,
                uberId: req.body.uberId,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                picture: req.body.picture
            };

            Invite.findOne({inviteeEmail: req.body.email}, function(err, invite){

                console.log(invite)

                if (invite != null){
                    userToCreate.listOfPlaces = invite.listOfPlaces.map(function(place){
                        place.friendFullName = invite.fullName;
                        return place
                    });
                }
                console.log('Creating User');
                User.create(userToCreate, function(err, user){
                   res.json(user)
                })
            })
        } else {
            User.update({uberId: req.body.uberId}, {
                accessToken: req.body.accessToken,
                uberId: req.body.uberId,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                picture: req.body.picture
            }, function(err, user){
                res.json(user);
            })
        }
    });
});

module.exports = router;