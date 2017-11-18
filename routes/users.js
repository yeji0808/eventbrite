var express = require('express');
var router = express.Router();
const catchErrors = require('../lib/async-error');
const User = require('../models/user');

function validateForm(form, options) {
  var name = form.name || "";
  var email = form.email || "";
  name = name.trim();
  email = email.trim();

  if (!name) {
    return 'Name is required.';
  }

  if (!email) {
    return 'Email is required.';
  }

  if (!form.password && options.needPassword) {
    return 'Password is required.';
  }

  if (form.password !== form.password_confirmation) {
    return 'Passsword do not match.';
  }

  if (form.password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  return null;
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/signup', (req, res, next) => {
  res.render('users/signup', );
});

router.post('/', catchErrors(async (req, res, next) => {
  var err = validateForm(req.body, {needPassword: true});
  if (err) {
   // req.flash('danger', err);
    return res.redirect('back');
  }
  var user = await User.findOne({email: req.body.email});
  console.log('USER???', user);
  if (user) {
   // req.flash('danger', 'Email address already exists.');
    return res.redirect('back');
  }
  user = new User({
    name: req.body.name,
    email: req.body.email,
  });
  user.password = await user.generateHash(req.body.password);
  user.save(function(err) {
    if(err){
      console.log(err);
      return handleError(err);
    }
  });
 // req.flash('success', 'Registered successfully. Please sign in.');
  res.redirect('/');
}));
module.exports = router;
