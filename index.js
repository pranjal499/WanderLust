// Requiring credentials:
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

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

// Listing rout:
app.get('/listings', async (req, res) => {
    const allListing = await Listing.find();
    res.render('listings/index.ejs', {allListing});
});

// Create rout:
app.get('/listings/new', (req, res) => {
    res.render('listings/new.ejs');
});

app.post('/listings', async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/listings');
});

// Show rout:
app.get('/listings/:id', async (req, res) => {
    let {id} = req.params;
    const item = await Listing.findById(id);
    res.render('listings/show.ejs', {item});
});

// Update rout:
app.get('/listings/:id/edit', async (req, res) => {
    let {id} = req.params
    const item = await Listing.findById(id);
    res.render('listings/edit.ejs', {item});
});

app.put('/listings/:id', async(req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing})
    res.redirect(`/listings/${id}`);
});

// Delete rout:
app.delete('/listings/:id', async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
});