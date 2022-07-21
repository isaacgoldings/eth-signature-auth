const express = require('express')
const app = express()
const session = require('express-session');
const bodyParser = require('body-parser')
var fs = require('fs');
var path = require('path');

//s3 stuff

const util = require('util')
const unlinkFile = util.promisify(fs.unlink)

const multer = require('multer')
const upload_s3 = multer({ dest: 'uploads/' })

const { uploadFile, getFileStream } = require('./public/s3')
//import s3 from ('./src/s3')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

let isLoggedIn = false;

app.use(express.static('public'));
app.use(express.static('build'));

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET' 
  }));
  
app.get('/', (req, res) => {
    res.render('login')
})

//s3 test route
app.post('/images', upload_s3.single('image'), async (req, res) => {
  const file = req.file
  console.log("FILE:");
  console.log(file)

  // apply filter
  // resize 

  const result = await uploadFile(file)
  await unlinkFile(file.path)
  console.log("S3 Info");
  console.log(result)
  const description = req.body.description
  res.send({imagePath: `/images/${result.Key}`})
})

app.get('/images/:key', (req, res) => {
  console.log(req.params)
  const key = req.params.key
  const readStream = getFileStream(key)

  readStream.pipe(res)
})

/**
 * Beginning of Schema Definition
 */
const User = require('./models/User');
const Document = require('./models/Document');

//Routes
const userRoute = require('./routes/users');
const documentRoute = require('./routes/documents');

app.use('/users', userRoute);
app.use('/documents', documentRoute);

// multer is for file uploads
//const multer = require("multer")

// send uploads to ./uploads
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, './uploads');
      cb(null, './uploads/previews');
      cb(null, './uploads/thumbs');
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + "--" + file.originalname);
  },
});

const upload = multer({storage: fileStorageEngine});

const port = process.env.PORT || 3009
app.listen(port , () => console.log('App listening on port ' + port));

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
  console.log(userProfile);
   app.locals.displayName = userProfile.displayName;
   app.locals.email = userProfile._json.email;
   app.locals.name = userProfile._json.name;
   app.locals.picture = userProfile._json.picture;

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

// File schema for DB
var uploadedFile = new Schema({
  fieldname: String,
  originalname: String,
  encoding: String,
  mimetype: String,
  destination: String,
  filename: String,
  path: String,
  size: Number,
  isMultiUpload: Boolean,
  hasBeenSigned: Boolean,
  recipient: String,
  sender: String,
  hashCode: String,
  date: Number,
  // email: String,
  // name: String,
});



// Initialize userModel for DB
var singleUploadedFile = mongoose.model('singleUploadedFile', uploadedFile);

app.post('/documentUpload', upload_s3.single('image'), async (req,res)=>{

  console.log(req.body);
  console.log("Logging");
  console.log(req.body.log);
    const file = req.file

    let signed = req.body.signcheck=='on' ? true : false;
    let recipientIs = req.body.recipient;
    const fileToUpload = new singleUploadedFile({
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      destination: req.file.destination,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      isMultiUpload: false,
      hasBeenSigned: signed,
      recipient: recipientIs,
      sender: app.locals.email,
      hashCode: req.body.hashc0d3,
      date: Date.now(),
      // email: req.body.name,
      // name: req.body.name,
    });
    fileToUpload.save()

    const documentSingle = new Document({
      user_name: userProfile.displayName, 
      email: userProfile._json.email,
      hasBeenSigned: signed,
      isMultiUpload: false,
      size: req.file.size,
      filename: req.file.filename,
      date: Date.now(),
      recipient: recipientIs,
      sender: app.locals.email,
      hashCode: req.body.hashc0d3,
    });
    documentSingle.save()

    console.log("file here")
    console.log(file)
  
    // apply filter
    // resize 
  
    const result = await uploadFile(file)
    await unlinkFile(file.path)
    console.log(result)
    const description = req.body.description
    //res.send({imagePath: `/images/${result.Key}`})

    res.redirect("/index")
    
});

app.get('/imageTesting', (req, res) => {
  res.render('imagetesting');
})

//s3 post route
app.post('/images', upload.single('image'), async (req, res) => {
  console.log("file here")
  const file = req.file
  console.log(file)

  // apply filter
  // resize 

  const result = await uploadFile(file)
  await unlinkFile(file.path)
  console.log(result)
  const description = req.body.description
  res.send({imagePath: `/images/${result.Key}`})
})

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



app.post('/details', (req, res)=>{
  
  app.locals.jacob = req.body.jacob;
  const test = req.body.jacob;
  console.log(req.body);
  const myObj = JSON.stringify(req.body);  
  const num = myObj;
  console.log(myObj);
  console.log(req.params);
  res.render('details',{name:"THIS IS THE NAME", test:test, num:num});


})

app.get('/settings', (req,res)=> {
  res.render('settings');
})

app.get('/uploads', (req, res)=> {

  const db = client.db("signatureauth");
  const collection = db.collection('singleuploadedfiles');

  collection.find({sender:"jschireson@gmail.com"}).toArray(function(err, device_list){
    res.render('uploads', {'uploads': device_list})
  });

})

app.post('/details2', (req, res) => {
  console.log(req.body);
  console.log("^BODY^");
  res.render('details2', {'body':req.body})
})

 
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