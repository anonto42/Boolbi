import { model, models, Schema } from "mongoose";
import { ICatagory } from "../Interfaces/catagory.interface";

const categorySchema = new Schema<ICatagory>({
  name: {
    type: String,
    required: true,
    min: 8,
    trim: true
  },
  image: {
    type: String,
    required: true,
  },
  subCatagorys:{
    type: String,
    trim: true,
    min: 8
  }
},{
  timestamps: true
});
  
const Catagroy = models.User || model('catagory', categorySchema);
export default Catagroy;