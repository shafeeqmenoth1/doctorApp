const {model,Schema} = require('mongoose');
const bcrypt = require('bcrypt');
const createHttptError = require('http-errors');
const { roles, slots } = require('../utils/constants');

const slotSchema = new Schema({
  time : {
    type: String,
  
  },
  isBooked : {
    type: Boolean,
    default: false
}

})

const dateSchedule = new Schema({
  date : Date,
  createdAt: {
    type:Date,
    default: ()=>Date.now()
  },
  slots :[slotSchema]
})

const UserSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
  },
  mobile: {
    type: String,
    min: 10,
  },
  gender: String,
  password: {
    type: String,
    required: true,
  },
  DoB: {
    type: String,
  },
  blood: String,
  profileImg: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  address: String,
  role: {
    type: String,
    enum: [roles.admin, roles.doctor, roles.user],
    default: roles.user,
  },
  schedule:[dateSchedule],
  fees:Number,
  speciality:{
    type: String,
  },
  qualification:String
});



UserSchema.pre(['save'], async function (next) {
 
  try {
    
    if (this.isNew) {
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(this.password, salt);
      this.password = password;
      if (this.email === process.env.ADMIN_EMAIL.toLowerCase()) {
        this.role = roles.admin;
      }
     
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.pre(['find','findOne'], async function (next) {
 
this.lean()
});

// UserSchema.methods.isValidPassword = async function (password) {
//   try {
//     return await bcrypt.compare(password, this.password);
//   } catch (error) {
//     throw createHttptError.internalServerError(error.message);
//   }
// };
const User = model('user', UserSchema);

const DateSchedule = model('DateSchedule', dateSchedule);

module.exports = {
  User,
 
  DateSchedule
}