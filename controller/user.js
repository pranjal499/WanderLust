// Require cradentials:
const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync.js');
const { localLogin } = require('../utils/auth.js');
const {saveRedirectUrl} = require('../middleware.js');
const passport = require('passport');

// Render signup form rout callback:
module.exports.renderSignupForm = (req, res) => {
    res.render('user/signup.ejs');
};

// Post signup form rout callback:
module.exports.postSignupForm = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({
            username,
            email
        });
        const registeredUser = await User.register(newUser, password);
        req.session.userId = registeredUser._id.toString();
        req.session.username = registeredUser.username;
        req.session.isAuthenticated = true;
        req.user = registeredUser;

        req.flash('success', 'Signed up successfully!');
        return res.redirect('/listings');

    }
    catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }
};

// Render login form rout callback:
module.exports.renderLoginForm = (req, res) => {
    res.render('user/login.ejs');
};

// Post login form rout callback:
module.exports.postLoginForm = (req, res) => {
    let redirectUrl = req.session.redirectUrl || '/listings';
    res.redirect(redirectUrl);
};

// Logout rout callback:
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.flash('success', 'Logged out successfully!');
        res.redirect('/listings');
    });
};