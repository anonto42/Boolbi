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
      date: {
        type: Date,
        default: new Date( Date.now() )
      },
      status: {
        type: Boolean,
        default: true
      }
    },
    paymentProcessed: {
      date: {
        type: Date,
        default: new Date( Date.now() )
      },
      status: {
        type: Boolean,
        default: true
      }
    },
    isComplited: {
      date: {
        type: Date,
        default: null
      },
      status: {
        type: Boolean,
        default: false
      }
    },
  }
},{
  timestamps: true
});

const Order = models.order || model<IOrder>('order', orderSchema);
export default Order;