// Requiring credentials:
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');

// Mondo db url:
const uri = 'mongodb+srv://Pranjal:Pranjal9826@cluster0.i8xujwe.mongodb.net/wanderlust?retryWrites=true&w=majority&appName=Cluster0';

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

// Listing rout (testing):
app.get('/listing', async (req, res) => {
    let sampleListing = new Listing({
        title: "My new vila",
        description: "By the beach",
        price: 1200,
        location: "Calangute, Goa",
        country: "India"
    });

    await sampleListing.save();
    console.log("Sample was saved successfully...");
    res.send("Sample was saved successfully...");
});