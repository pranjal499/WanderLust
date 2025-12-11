// Require cradentials:
const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const { localLogin } = require('../utils/auth.js');
const {saveRedirectUrl} = require('../middleware.js');
const userController = require('../controller/user.js');

// Signup rout:
router.route('/signup')
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.postSignupForm));

// Login rout:
router.route('/login')
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, localLogin, userController.postLoginForm);

// Logout rout:
router.get('/logout', userController.logout);


// Export module:
module.exports = router;