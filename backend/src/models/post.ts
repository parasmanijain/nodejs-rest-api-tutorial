import { Schema, model, Document, Types } from "mongoose";

export interface IPost extends Document {
  title: string;
  imageUrl: string;
  content: string;
  creator: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default model<IPost>("Post", postSchema);
