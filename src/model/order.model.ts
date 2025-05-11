import { model, models, Schema } from "mongoose";
import { IOrder } from "../Interfaces/order.interface";

const orderSchema = new Schema<IOrder>({
  customer: Schema.Types.ObjectId,
  deliveryDate: Date,
  totalPrice: Number,
  serviceProvider: Schema.Types.ObjectId,
  deliveryRequest:{
    isRequested: {
      type: Boolean,
      default: false
    },
    requestID: {
      type: Schema.Types.ObjectId,
      ref: "deliveryRequest"
    }
  },
  trackStatus: {
    submiteForAdminApproval:{
        date: Date,
        status: {
          type: Boolean,
          default: false
        }
    },
    approval:{
        date: Date,
        status: {
          type: Boolean,
          default: false
        }
    },
    paymentProcessed:{
        date: Date,
        status: {
          type: Boolean,
          default: false
        }
    },
  },
  isProgressDone: {
    type: Boolean,
    default: false
  } 
},{
  timestamps: true
});

const Order = models.Order || model('order', orderSchema);
export default Order;