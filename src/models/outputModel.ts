import mongoose from "mongoose";

export interface IOutput {
  _id: mongoose.Types.ObjectId;
  name: string;
  output: string;
  images: Record<string, string> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const outputSchema = new mongoose.Schema<IOutput>(
  {
    name: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      required: true,
    },
    images: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

export const Output =
  mongoose.models.Output || mongoose.model<IOutput>("Output", outputSchema);
