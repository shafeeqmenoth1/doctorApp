const router = require('express').Router();
const connectEnsure = require('connect-ensure-login');
const { body, validationResult } = require('express-validator');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const path = require('path')

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

const {
  adminDash,
  doctorList,
  patientList,
  appointmentList,
  scheduleList,
  viewPatient,
  editPatient,
  updatePatient,
  deletePatient,
  userUnblock,
  userBlock,
  addDoctor,
  postDocRegister,
  deleteDoctor,
  doctorNames,
  addSchedule,
  deleteSchedule,
  editSchedule,
  updateSchedule,
  deleteAppointment
} = require('../controller/admin-controller');

router.get('/', adminDash);

router.get('/doctor-list', doctorList);


router.get('/patient-list', patientList);

router.get('/view-patient/:id', viewPatient);

router.get('/appointment-list', appointmentList);

router.get('/schedule-list', scheduleList);

router.get('/edit-patient/:id', editPatient);
router.post('/edit-patient/:id',upload, updatePatient);

router.get('/delete-patient/:id', deletePatient);

router.get('/delete-appointment/:id', deleteAppointment);

router.get('/block-user/:id', userUnblock);
router.get('/unblock-user/:id', userBlock);


// Doctors Routes


router.get('/add-doctor', addDoctor);

router.post('/add-doctor',upload,postDocRegister )

router.get('/delete-doctor/:id', deleteDoctor);

router.get('/doctor-names', doctorNames);

router.post('/add-schedule', addSchedule);

router.get('/delete-schedule/:id&:userId', deleteSchedule);

router.get('/edit-schedule', editSchedule);

router.post('/update-schedule',updateSchedule)

module.exports = router;
