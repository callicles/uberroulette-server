/**
 * Created by nicolas on 9/19/15.
 */
var express = require('express');
var passport = require('passport');

var mongoose = require('mongoose');
var User = require('../models/user.js');

var router = express.Router();

router.get('/uber', passport.authenticate('uber'));

router.get('/uber/callback', passport.authenticate('uber'),
    function(req, res) {
        res.json(req.user)
    });

module.exports = router;