// Requiring credentials:
const express = require('express');
const app = express();
const mongoose = require('mongoose');
// const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
// const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
// const {listingSchema, reviewSchema} = require('./schema.js');
// const Review = require('./models/review.js');

// Requiring routs:
const listings = require('./routes/listings.js');
const reviews = require('./routes/review.js');

// Mondo db url:
const uri = 'mongodb+srv://Pranjal:Pranjal9826@cluster0.i8xujwe.mongodb.net/wanderlust?retryWrites=true&w=majority&appName=Cluster0';

// Setup:
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

// Connecting database:
async function main() {
    await mongoose.connect(uri)
}

main()
.then(() => {
    console.log("Connected of DB");
})
.catch((err) => {
    console.log(err);
});

// Start server:
app.listen(3000, () => {
    console.log("Server is runnting successfully...");
});

// Home rout:
app.get('/', (req, res) => {
    res.send("Working...");
});

// Listings rout:
app.use('/listings', listings);

// Review rout:
app.use('/listings/:id/reviews', reviews)

// Error handeling middleware:
app.all('/{*all}', (req, res, next) => {
    next(new ExpressError(404, 'Page not found!'));
});

app.use((err, req, res, next) => {
    let {status = 500, message = 'Somethig went wrong!'} = err;
    res.render('error.ejs', {message});
    // res.status(status).send(message);
});