import { model, Schema } from "mongoose";
import { ISupport } from "../Interfaces/support.interface";

const supportSchema = new Schema<ISupport>({
  for:{
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  isAdmin:{
    type: Boolean,
  },
  category:{
    type: String,
  },
  message:{
    type: String,
  },
  isImage:{
    type: Boolean,
    default: true
  },
  image:{
    type: String,
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

const Support = model<ISupport>('support', supportSchema);
export default Support;