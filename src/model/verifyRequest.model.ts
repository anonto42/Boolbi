import { model, models, Schema } from "mongoose";

const VerificationSchema = new Schema({
  user:{
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  doc:{
    type: String,
    required: true
  },
  image:[{
    type: String
  }]
},{
  timestamps: true
});

const Verification = models.Verification || model('verify', VerificationSchema);
export default Verification;