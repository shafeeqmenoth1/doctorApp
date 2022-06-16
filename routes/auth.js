const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const connectEnsure = require('connect-ensure-login');
const {User }= require('../models/user.model');
const { roles } = require('../utils/constants');


function ifAdmin(req, res) {
  if (req.user.role === roles.admin) {
    res.redirect('/admin');
  }else if (req.user.role === roles.doctor) {
    res.redirect('/doctors');
   } else {
    res.redirect('/');
  }
}
router.get(
  '/login',
  connectEnsure.ensureLoggedOut({ redirectTo: '/' }),
  async (req, res) => {

 
    res.render('login');
  }
);

router.get(
  '/register',
  connectEnsure.ensureLoggedOut({ redirectTo: '/' }),
  async (req, res) => {
    res.render('register');
  }
);

router.post(
  '/login',
  connectEnsure.ensureLoggedOut({ redirectTo: '/' }),
  passport.authenticate('local', {
    failureRedirect: '/auth/login',
    failureFlash: true,
  }),
  ifAdmin
);

router.post(
  '/register',
  connectEnsure.ensureLoggedOut({ redirectTo: '/' }),
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Email must be a valid email')
      .normalizeEmail()
      .toLowerCase(),
    body('password')
      .trim()
      .isLength(6)
      .withMessage('Password length short, min 6 character required'),
    body('password2').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password do not match');
      }
      return true;
    }),
  ],
  async (req, res, next) => {
 
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
          req.flash('danger', error.msg);
        });
        res.render('register', { messages: req.flash() });
        return;
      }
      const { email } = req.body;
      
     
       
          const user = new User(req.body);
          const doesExist = await User.findOne({ email });
          if (doesExist) {
            req.flash('danger', `${user.email} is already registered`);
    
            res.redirect('/auth/register');
    
            return;
          }
          await user.save();
          req.flash(
            'success',
            `${user.email} successfully registered, you can login now`
          );
          res.redirect('/auth/login');
        
     

      
 
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  '/logout',
  connectEnsure.ensureLoggedIn({ redirectTo: '/auth/login' }),
  async (req, res) => {
    if (req.user.role === roles.admin) {
      req.logOut();
      res.redirect('/auth/login');
    
   
    } else{
      req.logOut();
      res.redirect('/');
    }
  }
);

module.exports = router;
