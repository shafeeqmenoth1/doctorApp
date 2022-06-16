const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const {User }= require('../models/user.model');
const { roles } = require('./constants');
const bcrypt = require('bcrypt');


  passport.use(
    new localStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          
          if (!user) {
            return done(null, false, { message: 'invalid username or password' });
          }
          if (user.isActive) {
            const isMatch = await bcrypt.compare(password, user.password);
  
            return isMatch
              ? done(null, user)
              : done(null, false, { message: 'invalid username or password' });
          } else {
            return done(null, false, { message: "You are blocked by admin"});
          }
        } catch (error) {
          done(error);
        }
      }
    )
  );



passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});


