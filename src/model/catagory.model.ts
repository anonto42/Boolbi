import { model, models, Schema } from "mongoose";
import { ICatagory } from "../Interfaces/catagory.interface";

const categorySchema = new Schema<ICatagory>({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true,
  },
  subCatagorys:{
    type: String,
  }
},{
  timestamps: true
});
  
const Catagroy = models.User || model('catagory', categorySchema);
export default Catagroy;