const {User}= require("../models/user.model");
var mongoose = require('mongoose');
const Appointment = require("../models/appointment");

const moment = require('moment')

const doctorDash = async(req, res, next)=> {

  
    res.render("admin/doctor/doctor-dash",{user:req.user});
  }

  const appointmentList = async(req, res, next)=> {

    const id = req.user._id

    const appointData = await Appointment.find({doctortId:id}).lean()
  
  console.log(appointData);
          res.render('admin/doctor/appointment-list',{appointData});

    res.render("admin/doctor/appointment-list");
  }

const scheduleList = async(req, res, next)=> {
   
   

  const schedulesDate = req.user.schedule


  schedulesDate.forEach(data=>{
  data.date = moment(data.date).format('ll')
  })

 
 


            
   res.render("admin/doctor/schedule-list",{schedulesDate:schedulesDate});
 
  }
const addShedule = async (req,res)=>{
   try {
  
    
     const  id = req.user._id;
     const  date = req.body.date;
     
     const doesExist = await User.findOne({_id:id,"schedule.date":date});

     if(doesExist){
      req.flash('danger', `${date} is already Scheduled`);
      res.redirect('/doctors/schedule-list')
     }else{
      await User.findOneAndUpdate({_id:id}, {$push:{schedule:{date:date}}});

      res.redirect('/doctors/schedule-list')
     }
    
   } catch (error) {
       
    console.log(error.message);

   
   }
}


const deleteSchedule = async(req,res)=>{
try {
    const id = req.params.id;
    const userId = req.user._id
    console.log(id);
    User.updateOne({_id: userId },{$pull:{schedule:{_id:id}}},function(err, result) {
     res.redirect('/doctors/schedule-list');
    })
    
} catch (error) {
    console.log(err);
}
   
}


const editSchedule = async(req,res) => {
  const schedId = req.query.schedId
  const userId = req.user._id

 User.findOne({_id:userId}).select({schedule:{$elemMatch:{_id:schedId}}}).then(function(data) {
    
    res.json(data.schedule);
    

  })
    
}

const updateSchedule = async(req,res)=>{
const userId = req.user
const schedId = mongoose.Types.ObjectId(req.body._id);

  User.updateOne({_id:userId,'schedule._id':schedId}, {$set: {
    'schedule.$.scheduleDate': req.body.scheduleDate,
    'schedule.$.endTime': req.body.endTime,
    'schedule.$.consTime': req.body.consTime
}}, function(err,doc) { 
  if(err) {
    alert(err);
  }
    res.redirect('/doctors/schedule-list')
})
}

const getDate = async (req, res)=>{
 const schedId = req.query.schedId;
 const userId = req.user._id
User.findOne({_id:userId}).select({schedule:{$elemMatch:{_id:schedId}}}).then(function(data) {

  res.json(data.schedule[0].date);
  

})


}

const addSlots = async (req,res)=>{
try{


  const schedId = mongoose.Types.ObjectId(req.body.schedId);
  const slots = req.body['slots']

  const  id = req.user._id;
 
  if(typeof slots === "string"){
    await User.updateOne({_id:id,"schedule._id":schedId},{
      $push: {
        "schedule.$.slots":{time:slots} 
      }
    })
 
  }else{
    for(let i of slots){
      await User.updateMany({_id:id,"schedule._id":schedId},{
       $push: {
         "schedule.$.slots":{time:i} 
       }
     })
      }
  }

     res.json({status:true});
     
}catch(err){
  console.log(err);
}

}
const schedBlock = async (req, res) => {
  try {
    const userId = req.user._id
    const id = req.params.id;
    await User.findOneAndUpdate({_id:userId,'schedule._id':id}, {isActive: false},
      function(err, userData) {
     
        if (err) return res.send(500, {error: err});
        return res.redirect("/doctors/schedule-list")
       
    });
    
  } catch (err) {
    console.log(err);
  }
};

const schedUnblock = async (req, res) => {
  try {
    const userId = req.user._id
    const id = req.params.id;
    await User.findOneAndUpdate({_id:userId,'schedule._id':id}, {isActive: true},
      function(err, userData) {
     
        if (err) return res.send(500, {error: err});
        return res.redirect("/doctors/schedule-list")
    });

  } catch (err) {
    console.log(err);
  }
};


const deleteAppointment =  async(req,res)=>{
  try {
    const id = req.params.id;
    const AppointmentData = await Appointment.findById(id)
    const slotId = AppointmentData.slotId
    const dateId = AppointmentData.dateId
   
    Appointment.deleteOne({ _id: id },async function(){
      await User.updateOne({"schedule.slots._id":slotId }, 
        {$set:{"schedule.$[i].slots.$[j].isBooked":false}},{arrayFilters:[{'i._id':dateId},{'j._id':slotId}]}) 
      res.redirect('/doctors/appointment-list')
    })
    
} catch (error) {
    console.log(err.message);
}
}

module.exports = {
    doctorDash,
    appointmentList,
    scheduleList,
    addShedule,
    deleteSchedule,
    editSchedule,
    updateSchedule,
    schedBlock,
    deleteAppointment,
    addSlots,
    schedUnblock,
    getDate
}