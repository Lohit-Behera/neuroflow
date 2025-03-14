import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db";
import { Project } from "@/models/projectModel";

export async function GET() {
  try {
    await connectToDb();
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .select("_id name");
    if (!projects || projects.length === 0) {
      return NextResponse.json(
        { message: "Projects not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error getting projects:", error);
    return NextResponse.json(
      { message: "Error getting projects" },
      { status: 500 }
    );
  }
}
