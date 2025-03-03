import mongoose, { Schema, models, model } from "mongoose";
import { FlowState } from "@/types/flowTypes";

interface IProject {
  _id: mongoose.Types.ObjectId;
  name: string;
  flow: FlowState;
  createdAt?: Date;
  updatedAt?: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
    },
    flow: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Project =
  models.Project || model<IProject>("Project", projectSchema);
