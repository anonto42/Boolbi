import { model, models, Schema } from "mongoose";

interface offerPost {
    postId: Schema.Types.ObjectId
    startDate: Date
    endDate: Date
    validFor: number
    myBudget: number
    by: Schema.Types.ObjectId
    description: string
    image: string[]
};

const offerPostSchema = new Schema<offerPost>({
    by: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: "post"
    },
    startDate: {
        type: Date,
        default: null
    },
    endDate: {
        type: Date,
        default: null
    },
    validFor: {
        type: Number,
        default: null
    },
    myBudget: {
        type: Number,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    image: {
        type: [String],
        default: []
    }
});

const OfferForPost = models.OfferForPost || model<offerPost>('offerForPost', offerPostSchema);
export default OfferForPost;