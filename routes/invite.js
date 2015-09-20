var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Invite = require('../models/invite.js');

var sendgrid  = require('sendgrid')(process.env.SENDGRID_KEY);

/* Post invite in the db listing. */
router.post('/', function(req, res, next) {

  console.log(req.body);

  Invite.create(req.body, function (err, invite) {
    if (err) {
      return next(err);
    }

    var email     = new sendgrid.Email({
      to:       invite.inviteeEmail,
      from:     'noreply@uberroulette.com',
      subject:  'You have been invited to Uberroulette !',
      text:     'Hello world',
      html:     '<h1> Welcome to UberRoulette ! </h1>' +
          '<p> Your friend ' +  invite.fullName + ' invited you to UberRoulette ! He has prepared for you a list of places' +
      'you should definitely check out ! </p>' +
          '<p>Go on <a href="http://appurl.com"> the app store </a> and download the app</p>'+
          '<p> Don\'t forget, you will need a Uber account to login </p>'+
          '<p> <b>The UberRoulette Team </b> </p>'
    });

    sendgrid.send(email, function(err, json) {
      if (err) {
        return console.error(err);
      }
      console.log(json);
      res.json(invite);
    });
  });
});

module.exports = router;
