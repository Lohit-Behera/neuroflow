import { NextResponse, NextRequest } from "next/server";
import { Project } from "@/models/projectModel";
import { connectToDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, flow } = await req.json();
    if (!name || !flow) {
      return NextResponse.json(
        { message: "Name and flow are required" },
        { status: 400 }
      );
    }
    await connectToDb();
    if (await Project.findOne({ name })) {
      return NextResponse.json(
        { message: "Project already exists" },
        { status: 400 }
      );
    }
    const project = await Project.create({ name, flow });
    if (!project) {
      return NextResponse.json(
        { message: "Error creating project" },
        { status: 500 }
      );
    }
    return NextResponse.json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { message: "Error creating project" },
      { status: 500 }
    );
  }
}
