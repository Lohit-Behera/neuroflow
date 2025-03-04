import { NextResponse, NextRequest } from "next/server";
import { Project } from "@/models/projectModel";
import { connectToDb } from "@/lib/db";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const projectId = (await params).projectId;
    await connectToDb();

    const project = await Project.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(projectId),
        },
      },
      {
        $addFields: {
          allTypes: {
            $map: {
              input: "$flow.nodes",
              as: "type",
              in: "$$type.type",
            },
          },
        },
      },
      {
        $addFields: {
          types: {
            $setUnion: ["$allTypes"],
          },
        },
      },
      {
        $project: {
          allTypes: 0,
          __v: 0,
        },
      },
    ]);
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(project[0]);
  } catch (error) {
    console.error("Error getting project:", error);
    return NextResponse.json(
      { message: "Error getting project" },
      { status: 500 }
    );
  }
}
