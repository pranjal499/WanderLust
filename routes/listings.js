// Requiring credentials:
const express = require('express');
const router = express.Router({mergeParams: true});
const Listing = require('../models/listing.js');
const wrapAsync = require('../utils/wrapAsync.js');
const Review = require('../models/review.js');


// Validate listing function:
const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    }
};

// Listing rout:
router.get('/', wrapAsync(async (req, res) => {
    const allListing = await Listing.find();
    res.render('listings/index.ejs', {allListing});
}));

// Create rout:
router.get('/new', (req, res) => {
    res.render('listings/new.ejs');
});

router.post('/',validateListing, wrapAsync(async (req, res) => {
    let result = listingSchema.validate(req.body.listing);
    if (result.error) {
        throw new ExpressError(400, result.error);
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/listings');
}));

// Show rout:
router.get('/:id', wrapAsync(async (req, res) => {
    let {id} = req.params;
    const item = await Listing.findById(id).populate('reviews');
    res.render('listings/show.ejs', {item});
}));

// Update rout:
router.get('/:id/edit', wrapAsync(async (req, res) => {
    let {id} = req.params
    const item = await Listing.findById(id);
    res.render('listings/edit.ejs', {item});
}));

router.put('/:id', validateListing, wrapAsync(async(req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing...")
    }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing})
    res.redirect(`/listings/${id}`);
}));

// Delete rout:
router.delete('/:id', wrapAsync(async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));

module.exports = router;