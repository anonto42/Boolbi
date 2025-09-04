import { model, Schema } from "mongoose";

export interface IRating {
    customer: Schema.Types.ObjectId;
    provider: Schema.Types.ObjectId;
    post: Schema.Types.ObjectId;
    rating: number;
    comment: string;
}

const ratingSchema = new Schema<IRating>({
    customer: { type: Schema.Types.ObjectId, ref: "user" },
    provider: { type: Schema.Types.ObjectId, ref: "user" },
    post: { type: Schema.Types.ObjectId, ref: "post" },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
},{ timestamps: true });

export const RatingModel = model<IRating>("Rating", ratingSchema);