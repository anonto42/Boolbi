import { Schema, model } from "mongoose";
import { IUser } from "../Interfaces/User.interface";
import { USER_ROLES } from "../enums/user.enums";

// Define the schema
const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "USER",
      required: true
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Indexing for performance (optional)
UserSchema.index({ email: 1 });

export const User = model<IUser>("User", UserSchema);
