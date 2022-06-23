const express = require('express')
const app = express()
// const session = require('express-session');

app.use(express.static('public'));

const path = require('path');
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// app.use(session({
//     resave: false,
//     saveUninitialized: true,
//     secret: 'SECRET' 
//   }));
  

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
    // res.render('login')
    res.render('index')
})

console.log("Starting up at localhost:3000");
app.listen(3000);

// function print(){
//     console.log("hello")

// }

// print();