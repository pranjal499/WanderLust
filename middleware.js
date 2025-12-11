// Requiring cradentials:
const Listing = require('./models/listing.js');
const {listingSchema, reviewSchema} = require('./schema.js');
const ExpressError = require('./utils/ExpressError.js');
const Review = require('./models/review.js');

// Check whether user is authenticated or not:
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash('error', 'You are not logged in!');
        return res.redirect('/login');
    }
    next();
};

// Save redirect url:
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// Same owner:
module.exports.isOwner = async(req, res, next) => {
    let {id} = req.params;
    let item = await Listing.findById(id);
    if (res.locals.currUser && !item.owner._id.equals(res.locals.currUser._id)) {
        req.flash('error', 'You are not owner!');
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// Same owner of review:
module.exports.isReviewAuther = async(req, res, next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if (res.locals.currUser && !review.auther._id.equals(res.locals.currUser._id)) {
        req.flash('error', 'You are not Auther!');
        return res.redirect(`/listings/${id}`);
    }
    next();
}

// Validate Listing middleware
module.exports.validateListing = async(req, res, next) => {
    // Normalize the data before validation
    if (req.body.listing) {
        // Handle image field - if missing or empty, set to empty object with empty url
        // if (!req.body.listing.image || !req.body.listing.image.url) {
        //     req.body.listing.image = { url: "" };
        // }
        // Ensure price is a number (form sends it as string)
        if (req.body.listing.price !== undefined && req.body.listing.price !== null) {
            req.body.listing.price = Number(req.body.listing.price);
            if (isNaN(req.body.listing.price)) {
                throw new ExpressError(400, "Price must be a valid number");
            }
        }
    }
    
    let {error} = listingSchema.validate(req.body, { abortEarly: false });
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(', ');
        throw new ExpressError(400, errMsg);
    }
    return next();
};

// Validate review middleware:
module.exports.validateReview = (req, res , next) => {
    let {error} = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    }
};