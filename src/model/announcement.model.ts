import { model, models, Schema } from "mongoose";
import { IAnnuncement } from "../Interfaces/announcement.interface";

const announcementSchema = new Schema<IAnnuncement>({
  title:{
    type: String,
    required: true
  },
  descriptions:{
    type: String,
    required: true
  },
  status:{
    type: String,
    enum: ["ACTIVE","DEACTIVE"],
    default: "ACTIVE"
  }
},{
  timestamps: true
});
  
const Announcement = models.User || model('announcement', announcementSchema);
export default Announcement;