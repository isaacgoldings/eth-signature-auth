const express = require('express')
const app = express()
const session = require('express-session');
const bodyParser = require('body-parser')

app.use(bodyParser.json())

app.use(express.json());

let isLoggedIn = false;


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

const User = require('./models/User');


//Routes
const userRoute = require('./routes/users');

app.use('/users', userRoute);



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

//homePage
app.get('/index', (req, res) => {
   // res.send(userProfile)

   app.locals.displayName = userProfile.displayName;
   app.locals.email = userProfile._json.email;
   app.locals.name = userProfile._json.name;
    // Creating new user on log in
  const newUser = new User({
    user_name: userProfile.displayName,
    email: userProfile._json.email
  });

  newUser.save()
 //double check 'index' file path
  isLoggedIn ? res.render('index', {userProfile}) : res.send('you need to sign in to access this');
  
  //res.render('index')

});


//******database stuff
const mongoClient  = require("mongodb");


const uri = "mongodb+srv://jschireson:A23hkL7cvc98!!@cluster0.gd3ly.mongodb.net/signatureauth?retryWrites=true&w=majority";

const client = new mongoClient.MongoClient(uri);



passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


//Database

//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = "mongodb+srv://jschireson:A23hkL7cvc98!!@cluster0.gd3ly.mongodb.net/signatureauth?retryWrites=true&w=majority";
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define schema
var Schema = mongoose.Schema;



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
    isLoggedIn = true;
    res.redirect('/index');
  });

  app.post('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

  app.get('/error', (req, res) => res.send("error logging in"));