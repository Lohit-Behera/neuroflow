import { NextResponse, NextRequest } from "next/server";
import { Output } from "@/models/outputModel";
import { connectToDb } from "@/lib/db";

export async function GET() {
  try {
    await connectToDb();
    const outputs = await Output.find().sort({ createdAt: -1 });
    return NextResponse.json(outputs);
  } catch (error) {
    console.error("Error getting outputs:", error);
    return NextResponse.error();
  }
}
