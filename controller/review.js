// Requiring credentials:
const express = require('express');
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');


// Review creating rout callback:
module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.auther = req.user._id.toString();
    console.log(newReview);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash('success', 'Review created successfully!');
    res.redirect(`/listings/${listing.id}`);
};

// Delete review rout callback:
module.exports.deleteReview = async (req, res) => {
    let {id, reviewId} = req.params;
    
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    req.flash('success', 'Review deleted successfully!');
    res.redirect(`/listings/${id}`);
};