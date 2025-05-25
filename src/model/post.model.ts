import { model, models, Schema } from "mongoose";
import { IPost, Reating } from "../Interfaces/post.interface";

const jobPostSchema = new Schema<IPost>({
  title: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    required: true,
  },
  catagory: {
    type: String,
    required: true,
  },
  subCatagory: {
    type: String,
    required: true, // Fixed typo from "requird"
  },
  companyName: {
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
    type: String,
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
