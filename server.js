var express = require('express');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var request = require('request');

var token;

// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
    clientID: '594750964068000',
    clientSecret: 'd1200f6cb55836e222c751ab3317441f',
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos'],
  },
  function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    console.log("accesstoken", accessToken);
    token = accessToken;
    return cb(null, profile);
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/auth/facebook',
  passport.authenticate('facebook', {scope: "user_photos"}));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth/facebook' }),
  function(req, res) {
    // console.log('success!');
    // console.log(req.user);

    // request('http://graph.facebook.com/v2.8/132977830508706/photos&access_token=EAAIc7DZCxbqABACOZA4bmukFZC0bFOlLmCwAe3TYOCFul8xZC9QqXv7gsCayOTzUZBzvRS5VuZCZAF3JFXsfS42yzMUjGZBATrUctIX9di7dxxnCqFiLCxfOY4ZAlKn2BpeZCTbnvAjMcplQBLP5c7AdIkHIkd42ZAo8mIZD', function(err, response, body){
    //   console.log("body", body);
    //   res.send(body);
    // })
    request('https://graph.facebook.com/v2.8/me/photos?type=uploaded&access_token=' + token, function(err, response, body){
      var photoID = JSON.parse(body).data[0].id;
      console.log('photoID', photoID);
      request("https://graph.facebook.com/v2.8/?id=" + photoID + "&access_token=" + token, function(err, response, body2){
          console.log("photo body", body2);
          res.send(body2);
      })
    })

  });

app.get('/profile',
  // require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    // console.log(req.user);
    // res.render('profile', { user: req.user });
    res.send(req.user);
  });

app.listen(3000);
