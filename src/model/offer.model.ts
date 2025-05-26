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
  companyName: {
    type: String,
    trim: true,
    min: 8
  },
  projectName:{
    type: String,
    trim: true
  },
  category:{
    type: String,
    trim: true
  },
  timeFrame:{
    type: Date,
  },
  budget:{
    type: Number,
    trim: true
  },
  jobLocation:{
    type: String,
    trim: true
  },
  deadline:{
    type: String,
  },
  description:{
    type: String,
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
    trim: true
  }]
},{
  timestamps: true
});

const Offer = models.Offer || model<IOffer>('offer', offerSchema);
export default Offer;