import { model, models, Schema } from "mongoose";
import { ISupport } from "../Interfaces/support.interface";

const supportSchema = new Schema<ISupport>({
  from:{
    type: Schema.Types.ObjectId,
    ref: "users"
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

const Support = models.Order || model('support', supportSchema);
export default Support;