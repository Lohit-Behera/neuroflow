import { NextResponse, NextRequest } from "next/server";
import { Project } from "@/models/projectModel";
import { connectToDb } from "@/lib/db";

export async function GET({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  try {
    await connectToDb();
    const projectId = (await params).projectId;
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error("Error getting project:", error);
    return NextResponse.json(
      { message: "Error getting project" },
      { status: 500 }
    );
  }
}
