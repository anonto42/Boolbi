import { model, models, Schema } from "mongoose";
import { IDR } from "../Interfaces/deliveryRequest.interface";

const categorySchema = new Schema<IDR>({
  projectDoc:{
    type: String,
    required: true,
    trim: true
  },
  uploatedLink:{
    type: String,
    required: true,
    trim: true
  },
  pdfLink:{
    type: String,
    required: true,
    trim: true
  },
  photoLink :{
    type: String,
    required: true,
    trim: true
  },
  isAccepted:{
    type: Boolean,
    required: true,
    trim: true
  },
},{
    timestamps: true
});
  
const Catagroy = models.User || model('catagory', categorySchema);
export default Catagroy;