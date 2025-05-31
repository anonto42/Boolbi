import { model, models, Schema } from "mongoose";
import { ISupport } from "../Interfaces/support.interface";

const supportSchema = new Schema<ISupport>({
  for:{
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  catagory:{
    type: String,
    required: true
  },
  message:{
    type: String,
    required: true
  },
  status:{
    type: String,
    enum:["PENDING", "SOLVED"],
    default: "PENDING"
  },
  adminReply:{
    type: String,
  }
},{
  timestamps: true
});

const Support = models.Support || model('support', supportSchema);
export default Support;