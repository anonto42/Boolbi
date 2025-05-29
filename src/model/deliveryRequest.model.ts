import { model, models, Schema } from "mongoose";
import { IDR } from "../Interfaces/deliveryRequest.interface";
import { DELIVERY_STATUS, REQUEST_TYPE } from "../enums/delivery.enum";

const deliveryRequestSchema = new Schema<IDR>({
  orderID:{
    type: Schema.Types.ObjectId,
    ref: "orders"
  },
  for:{
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  requestType:{
    type: String,
    enum: REQUEST_TYPE
  },
  projectDoc:{
    type: String,
    required: true
  },
  uploatedProject:{
    type: String,
    required: true
  },
  nextExtendeDate:{
    type: Date
  },
  pdf:{
    type: String
  },
  images:[{
    type: String
  }],
  requestStatus:{
    type: String,
    enum: DELIVERY_STATUS,
    default: DELIVERY_STATUS.WATING
  },
},{
    timestamps: true
});
  
const DeliveryRequest = models.DeliveryRequest || model('deliveryRequest', deliveryRequestSchema);
export default DeliveryRequest;