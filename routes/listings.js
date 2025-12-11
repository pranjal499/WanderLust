// Requiring credentials:
const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const {attachAuthState} = require('../utils/auth.js');
const {isLoggedIn, isOwner, validateListing} = require('../middleware.js');
const listingController = require('../controller/listings.js');
const multer  = require('multer');
const {storage} = require('../cloudConfig.js');
const upload = multer({ storage });


// This attaches req.isAuthenticated(), req.user, and res.locals.currentUser:
router.use(attachAuthState);

// Listing rout:
router.route('/')
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.postNewForm));

// Create rout:
router.get('/new', isLoggedIn, listingController.renderNewForm);

// Id rout:
router.route('/:id')
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));


// Update rout:
router.get('/:id/edit',isLoggedIn, isOwner, wrapAsync(listingController.renderUpdateListingForm));

module.exports = router;