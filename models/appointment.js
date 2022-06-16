const {model,Schema} = require('mongoose');

const UserSchema = new Schema({
    patientId:Schema.Types.ObjectId,
    patientname:String,
    DoB:String,
    mobile:String,
    address:String,
    doctorname:String,
    doctorId:Schema.Types.ObjectId,
    speciality:String,
    slotId:Schema.Types.ObjectId,
    dateId:Schema.Types.ObjectId,
    appointmentDate:String,
    appointmentTime:String,
    paymentmethod:String,
    status:String,
    fees:Number
})

const Appointment = model('appointment', UserSchema);

module.exports = Appointment;