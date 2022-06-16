const router = require('express').Router();
const connectEnsure = require('connect-ensure-login');
const {
  doctorDash,
  appointmentList,
  scheduleList,
  addShedule,
  deleteSchedule,
  editSchedule,
  updateSchedule,
  addSlots,
  getDate,
  deleteAppointment,
  schedBlock,
  schedUnblock
} = require('../controller/doctor-controller');
const User = require('../models/user.model');

function isActive(req, res, next) {

  if (req.user.isActive) {
    next();
    
  } else {
    res.redirect('/auth/logout');
  }
}



router.get('/',isActive,doctorDash );

router.get('/appointment-list',isActive,appointmentList );

router.get('/schedule-list',isActive,scheduleList);

router.post('/add-schedule-date',isActive,addShedule)

router.get('/delete-schedule/:id',isActive,deleteSchedule)

router.get('/edit-schedule',isActive,editSchedule)

router.post('/update-schedule',isActive,updateSchedule)

router.get('/get-date',getDate)

router.post('/add-slots',addSlots)

router.get('/delete-appointment/:id',isActive,deleteAppointment)

// router.get('/block-sched/:id', schedUnblock);
// router.get('/unblock-sched/:id', schedBlock);

module.exports = router;


