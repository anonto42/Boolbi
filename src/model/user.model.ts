import { model, models, Schema } from "mongoose";
import { IUser } from "../Interfaces/User.interface";
import { ACCOUNT_STATUS, ACCOUTN_ACTVITY_STATUS, SELECTED_LANGUAGE, USER_ROLES } from "../enums/user.enums";

const userSchema = new Schema<IUser>({
  role: { 
    type: String, 
    enum: USER_ROLES, 
    required: true 
  },
  fullName: {
    type: String,
    required: true,
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
    type: Schema.Types.ObjectId,
    ref: "catagory"
  },
  subCatagory:{
    type: Schema.Types.ObjectId,
    ref: "sub_catagory"
  },
  job:[{
    type: Schema.Types.ObjectId,
    ref: "job"
  }],
  favouriteServices:[{
    type: Schema.Types.ObjectId,
    ref: "service"
  }],
  offers:[{
    type: Schema.Types.ObjectId,
    ref: "offer"
  }],
  createdOrder:[{
    type: Schema.Types.ObjectId,
    ref: "order"
  }],
  searchedCatagory:[{
    type: Schema.Types.ObjectId,
    ref: "catagory"
  }],
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
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  samplePictures: [ { type: String } ],
  profileImage: String,
  accountVerificationsPictures: [{ type: String }],
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
    type: Boolean, 
    default: false 
  },
},{
  timestamps: true
});


const User = models.User || model('user', userSchema);
export default User;