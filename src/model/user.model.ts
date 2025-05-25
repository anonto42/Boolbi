import { model, models, Schema } from "mongoose";
import { IUser } from "../Interfaces/User.interface";
import { ACCOUNT_STATUS, ACCOUTN_ACTVITY_STATUS, SELECTED_LANGUAGE, USER_ROLES, Verification_For } from "../enums/user.enums";

const userSchema = new Schema<IUser>({
  role: { 
    type: String, 
    enum: USER_ROLES, 
    required: true 
  },
  fullName: {
    type: String,
    min: 6,
    max: 100,
    trim: true
  },
  email: { 
    type: String, 
    unique: true, 
    required: true,
    trim: true
  },
  category:{
    type: String
  },
  subCatagory:{
    type: String
  },
  deviceID:{
    type: String
  },
  job:[{
    type: Schema.Types.ObjectId,
    ref: "post"
  }],
  favouriteServices:[{
    type: Schema.Types.ObjectId,
    ref: "service"
  }],
  iOffered:[{
    type: Schema.Types.ObjectId,
    ref: "offer"
  }],
  myOffer:[{
    type: Schema.Types.ObjectId,
    ref: "offer"
  }],
  orders:[{
    type: Schema.Types.ObjectId,
    ref: "order"
  }],
  searchedCatagory: {
    type: [ String ],
    default: []
  },
  city:{
    type: String,
    trim: true,
    min: 3
  },
  postalCode:{
    type: String,
    trim: true,
    min: 4
  },
  address:{
    type: String,
    trim: true,
    min: 7
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  samplePictures: [ { type: String } ],
  profileImage: String,
  serviceDescription: String,
  accountActivityStatus: { 
    type: String, 
    enum: ACCOUTN_ACTVITY_STATUS, 
    default: ACCOUTN_ACTVITY_STATUS.ACTIVE 
  },
  accountStatus: {
    type: String,
    enum: ACCOUNT_STATUS,
    default: ACCOUNT_STATUS.ACTIVE
  },
  language: { 
    type: String, 
    enum: SELECTED_LANGUAGE,
    default: SELECTED_LANGUAGE.ENGLISH 
  },
  isVerified: { 
    trdLicense: String,
    sampleImages: [{
      type: String
    }],
    status: {
      type: Boolean,
      default: false
    }
  },
  accountBalance:{
    type: Number,
    default: 0
  },
  otpVerification:{
    isVerified: {
      status:{
        type: Boolean,
        default: false
      },
      time: Date
    },
    otp: Number,
    time: Date,
    hash: String,
    verificationType:{
      type: String,
      enum: Verification_For,
    }
  },
  privacyPolicy:{
    type: String,
    trim: true
  },
  termsConditions:{
    type: String,
    trim: true
  },
  isSocialAccount:{
    isSocal:{
      type: Boolean,
      default: false
    },
    provider:{
      type: String,
      default: ""
    },
    socialIdentity:{
      type: String
    }
  },
  paymentCartDetails:{
    customerID:{
      type: String
    },
    cardID:{
      type: String
    }
}
},{
  timestamps: true
});

const User = models.User || model('user', userSchema);
export default User;