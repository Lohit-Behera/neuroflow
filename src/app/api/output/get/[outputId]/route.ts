import { Output } from "@/models/outputModel";
import { NextResponse, NextRequest } from "next/server";
import { connectToDb } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ outputId: string }> }
) {
  try {
    await connectToDb();
    const outputId = (await params).outputId;
    const output = await Output.findById(outputId);
    if (!output) {
      return NextResponse.json({ error: "Output not found" }, { status: 404 });
    }
    return NextResponse.json(output);
  } catch (error) {
    console.error("Error getting output:", error);
    return NextResponse.error();
  }
}
