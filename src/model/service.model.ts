import { model, models, Schema } from "mongoose";
import { IServices } from "../Interfaces/service.interface";

const serviceSchema = new Schema<IServices>({
  title: String, 
  description: String,
  providerId: { type: Schema.Types.ObjectId, ref: 'User' },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  subCategoryId: { type: Schema.Types.ObjectId, ref: 'SubCategory' },
  price: Number,
  images: [String],
  location: String
});
  

const Service = models.User || model('service', serviceSchema);

export default Service;  