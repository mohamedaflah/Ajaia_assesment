import mongoose, { type InferSchemaType } from "mongoose";

const collaboratorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    permission: { type: String, enum: ["read", "write"], required: true },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true }, // TipTap JSON
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    collaborators: { type: [collaboratorSchema], default: [] },
    shareToken: { type: String, default: null, index: true, sparse: true },
  },
  { timestamps: true }
);

export type Document = InferSchemaType<typeof documentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const DocumentModel =
  (mongoose.models.Document as mongoose.Model<Document>) ||
  mongoose.model<Document>("Document", documentSchema);
