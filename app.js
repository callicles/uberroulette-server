var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Routes
var routes = require('./routes/index');
var invite = require('./routes/invite');

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/uberRoulette', function(err) {
  if(err) {
    console.log('connection error', err);
  } else {
    console.log('connection to Mongo successful');
  }
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/invite', invite);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// Authentication with uber
var passport = require('passport'),
    uberStrategy = require('passport-uber').Strategy,
    User = require('./models/user.js'),
    Invite = require('./models/invite.js'),
    auth = require('./routes/auth');

app.use('/auth', auth);
app.use(passport.initialize());
app.use(passport.session());

passport.use(new uberStrategy({
      clientID: process.env.UBER_ID,
      clientSecret: process.env.UBER_SECRET,
      callbackURL: "http://localhost:3000/auth/uber/callback"
    },
    function(accessToken, refreshToken, profile, done) {

      User.findOne({uberId: profile.id}, function (err, user){
        if (user == null){
          var userToCreate = {
            uberId: profile.id,
            firstName: profile.first_name,
            lastName: profile.last_name,
            email: profile.email,
            picture: profile.picture
          };

          Invite.findOne({inviteeEmail: profile.email}, function(err, invite){

            if (invite != null){
              userToCreate.listOfPlaces = invite.listOfPlaces.map(function(place){
                place.friendFullName = invite.fullName;
                return place
              });
            }

            User.create(userToCreate, function(err, user){
              return done(err, user)
            })
          })
        } else {
          return done(err, user);
        }
      });
    }
));


module.exports = app;
