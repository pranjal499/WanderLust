// Requiring credentials:
const Listing = require('../models/listing.js');
const ExpressError = require('../utils/ExpressError.js');

// index callback:
module.exports.index = async (req, res) => {
    const allListing = await Listing.find();
    res.render('listings/index.ejs', {allListing});
};

// Create rout callback:
module.exports.renderNewForm = (req, res) => {
    res.render('listings/new.ejs');
};

// Create rout post req. callback:
module.exports.postNewForm = async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing...");
    }

    const newListing = new Listing(req.body.listing);
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.owner = req.user._id;
        newListing.image = {url, filename};
    }
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash('success', 'New Listing created...');
    res.redirect('/listings');
};

// Show rout callback:
module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const item = await Listing.findById(id).populate({path: 'reviews', populate: {path: 'auther'}}).populate('owner');
    if (!item) {
        req.flash('error', 'Listing does not exist!');
        return res.redirect('/listings');
    }
    res.render('listings/show.ejs', {item});
};

// Update rout callback:
module.exports.renderUpdateListingForm = async (req, res) => {
    let {id} = req.params
    const item = await Listing.findById(id);
    if (!item) {
        req.flash('error', 'Listing does not exist!');
        return res.redirect('/listings');
    }
    req.flash('success', 'Updated successfully');
    res.render('listings/edit.ejs', {item});
};

// Update rout put request callback:
module.exports.updateListing = async(req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing...")
    }

    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing})
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
    }
    await listing.save();
    req.flash('success', 'Listing Updated!');
    res.redirect(`/listings/${id}`);
};

// Delete rout callback:
module.exports.deleteListing = async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Deleted successfully');
    res.redirect('/listings');
};