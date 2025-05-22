import { model, models, Schema } from "mongoose";
import { IOffer } from "../Interfaces/offer.interface";
import { OFFER_STATUS } from "../enums/offer.enum";

const offerSchema = new Schema<IOffer>({
  to: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  form: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  postID:{
    type: Schema.Types.ObjectId,
    ref:"post"
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
  category:{
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
    enum: OFFER_STATUS,
    default: OFFER_STATUS.WATING
  },
  companyImages:[{
    type: String,
    required: true,
    trim: true
  }]
},{
  timestamps: true
});

const Offer = models.Offer || model<IOffer>('offer', offerSchema);
export default Offer;