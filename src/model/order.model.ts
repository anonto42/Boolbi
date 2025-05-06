import { model, models, Schema, Types } from "mongoose";
import { IOrder } from "../Interfaces/order.interface";

const orderSchema = new Schema<IOrder>({
  customer: Types.ObjectId,
  deliveryDate: Date,
  totalPrice: Number,
  serviceProvider: Types.ObjectId,
  submittedForApprovalOn:{
    type: Date || Boolean,
    default: false
  },
  serviceProviderAcceptationOn:{
    type: Date || Boolean,
    default: false
  },
  paymentEstimatedOn:{
    type: Date || Boolean,
    default: false
  },
  isProgressDone: Boolean 
},{
  timestamps: true
});

const Order = models.Order || model('order', orderSchema);
export default Order;