import { model, models, Schema } from "mongoose";

const subCatagory = new Schema({
  categoryId:{
    type: Schema.Types.ObjectId,
    ref:"catagory"
  },
  name: {
    type: String,
    required: true
  }
},{
  timestamps: true
});

export const SubCatagroy = models.SubCatagroy || model('subcatagory', subCatagory);