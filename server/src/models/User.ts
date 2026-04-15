import mongoose, { type InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };

export const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", userSchema);

