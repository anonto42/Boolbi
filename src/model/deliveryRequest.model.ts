import { model, models, Schema } from "mongoose";
import { IDR } from "../Interfaces/deliveryRequest.interface";
import { DELIVERY_STATUS } from "../enums/delivery.enum";

const deliveryRequestSchema = new Schema<IDR>({
  orderID:{
    type: Schema.Types.ObjectId,
    ref: "orders"
  },
  customer:{
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  projectDoc:{
    type: String,
    required: true
  },
  uploatedProject:{
    type: String,
    required: true
  },
  pdf:{
    type: String
  },
  projectImage:{
    type: String
  },
  requestStatus:{
    type: String,
    enum: DELIVERY_STATUS,
    default: DELIVERY_STATUS.WATING
  },
},{
    timestamps: true
});
  
const DeliveryRequest = models.User || model('deliveryRequest', deliveryRequestSchema);
export default DeliveryRequest;