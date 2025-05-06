import { model, models, Schema, Types } from "mongoose";
import { IOrder } from "../Interfaces/order.interface";

const orderSchema = new Schema<IOrder>({
  customer: Types.ObjectId,
  deliveryDate: Date,
  totalPrice: Number,
  serviceProvider: Types.ObjectId,
  submittedForApprovalOn: Date,
  serviceProviderAcceptationOn: Date,
  paymentEstimatedOn: Date,
  isProgressDone: Boolean 
});

const Order = models.Order || model('order', orderSchema);
export default Order;