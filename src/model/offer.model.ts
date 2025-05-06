import { model, models, Schema } from "mongoose";

const offerSchema = new Schema({
    jobId: { type: Schema.Types.ObjectId, ref: 'JobPost' },
    providerId: { type: Schema.Types.ObjectId, ref: 'User' },
    files: [String],
    price: Number,
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'withdrawn'], default: 'pending' },
    message: String
  });

const Offer = models.User || model('offer', offerSchema);
export default Offer;