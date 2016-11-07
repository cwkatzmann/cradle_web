const randomPositiveMatch = true;
const saveScannedImages = true;

const express = require('express');
const request = require('request');
const knex = require('./knex');
const bodyParser = require('body-parser');
const port = process.env.PORT ||  3000;
var urlencode = require('urlencode');
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
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
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



//Randomize Positive Lueko Matches (until API is fully working)

var randomCount = 0;
var maxMatches = 5;
var outOfTen = 5;

var randomizePositive = function(el){
  el.body.faces[0].left_eye.leuko_prob = Math.round((Math.random() * 100)) / 100;
  el.body.faces[0].right_eye.leuko_prob = Math.round((Math.random() * 100)) / 100;
  if (Math.random() < (10 / outOfTen) && randomCount < maxMatches){
    randomCount++;
  }
}


// Define routes.
app.get('/',
//render the index page;
  function(req, res) {
    if(req.user){
      res.render('index');
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

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth/facebook' }), (req, res) => {
    //store user ID and Name and profile pic in DB if ID not exists(for later use in checking for more photos, not necessarily for login purpose becasue Passport can handle that).
    knex('users').insert({facebook_id: req.user.id, display_name: req.user.displayName, profile_pic: req.user.photos[0].value}).then( () => {
      res.redirect('/');
    }).catch( (err) => {
      res.redirect('/');
    });
  });

app.get('/profile/:fetchType',
  // require('connect-ensure-login').ensureLoggedIn(),
  //^what does this do if not logged in?
  function(req, res){

    var fetchType = req.params.fetchType;
    console.log("fetchType=-=-=-=-=-=-=-=-=", fetchType);

    request('https://graph.facebook.com/v2.8/' + req.user.id + '/photos?type=uploaded&limit=999&access_token=' + req.user.token, (err, response, body) => {
      //handles invalid token
      if(response.statusCode !== 200){
        res.json({ redirect: true });
      } else {
        var promises = [];
        JSON.parse(body).data.forEach((el) => {
          promises.push(new Promise(
            function(resolve, reject){

              if (fetchType === "new"){
                knex('photos')
                .where('facebook_photo_id', el.id)
                .first()
                .then((photo) => {
                  if(!photo){
                    //send request for photo url to graph api here
                    request('https://graph.facebook.com/v2.8/' + el.id + '/picture?access_token=' + req.user.token, (err, response, body) => {
                      resolve({url:response.request.uri.href, id: el.id});
                    });
                  } else {
                    resolve(false);
                  }
                });
              } else if (fetchType === "all"){
                request('https://graph.facebook.com/v2.8/' + el.id + '/picture?access_token=' + req.user.token, (err, response, body) => {
                  resolve({url:response.request.uri.href, id: el.id});
                });
              }
            }
          ));
        });
        //construct json to render angular with;
        // console.log("promises array:", promises);
        Promise.all(promises).then(function(els){
          //make object to send as jon here
          var data = {};
          data.images = [];
          els.forEach((el) => {
            if (el){
              var image = {};
              image.url = el.url;
              image.photo_id = el.id;
              data.images.push(image);
            }
          })
          data.username = req.user.displayName;
          res.json(data);
        })
      }
    });




    //query DB for user Name and Prfofile pic by FB_id(req.user.id);
    //query for all photos that have been analyzed in DB;
    //query Facebook for user photos
    //compare above two
    //display conclusion of above to user w/option to scan new photos if they exist
    //render angular page
      //on page:link to a route to scan photos
});

app.post('/scan/:fetchType',
  (req, res) => {

    var fetchType = req.params.fetchType;

    var images = req.body;
    var promises = [];
    var results = [];
    console.log("scan route is receiving these images", images);

    //save scanned images to DB
    if (fetchType === "new"){
      if (saveScannedImages){
        images.forEach((image) => {
          knex('photos').insert({users_facebook_id: req.user.id, facebook_photo_id: image.photo_id, public_facebook_url: image.url}).then( () => {
            console.log("saved a scanned image");
          })
        })
      }
    }


    images.forEach((image) => {
      var preppedUrl = image.url.replace('https', 'http');
      promises.push(new Promise(
        function(resolve, reject){
            request.post('https://leuko-api.rhobota.com/v1.0.0/process_photo?image_url=' + urlencode(preppedUrl) + '&annotate_image=true', function(err, response, body){
              // console.log(JSON.parse(body));
              let objBody = JSON.parse(body);
              resolve({body:objBody, url:image.url, id:image.photo_id});
          });
        }
      ));
    });

    Promise.all(promises).then(function(data){
      var count = 0;
      data.forEach((el)=>{
        console.log("received result from CRADLE API-=-=-=-=");
        if(el.body.faces && el.body.faces.length > 0 ){
          //insert random positive lueko matches
          if (randomPositiveMatch){
            randomizePositive(el);
          }
          // only render results if the Cradle API managed to identify an eye (it sometimes returns empty face)
          if (el.body.faces[0].left_eye.leuko_prob !== 0 || el.body.faces[0].right_eye.leuko_prob !== 0){
            results.push(el);
          }
        }
      });
      res.json(results);
    });

    //get photo ids of photos to be evaluated by cradle API from req.body.
    //do a request to FB Graph API for the actual photos at those ID's ({photo_id}/picture/{accestoken stuff})
      //store id's of scanned photos in the DB
      //upload any positive matches to an S3 bucket and store bucket URLs in DB table for positive results
      //use cradle's JSON response and the S3 bucket address to populate a new JSON object which angular will use to render the results.
  });

app.listen(port, function() {
  console.log('server listening on port ' + port);
});

module.exports = app;
