const Razorpay = require('razorpay');
const Appointment = require('../models/appointment');
require('dotenv').config();

const instance = new Razorpay({
    key_id: process.env.razorpay_id,
    key_secret: process.env.razorpay_secret_key,
  });

const generateRazorpay = (appointmentId,fees)=>{

    return new Promise((resolve,reject)=>{

        var options = {
            amount: fees*100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: ""+appointmentId
          };
          instance.orders.create(options, function(err, order) {
              if(err) console.log(err);
              else{
               
                  resolve(order)
              }
          });
    })


}

const changePaymentstatus  = (receiptId)=>{
    console.log("RECEIPTID",receiptId);
    return new Promise ((resolve,reject)=>{
        Appointment.findOneAndUpdate({_id:receiptId}, {status: "Confirmed"}).then((response)=>{
            resolve(response)
        })
    })
}

module.exports = {
    generateRazorpay,
    changePaymentstatus
}