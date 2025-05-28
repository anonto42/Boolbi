import { model, models, Schema } from "mongoose";
import { IOrder } from "../Interfaces/order.interface";

const orderSchema = new Schema<IOrder>({
  offerID : {
    type: Schema.Types.ObjectId,
    ref: "offer"
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref:"user"
  },
  provider: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  deliveryDate: {
    type: Date
  },
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
    orderCreated: {
      date: Date,
      status: {
        type: Boolean,
        default: true
      }
    },
    paymentProcessed: {
      date: Date,
      status: {
        type: Boolean,
        default: true
      }
    },
    isComplited: {
      date: Date,
      status: {
        type: Boolean,
        default: false
      }
    },
  }
},{
  timestamps: true
});

const Order = models.Order || model('order', orderSchema);
export default Order;