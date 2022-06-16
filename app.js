const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { success, error } = require('consola');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/doctors');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const dynamicStatic = require('express-dynamic-static')();
var Handlebars = require('handlebars');

const mongoose = require('mongoose');
const app = express();
const hbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');

const connectFlash = require('connect-flash');
const connectEnsure = require('connect-ensure-login');
const { roles } = require('./utils/constants');
require('dotenv').config();
app.use(dynamicStatic);

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'hbs');
app.engine(
  'hbs',
  hbs.engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layout/',
    partialsDir: __dirname + '/views/partials/',
  })
);
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
    },
  
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
require('./utils/passport-auth');
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
mongoose
  .connect(process.env.MONGO_URI, {
    
    useNewUrlParser: true,
 
    useUnifiedTopology: true
  })
  .then(() => {
    success({ message: 'Connected to MongoDB', badge: true });
  })
  .catch((err) => {
    console.log(err.message);
  });




Handlebars.registerHelper('inc', function (value, options) {
  return parseInt(value) + 1;
});


app.use('/', indexRouter);
app.use(
  '/doctors',
  connectEnsure.ensureLoggedIn({ redirectTo: '/auth/login' }),
  usersRouter
);
app.use('/auth', authRouter);
app.use(
  '/admin',
  connectEnsure.ensureLoggedIn({ redirectTo: '/auth/login' }),
  ensureAdmin,

  adminRouter
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


function ensureAdmin(req, res, next) {
  if (req.user.role === roles.admin) {
    next();
  } else {
    req.flash('warning', 'you are not authorized to see this route');
    res.redirect('/auth/login');
  }
}

module.exports = app;
