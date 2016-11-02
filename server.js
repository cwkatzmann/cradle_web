const express = require('express');
const request = require('request');
const knex = require('./knex');
const bodyParser = require('body-parser');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;


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
    callbackURL: 'http://localhost:3000/home',
    profileFields: ['id', 'displayName', 'photos', 'email'],
  },
  function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    console.log("accesstoken", accessToken);
    profile.token = accessToken;
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
app.use('/static', express.static(__dirname + '/public'));

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
//render the index page;
  function(req, res) {
    if(req.user){
      res.redirect('/home');
    } else {
      res.redirect('/login');
    }
  });

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/auth/facebook',
  passport.authenticate('facebook', {scope : 'user_photos'})
);

app.get('/home',
  passport.authenticate('facebook', { failureRedirect: '/auth/facebook' }), (req, res) => {
    //store user ID and Name and profile pic in DB if ID not exists(for later use in checking for more photos, not necessarily for login purpose becasue Passport can handle that).
    knex('users').insert({facebook_id: req.user.id, display_name: req.user.displayName, profile_pic: req.user.photos[0].value}).then( () => {
      res.render('home');
    }).catch( (err) => {
      res.render('home');
    });
  });

app.get('/profile',
  // require('connect-ensure-login').ensureLoggedIn(),
  //^what does this do if not logged in?
  function(req, res){
    // console.log(req.user);
    // res.render('index');
    // var count = 0;

    request('https://graph.facebook.com/v2.8/' + req.user.id + '/photos?type=uploaded&limit=999&access_token=' + req.user.token, (err, response, body) => {
      //handles invalid token
      console.log('response:', response.statusCode);
      if(response.statusCode !== 200){
        res.json({ redirect: true });
      //query for public facebook photo urls
      } else {
        var promises = [];
        JSON.parse(body).data.forEach((el) => {
          promises.push(new Promise(
            function(resolve, reject){
              knex('photos')
              .where('facebook_photo_id', el.id)
              .first()
              .then((photo) => {
                if(!photo){
                  //send request for photo url to graph api here
                  request('https://graph.facebook.com/v2.8/' + el.id + '/picture?access_token=' + req.user.token, (err, response, body) => {
                    // console.log('count: ' + count++, response.request.uri.href);
                    resolve(response.request.uri.href);
                  });
                  // console.log('no photo');
                }
              });
            }
          ));
        });
        //construct json to render angular with;
        // console.log("promises array:", promises);
        Promise.all(promises).then(function(urls){
          res.json(urls);
        })
        // res.render('index')
        // res.json(body);
      }
    });




    //query DB for user Name and Prfofile pic by FB_id(req.user.id);
    //query for all photos that have been analyzed in DB;
    //query Facebook for user photos
    //compare above two
    //display conclusion of above to user w/option to scan new photos if they exist
    //render angular page
      //on page:link to a route to scan photos

  //     request('http://graph.facebook.com/' + '132991980507291' + '/picture?access_token=' + token, (err, response, body) => {
  //      if(err){
  //        console.log('error:', err);
  //      }
  //      if(response){
  //        console.log('response:', response);
  //      }
  //     //  if(body){
  //     //    console.log('body:', body);
  //     //  }
  //     //  res.send(body);
  //     res.send('booyah');
  // });
});

app.post('/scan',
  //^what does this do if not logged in?)
  (req, res) => {

    var images = req.body;
    console.log("body", req.body);
    console.log("data", req.data);
    var promises = [];


    res.send('we got the photos!!!')
    // console.log(images);

    // request.post({url:'https://leuko-api.rhobota.com/v1.0.0/process_photo', form: images, json: true}, (err, res, body) => {
    //   // console.log(err);
    //   console.log(body);
    //   console.log(res);
    //   res.status(200).send("booyah");
    // })


    //get photo ids of photos to be evaluated by cradle API from req.body.
    //do a request to FB Graph API for the actual photos at those ID's ({photo_id}/picture/{accestoken stuff})
      //store id's of scanned photos in the DB
      //upload any positive matches to an S3 bucket and store bucket URLs in DB table for positive results
      //use cradle's JSON response and the S3 bucket address to populate a new JSON object which angular will use to render the results.
  });

app.listen(3000);

module.exports = app;
