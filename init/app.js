// Requiring essentials:
const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');

// MongoDB server uri:
const uri = 'mongodb+srv://Pranjal:Pranjal9826@cluster0.i8xujwe.mongodb.net/wanderlust?retryWrites=true&w=majority&appName=Cluster0';

// Connecting to MongoDB:
async function main() {
    mongoose.connect(uri);
}

main()
.then(() => {
    console.log("Connection is successful...");
})
.catch((err) => {
    console.log(err);
});

// Inserting sample data:
const initDb = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: '6935b9b5378ddcb21e8d7375'}));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized...");
};
initDb();