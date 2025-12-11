// Requiring credentials:
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const {attachAuthState} = require('./utils/auth.js');
if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}


// Requiring routs:
const listingsRout = require('./routes/listings.js');
const reviewsRout = require('./routes/review.js');
const userRout = require('./routes/user.js');

// Mondo db url:
const uri = process.env.ATLASDB_URL;

// // Setup:
// app.use(express.urlencoded({extended: true}));
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// app.use(methodOverride('_method'));
// app.engine('ejs', ejsMate);
// app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true})); // body-parser is here
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

// Connecting database:
async function main() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to DB");
    } catch (err) {
        console.log("DB connection error:", err);
    }
}

main();

// Mongo session options:
const store = MongoStore.create({
    mongoUrl: uri, 
    crypto: {
        secret: process.env.SECRET
    }, 
    touchAfter: 24 * 3600
});

store.on('error', () => {
    console.log('ERROR IN MONGO SESSION STORE', err);
});

// session options:
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};


// middlewares:
app.use(session(sessionOptions)); 
app.use(flash());

// Configuring Stragety (Passport):
app.use(passport.initialize());
app.use(passport.session());

// Configure LocalStrategy - User.authenticate() from passport-local-mongoose
// works as a verify function for LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    next();
});
app.use(attachAuthState);

// Demo user:
// app.get('/demouser', async(req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });

//     let registeredUser = await User.register(fakeUser, "hello");
//     res.send(registeredUser);
// });  

// Reviews rout (must be registered before listings to avoid route conflicts):
app.use('/listings/:id/reviews', reviewsRout);

// Listings rout:
app.use('/listings', listingsRout);

// User rout:
app.use('/', userRout);

// Error handeling middleware:
app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'Page not found!'));
});

app.use((err, req, res, next) => {
    let {status = 500, message = 'Somethig went wrong!'} = err;
    res.render('error.ejs', {message});
    // res.status(status).send(message);
});

// Start server (after all middleware and routes are configured):
app.listen(3000, () => {
    console.log("Server is runnting successfully...");
});