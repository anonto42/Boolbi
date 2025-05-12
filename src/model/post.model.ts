import { model, models, Schema } from "mongoose";
import { IPost } from "../Interfaces/post.interface";
import { POST_TYPE } from "../enums/post.enum";

const jobPostSchema = new Schema<IPost>({
  title:{
    type: String,
    required: true,
  },
  coverImage:{
    type: String,
    required: true
  },
  postType:{
    type: String,
    required: true,
    enum: POST_TYPE
  },
  catagory:{
    type: String,
    required: true,
  },
  subCatagory:{
    type: String,
    requird: true
  },
  companyName:{
    type: String,
    required: true,
    trim: true
  },
  location:{
    type: String,
    required: true,
    trim: true
  },
  deadline:{
    type: String,
    required: true,
  }, 
  jobDescription:{
    type: String,
    required: true,
  },
  showcaseImages:[{
    type: String,
  }],
  creatorID:{
    type: Schema.Types.ObjectId,
    ref: "user"
  },
},{timestamps: true});
  
const Post = models.User || model('post', jobPostSchema);
export default Post;