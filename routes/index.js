const { roles } = require('../utils/constants');
const connectEnsure = require('connect-ensure-login');
const router = require('express').Router();


const {getUserHome,
  getUserDash,
  AppointmentPage,
  makeAppointment,
  bookSuccess,
  deleteAppointment,
  getProfile,
  updateProfile,
  verifyPayment
} = require('../controller/user-controller')

const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage }).single('profileImg')


function isActive(req, res, next) {

  if (req.user.isActive) {
    next();
    
  } else {
    res.redirect('/auth/logout');
  }
}


/* GET home page. */
router.get('/', getUserHome);

router.get('/patient-dash', connectEnsure.ensureLoggedIn({ redirectTo: '/auth/login' }),isActive,getUserDash);

router.get('/patient-profile', connectEnsure.ensureLoggedIn({ redirectTo: '/auth/login' }),isActive,getProfile);
router.post('/update-profile/:id', connectEnsure.ensureLoggedIn({ redirectTo: '/auth/login' }),isActive,upload,updateProfile);
router.get('/get-appointment/:id',connectEnsure.ensureLoggedIn({ redirectTo: '/auth/login' }),isActive,AppointmentPage);
router.post('/make-booking',connectEnsure.ensureLoggedIn({ redirectTo: '/auth/login' }),isActive,makeAppointment);

router.get('/book-success',connectEnsure.ensureLoggedIn({ redirectTo: '/auth/login' }),isActive,bookSuccess);

router.post('/verify-payment',connectEnsure.ensureLoggedIn({ redirectTo: '/auth/login' }),verifyPayment);

router.get("/delete-appointment/:id",connectEnsure.ensureLoggedIn({redirectTo: '/auth/login'}),isActive,deleteAppointment);
module.exports = router;
