import { model, models, Schema } from "mongoose";
import { IOffer } from "../Interfaces/offer.interface";
import { OFFER_STATUS } from "../enums/offer.enum";

const offerSchema = new Schema<IOffer>({
  customer: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  serviceID:{
    type: Schema.Types.ObjectId,
    ref:"posts"
  },
  serviceProvider: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  jobID:{
    type: Schema.Types.ObjectId,
    ref: "post"
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
    min: 8
  },
  projectName:{
    type: String,
    required: true,
    trim: true
  },
  catagory:{
    type: String,
    required: true,
    trim: true
  },
  subCatagory:{
    type: String,
    required: true,
    trim: true
  },
  budget:{
    type: Number,
    required: true,
    trim: true
  },
  jobLocation:{
    type: String,
    required: true,
    trim: true
  },
  deadline:{
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true,
    trim: true,
    min: 8
  },
  status:{
    type: String,
    enum: OFFER_STATUS
  },
  companyImages:[{
    type: String,
    required: true,
    trim: true
  }]
},{
  timestamps: true
});

const Offer = models.User || model('offer', offerSchema);
export default Offer;