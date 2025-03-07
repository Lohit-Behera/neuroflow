import { NextResponse, NextRequest } from "next/server";
import { Project } from "@/models/projectModel";
import { connectToDb } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string }>;
  }
) {
  try {
    const projectId = (await params).projectId;
    console.log(projectId);

    await connectToDb();

    await Project.findByIdAndDelete(projectId);
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error getting project:", error);
    return NextResponse.json(
      { message: "Error getting project" },
      { status: 500 }
    );
  }
}
