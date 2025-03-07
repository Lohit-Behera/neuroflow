import { Output } from "@/models/outputModel";
import { NextResponse, NextRequest } from "next/server";
import { connectToDb } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ outputId: string }> }
) {
  try {
    await connectToDb();
    const outputId = (await params).outputId;
    const output = await Output.findByIdAndDelete(outputId);
    return NextResponse.json({ message: "Output deleted successfully" });
  } catch (error) {
    console.error("Error getting output:", error);
    return NextResponse.error();
  }
}
