const {User} = require('../models/user.model');
const {validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Appointment = require("../models/appointment");
const { roles } = require('../utils/constants');
const moment = require('moment')
const adminDash = async (req, res) => {
  try {
  const drCount = await User.find({ role: roles.doctor }).count()
  const patientCount = await User.find({ role: roles.user }).count()
     
      res.render('admin/admin',{drCount,patientCount});
  
  }catch(err) {

  }


};

const doctorList = (req, res) => {

  User.find({ role: roles.doctor })
  .lean()
  .exec((error, doctors) => {
    res.render('admin/doctor/doctor_list',{doctors});
  });

};
const doctorNames= (req, res) => {

  User.find({ role: roles.doctor })
  .lean()
  .then((doctors) => {
    res.json(doctors)
  });

};
const patientList = (req, res) => {
  User.find({ role: roles.user })
    .lean()
    .exec((error, users) => {
      res.render('admin/patient/patient_list', { users });
    });
};

const viewPatient = (req, res) => {
  const id = req.params.id;
  User.findById(id)
    .lean()
    .exec((error, user) => {
   
      if (!user) {
        res.status(404).send({ message: 'Not found user with this id' });
      } else {
        res.render('admin/patient/view-patient', { user });
      }
    });
};

const editPatient = (req, res) => {
  const id = req.params.id;
  User.findById(id)
    .lean()
    .exec((error, response) => {
      res.render('admin/patient/edit-patient', { userData: response });
    });
};

const updatePatient =async (req,res,next) => {
 
  const id = req.params.id;
  const user =  await User.findById(id)

  const userData = req.body
  const userImg = req.file ? req.file.filename : user.profileImg

  User.findOneAndUpdate(
    { _id: id },
    {
     ...userData,profileImg:userImg
    }, {upsert: true},
    function(err, userData) {
     
      if (err) return res.send(500, {error: err});
      return userData.role === 'DOCTOR' ? res.redirect("/admin/doctor-list")
      :res.redirect("/admin/patient-list");
  }
  )
};
const deletePatient = (req, res) => {
  const id = req.params.id;
  User.deleteOne({ _id: id },function(err, result) {
    
    if (err) {
      res.send(err);
    } else {
     
      res.redirect('/admin/patient-list');
    }
  })
};
const appointmentList = async (req, res, next) => {
  const appointData = await Appointment.find().lean()


  res.render('admin/appointment_list',{appointData});
};

const scheduleList = async(req, res, next) => {

  try {
   const doctorschedules = await User.aggregate([{$unwind:"$schedule"}])

      console.log(doctorschedules);
      doctorschedules.forEach(data=>{
        data.schedule['date'] = moment(data.schedule['date']).format('ll')
        })
        res.render('admin/schedule_list',{doctorschedules});
    
      
  } catch (error) {
    console.log(error.message);
  }
  
}

;

const userBlock = async (req, res) => {
  try {
    const id = req.params.id;
    await User.findOneAndUpdate({ _id: id }, {isActive: false},
      function(err, userData) {
     
        if (err) return res.send(500, {error: err});
        return userData.role === 'DOCTOR' ? res.redirect("/admin/doctor-list")
        :res.redirect("/admin/patient-list");
    });
    
  } catch (err) {
    console.log(err);
  }
};

const userUnblock = async (req, res) => {
  try {
    const id = req.params.id;
    await User.findOneAndUpdate({ _id: id }, { isActive: true },
      function(err, userData) {
     
        if (err) return res.send(500, {error: err});
        return userData.role === 'DOCTOR' ? res.redirect("/admin/doctor-list")
        :res.redirect("/admin/patient-list");
    });

  } catch (err) {
    console.log(err);
  }
};

// Doctors Section


const addDoctor = (req,res)=>{
  res.render('admin/doctor/add-doctor')
}

const postDocRegister =async (req,res,next)=>{
 
        console.log(req.body);
        console.log(req.file);
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

      const userData = req.body
      const userImage = req.file.filename
      const user = new User({...userData,profileImg:userImage});
  
      const doesExist = await User.findOne({ email });
      if (doesExist) {
        req.flash('danger', `${user.email} is already registered`);
  
        res.redirect('/admin/add-doctor');
  
        return;
      }
      await user.save();
      req.flash(
        'success',
        `${user.email} successfully registered, you can login now`
      );
      res.redirect('/admin/doctor-list');
    } catch (e) {
      next(e);
    }
  

}

const deleteDoctor = (req, res) => {
  const id = req.params.id;
  User.deleteOne({ _id: id },function(err, result) {
    
    if (err) {
      res.send(err);
    } else {
     
      res.redirect('/admin/doctor-list');
    }
  })
};

const addSchedule = async (req, res) =>{
  try {
  
    const userId = mongoose.Types.ObjectId(req.body.userId);
    console.log(userId);
  await User.findOneAndUpdate({_id:userId}, {$push:{schedule:{
    scheduleDate: req.body.scheduleDate,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    consTime: req.body.consTime
  }}});
        
     res.redirect('/admin/schedule-list')
  } catch (error) {
      
   console.log(error);

  
  }
}


const deleteSchedule = async(req,res)=>{
  try {
      const id = req.params.id
      const userId = req.params.userId

      User.updateOne({_id: userId },{$pull:{schedule:{_id:id}}},function(err, result) {
       res.redirect('/admin/schedule-list');
      })
      
  } catch (error) {
      console.log(err);
  }
     
  }

  const editSchedule = async(req,res) => {
    const schedId = req.query.schedId
    const userId = req.query.userId
    console.log(req.query);
   User.findOne({_id:userId}).select({schedule:{$elemMatch:{_id:schedId}}}).then(function(data) {
      
      res.json(data.schedule);
      
  
    })
      
  }

  const updateSchedule = async(req,res)=>{
  
  
    const schedId = mongoose.Types.ObjectId(req.body._id);
    
      User.updateOne({'schedule._id':schedId}, {$set: {
        'schedule.$.scheduleDate': req.body.scheduleDate,
        'schedule.$.endTime': req.body.endTime,
        'schedule.$.consTime': req.body.consTime
    }}, function(err,doc) { 
      if(err) {
        alert(err);
      }
        res.redirect('/admin/schedule-list')
    })
    }
    const deleteAppointment = (req, res) => {
      const id = req.params.id;
      Appointment.deleteOne({_id: id },function(err, result) {
        
        if (err) {
          res.send(err);
        } else {
         
          res.redirect('/admin/appointment-list');
        }
      })
    };
module.exports = {
  adminDash,
  patientList,
  doctorList,
  viewPatient,
  appointmentList,
  scheduleList,
  editPatient,
  updatePatient,
  deletePatient,
  userBlock,
  userUnblock,
  addDoctor,
  postDocRegister,
  deleteDoctor,
  doctorNames,
  addSchedule,
  deleteSchedule,
  editSchedule,
  updateSchedule,
  deleteAppointment
  
};
