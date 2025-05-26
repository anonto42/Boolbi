import { model, models, Schema } from "mongoose";
import { INotification } from "../Interfaces/notification.interface";

const notificationSchema = new Schema<INotification>({
  for:{
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  content: {
    type: String,
    required: true
  }
},{
  timestamps: true
});

const Notification = models.Notification || model<INotification>('notification', notificationSchema);
export default Notification;