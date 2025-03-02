import { NextResponse, NextRequest } from "next/server";
import { Output } from "@/models/outputModel";
import { connectToDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectToDb();
    const { name, output, images } = await req.json();
    const createOutput = await Output.create({ name, output, images });
    const newOutput = await Output.findById(createOutput._id);
    if (!newOutput) {
      return NextResponse.error();
    }
    return NextResponse.json({
      message: "Output saved successfully",
      output: newOutput,
    });
  } catch (error) {
    console.error("Error saving output:", error);
    return NextResponse.error();
  }
}
