var express = require('express');
var router = express.Router();
var crsf = require('csurf');
var passport = require('passport');

var csrfProtection = crsf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, function (req, res, next) {
    res.render('user/profile', {title: 'TechBuy'});
});

router.get('/logout', isLoggedIn, function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/', {title: 'TechBuy'});
    });
  });

router.use('/', notLoggedIn, function (req, res, next) {
    next();
});

router.get('/signup', function (req, res, next) {
    var messages = req.flash('error');
    res.render('user/signup', { title: 'TechBuy', csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signup',
    failureFlash: true
}), function(req, res, next) {
    if(req.session.oldUrl) {
        var oldUrl = res.session.oldUrl;
        res.session.oldUrl = null;
        res.redirect(oldUrl);
    }
    else
    {
        res.redirect('/user/profile');
    }
});

router.get('/signin', function (req, res, next) {
    var messages = req.flash('error');
    res.render('user/signin', { title: 'TechBuy', csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signin', passport.authenticate('local.signin', {
    failureRedirect: '/user/signin',
    failureFlash: true
}), function(req, res, next) {
    if(req.session.oldUrl) {
        var oldUrl = res.session.oldUrl;
        res.session.oldUrl = null;
        res.redirect(oldUrl);
    }
    else
    {
        res.redirect('/user/profile');
    }
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect('/');
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
      return next();
  }
  res.redirect('/');
}
