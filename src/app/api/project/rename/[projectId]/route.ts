import { NextResponse, NextRequest } from "next/server";
import { Project } from "@/models/projectModel";
import { connectToDb } from "@/lib/db";
import mongoose from "mongoose";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const projectId = (await params).projectId;
    const { newWorkflowName } = await req.json();
    await connectToDb();

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    project.name = newWorkflowName;
    await project.save();

    return NextResponse.json({ message: "Project renamed successfully" });
  } catch (error) {
    console.error("Error getting project:", error);
    return NextResponse.json(
      { message: "Error getting project" },
      { status: 500 }
    );
  }
}
