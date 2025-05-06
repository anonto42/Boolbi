import { model, models, Schema } from "mongoose";
import { IOrder } from "../Interfaces/order.interface";

const orderSchema = new Schema<IOrder>({
  customer: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  serviceProvider: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
    min: 8
  },
  projectName:{
    type: String,
    required: true,
    trim: true
  },
  catagory:{
    type: String,
    required: true,
    trim: true
  },
  subCatagory:{
    type: String,
    required: true,
    trim: true
  },
  budget:{
    type: Number,
    required: true,
    trim: true
  },
  jobLocation:{
    type: String,
    required: true,
    trim: true
  },
  deadline:{
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true,
    trim: true,
    min: 8
  },
  companyImages:[{
    type: String,
    required: true,
    trim: true
  }]
});

const Order = models.Order || model('order', orderSchema);
export default Order;