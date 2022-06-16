const {User }= require("../models/user.model");
const Appointment = require("../models/appointment");
var mongoose = require('mongoose');
const { roles } = require("../utils/constants");
const { generateRazorpay,changePaymentstatus } = require("../utils/services");

const moment = require('moment');





const getUserHome=  async (req,res) => {
    try {
       const doctors = await User.find({role:roles.doctor})
       
        res.render('admin/patient/index',{doctors});
    } catch (error) {
        req.flash('error', error)
    }}
   


const getUserDash= async (req,res) => {

    const id = req.user._id

  const appointData = await Appointment.find({patientId:id}).lean()


        res.render('admin/patient/patient-dash',{appointData});
 
  
   
}
const getProfile = (req,res) =>{
    try {

        const userData = req.user
        res.render('admin/patient/patient-profile')
    } catch (error) {
        console.log(error.message);
    }
        
}
const updateProfile =async (req,res) => {
    try {
        console.log("USERDATA",req.body);
        const id = req.params.id;
        const user =  await User.findById(id)
       console.log(id);
  
    const userData = req.body
 
    const userImg = req.file ? req.file.filename : user.profileImg
  
   User.findOneAndUpdate(
      { _id: id },
      {...userData,profileImg:userImg
       
      }, {upsert: true} ,function(err, userData){
        res.redirect("/patient-profile");
      })
      
    } catch (error) {
        console.log(error.message);
    }

    
  };
const AppointmentPage = async (req,res,next) =>{

    try {
        const id = req.params.id
        const doctor = await User.findById(id)
        const schedulesDate = doctor.schedule
        const d = moment().format('ll')
        const t = moment().format('LT')

        await User.updateOne({'schedule':{$elemMatch:{date:d}}},{$pull:{schedule:{date:{$lt:d}}}})
     
        console.log(t);
        for(const data of schedulesDate){
      
        data.date = moment(data.date).format('ll')
       
        }

     
           
  

    res.render('admin/patient/appointment-page',{doctor,schedulesDate});
        
    } catch (error) {
        console.log(error);
    }

}

const makeAppointment = async (req, res, next) =>{
    try {
        const doctorId = mongoose.Types.ObjectId(req.body.doctorId)
        const dateId = mongoose.Types.ObjectId(req.body.dateId)
        const slotId = mongoose.Types.ObjectId(req.body.slotId)
      await User.updateOne({"schedule.slots._id":slotId }, 
        {$set:{"schedule.$[i].slots.$[j].isBooked":true}},{arrayFilters:[{'i._id':dateId},{'j._id':slotId}]})

  
        const appointmentDetails = req.body
        console.log(req.body);
      
         const status = appointmentDetails.paymentmethod === "Offline" ? "Confirmed" : "Pending"
        const appointment = await new Appointment({
            ...appointmentDetails,status
        })
        
       appointment.save((err,data)=>{
        const appointmentId = data._id
        const fees = data.fees
        if(appointmentDetails.paymentmethod==="Offline"){
        
            res.json({offlineSuccess:true})
        }else if(appointmentDetails.paymentmethod==="Online"){
            generateRazorpay(appointmentId,fees).then((response)=>{
                res.json(response)
            })
        }
        
       })
        
    }catch(error) {
        console.log(error);
    }
}

const bookSuccess = (req,res) => {

    res.render('admin/patient/bookSuccess')
}

const deleteAppointment = async (req, res) => {
    const id = req.params.id;
    const AppointmentData = await Appointment.findById(id)
    const slotId = AppointmentData.slotId
    const dateId = AppointmentData.dateId
    console.log(AppointmentData);
  await  Appointment.deleteOne({_id: id })
       
  await User.updateOne({"schedule.slots._id":slotId }, 
        {$set:{"schedule.$[i].slots.$[j].isBooked":false}},{arrayFilters:[{'i._id':dateId},{'j._id':slotId}]}) 
     
       
        res.redirect('/patient-dash');
      
    
  };
const verifyPayment = async(req,res) => {
   
    try {
        console.log("VERIFYBD",req.body);
        let body=req.body.payment.razorpay_order_id+ "|" + req.body.payment.razorpay_payment_id
      let{
          createHmac
      } = await import("node:crypto")
       
        let expectedSignature = createHmac('sha256', process.env.razorpay_secret_key)
        .update(body.toString())
        .digest('hex');
        
        console.log("sig generated " ,expectedSignature);
    // let response = {"signatureIsValid":"false"}
    if(expectedSignature === req.body.payment.razorpay_signature){
        console.log("Yes matched");
        // response={"signatureIsValid":"true"}
        changePaymentstatus(req.body.appointment.receipt).then(()=>{
            console.log("PaymentSucess");
            res.json({status:true})
        }).catch((err)=>{
            res.json({status:false})
        })
    }else{
                console.log("Not matched");
    }
    } catch (error) {
        console.log(error);
    }




}
module.exports = {
    getUserHome,
    getUserDash,
    AppointmentPage,
    makeAppointment,
    bookSuccess,
    deleteAppointment,
    verifyPayment,
    getProfile,
    updateProfile
}