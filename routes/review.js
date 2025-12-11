// Requiring credentials:
const express = require('express');
const router = express.Router({mergeParams: true});
// const Listing = require('../models/listing.js');
const wrapAsync = require('../utils/wrapAsync.js');
// const ExpressError = require('../utils/ExpressError.js');
const {validateReview, isLoggedIn, isReviewAuther, saveRedirectUrl} = require('../middleware.js');
// const Review = require('../models/review.js');
const reviewController = require('../controller/review.js');

// Validate review function:


// Reviews rout:
router.post('/', validateReview, isLoggedIn, wrapAsync(reviewController.createReview));

// Delete review rout:
router.delete('/:reviewId', isLoggedIn, saveRedirectUrl, isReviewAuther, wrapAsync(reviewController.deleteReview));

module.exports = router;