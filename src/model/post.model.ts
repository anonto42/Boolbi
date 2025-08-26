import { model, models, Schema } from "mongoose";
import { IPost } from "../Interfaces/post.interface";

const jobPostSchema = new Schema<IPost>({
  projectName: {
    type: String,
    required: true,
  },
  offers: [{
    type: Schema.Types.ObjectId,
    ref: "offerForPost"
  }],
  coverImage: {
    type: String,
    required: true,
  },
  catagory: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  latLng: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
  deadline: {
    type: Date,
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  showcaseImages: [
    {
      type: String,
    },
  ],
  creatorID: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
}, { timestamps: true });

jobPostSchema.index({ latLng: "2dsphere" });

const Post = models.Post || model<IPost>("post", jobPostSchema);
export default Post;
