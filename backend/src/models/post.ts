import { Schema, model, type Document } from "mongoose";

export interface IPost extends Document {
  title: string;
  imageUrl: string;
  content: string;
  creator: { name: string };
  createdAt?: Date;
  updatedAt?: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    content: { type: String, required: true },
    creator: {
      name: { type: String, required: true },
    },
  },
  { timestamps: true },
);

export default model<IPost>("Post", postSchema);
