const express = require('express')
const app = express()
const session = require('express-session');

app.use(express.static('public'));
app.use(express.static('build'));

const path = require('path');
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET' 
  }));
  

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
    res.render('login')
    //res.render('index')
})

const port = process.env.PORT || 3009
app.listen(port , () => console.log('App listening on port ' + port));

// function print(){
//     console.log("hello")

// }

// print();


/*  PASSPORT SETUP  */

const passport = require('passport');
var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.get('/success', (req, res) => res.send(userProfile));
app.get('/error', (req, res) => res.send("error logging in"));

app.get('/index', (req, res) => {
    res.send(userProfile)
    res.render('index')

});

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

/*  Google AUTH  */
 
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = '329689533075-ilrldobfq5il9frnvlh0v4ho54d42hke.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3009/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));
 
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/index');
  });