import { model, models, Schema } from "mongoose";
import { ICatagory } from "../Interfaces/catagory.interface";
import { string } from "zod";

const categorySchema = new Schema<ICatagory>({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true,
  },
  subCatagroys: [{
    type: Schema.Types.ObjectId
  }]
},{
  timestamps: true
});
  
const Catagroy = models.Catagory || model<ICatagory>('catagory', categorySchema);
export default Catagroy;