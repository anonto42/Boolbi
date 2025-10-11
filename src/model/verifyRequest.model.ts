import { model, models, Schema } from "mongoose";

const VerificationSchema = new Schema({
  user:{
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  doc:{
    type: String,
  },
  image:[{
    type: String
  }],
  status:{
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending"
  }
},{
  timestamps: true
});

const Verification = models.Verification || model('verify', VerificationSchema);
export default Verification;