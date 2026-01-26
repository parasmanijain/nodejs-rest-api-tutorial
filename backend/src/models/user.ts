import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  status: string;
  posts: Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "I am new!",
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

export default model<IUser>("User", userSchema);
