import { model, models, Schema } from "mongoose";
import { PAYMENT_STATUS } from "../enums/payment.enum";

const paymentSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user"
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "user"
    },
    amount: Number,
    commission: Number,
    chargeID: String,
    status: { 
      type: String, 
      enum: PAYMENT_STATUS, 
      default: PAYMENT_STATUS.PENDING 
    }
  },{
    timestamps: true
  });
  
const Payment = models.Order || model('payment', paymentSchema);
export default Payment;