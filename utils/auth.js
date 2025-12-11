// Custom authentication middleware
// This custom login system replicates the same salting + hashing process
// used by passport-local-mongoose's User.register.
//
// Process:
// 1. Find user by username (including salt & hash fields)
// 2. Run pbkdf2 with same params as passport-local-mongoose
// 3. Compare computed hash with stored hash
// 4. If match, store user info in session (manual login)

const User = require('../models/user.js');
const crypto = require('crypto');

// ==== Hashing helper matching passport-local-mongoose defaults ====
// passport-local-mongoose defaults:
// iterations = 25000
// keylen     = 512
// encoding   = 'hex'
// digest     = 'sha256'
const hashPasswordWithSalt = (password, salt) => {
  const hash = crypto.pbkdf2Sync(
    password,   // password
    salt,       // salt string as stored by plugin
    25000,      // iterations
    512,        // key length in bytes
    'sha256'    // digest
  );

  return hash.toString('hex'); // same encoding as plugin
};

// ==== Authenticate user by manually comparing hash & salt ====
const authenticateUser = async (username, password) => {
  if (!username || !password) {
    return { success: false, error: 'Username and password are required' };
  }

  // Explicitly include salt & hash (select:false by default)
  const user = await User.findOne({ username }).select('+salt +hash');

  if (!user) {
    return { success: false, error: 'Invalid username or password' };
  }

  if (user.salt == null || user.hash == null) {
    console.error('User missing salt/hash:', {
      id: user._id,
      salt: user.salt,
      hash: user.hash
    });
    // Treat as invalid creds
    return { success: false, error: 'Invalid username or password' };
  }

  // Compute hash using same params
  const computedHash = hashPasswordWithSalt(password, user.salt);
  const storedHash = user.hash.toString(); // hex string

  if (computedHash !== storedHash) {
    return { success: false, error: 'Invalid username or password' };
  }

  return { success: true, user };
};

// ==== Custom middleware: manual login, no Passport req.login ====
// This sets session values so we can track login state across the app.
const localLogin = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    req.flash('error', 'Username and password are required');
    return res.redirect('/login');
  }

  try {
    const result = await authenticateUser(username, password);

    if (!result.success) {
      req.flash('error', result.error);
      return res.redirect('/login');
    }

    const user = result.user;

    // Requires express-session to be configured in app.js:
    // app.use(session({ secret: '...', resave: false, saveUninitialized: false }));
    if (!req.session) {
      console.error('req.session is undefined – express-session not set up');
      req.flash('error', 'Session is not configured on the server');
      return res.redirect('/login');
    }

    // Store minimal user info in session; this is your "logged-in record"
    req.session.userId = user._id.toString();
    req.session.username = user.username;
    req.session.isAuthenticated = true;

    // Also attach to req for this request
    req.user = user;

    req.flash('success', `Welcome back! ${username}`);
    // return res.redirect('/listings');
    return next();
  } catch (err) {
    console.error('Authentication error (catch):', err);
    req.flash('error', 'An error occurred during authentication');
    return res.redirect('/login');
  }
};

// ==== Middleware to attach auth state to every request (Passport-like) ====
// Use this in app.js so all routes & views know if user is logged in.
const attachAuthState = async (req, res, next) => {
  try {
    // Define a Passport-like helper
    req.isAuthenticated = function () {
      return !!(req.session && req.session.isAuthenticated && req.session.userId);
    };

    if (req.isAuthenticated()) {
      // Fetch fresh user data from DB for this session userId
      const user = await User.findById(req.session.userId);

      req.user = user || null;

      // Make it available in all EJS views
      res.locals.currentUser = user || null;
      res.locals.currUser = user || null;      // <- for old templates using currUser
      res.locals.isAuthenticated = !!user;
    } else {
      req.user = null;
      res.locals.currentUser = null;
      res.locals.currUser = null;
      res.locals.isAuthenticated = false;
    }

    next();
  } catch (err) {
    console.error('Error in attachAuthState middleware:', err);
    // Even if there's an error, don't hang the request
    req.user = null;
    res.locals.currentUser = null;
    res.locals.currUser = null;
    res.locals.isAuthenticated = false;
    next();
  }
};

// ==== Route guard (like Passport's ensureAuthenticated) ====
const ensureAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.isAuthenticated || !req.session.userId) {
    req.flash('error', 'You must be logged in to access this page');
    return res.redirect('/login');
  }
  next();
};

// ==== Logout helper ====
const logout = (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session on logout:', err);
        return next(err);
      }
      res.redirect('/login');
    });
  } else {
    res.redirect('/login');
  }
};

module.exports = {
  localLogin,
  authenticateUser,
  attachAuthState,
  ensureAuthenticated,
  logout
};
