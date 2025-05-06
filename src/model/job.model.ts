import { model, models, Schema } from "mongoose";

const jobPostSchema = new Schema({
    customerId: { type: Schema.Types.ObjectId, ref: 'User' },
    title: String,
    description: String,
    images: [String],
    categoryId: Schema.Types.ObjectId,
    location: String,
    status: { type: String, enum: ['open', 'closed', 'withdrawn'], default: 'open' },
    offers: [{ type: Schema.Types.ObjectId, ref: 'Offer' }],
    createdAt: { type: Date, default: Date.now }
  });
  
const Job = models.User || model('job', jobPostSchema);
export default Job;