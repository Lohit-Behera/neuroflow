import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";
import pdf from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const input = formData.get("input") as string;
    const instructions = formData.get("instructions") as string;
    const model = formData.get("model") as string;
    const baseUrl = formData.get("baseUrl") as string;
    const file = formData.get("file") as File | null;
    const sdImage = formData.get("sdImage") as string | null;
    console.log(file);

    if (!model || !baseUrl) {
      return NextResponse.json(
        { error: "Model, and baseUrl are required" },
        { status: 400 }
      );
    }

    // Base prompt
    let prompt = instructions ? `${instructions}\n\n${input}` : input;
    let images: string[] | undefined = undefined;

    // Process file if present
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type;

      if (mimeType.startsWith("image/")) {
        // Convert image to base64
        const base64Image = buffer.toString("base64");
        images = [base64Image];
      } else if (mimeType === "application/pdf") {
        // Extract text from PDF using pdf-parse
        const pdfData = await pdf(buffer);
        prompt += `pdf content:\n${pdfData.text}`;
      } else if (mimeType.startsWith("text/")) {
        // Convert text file to string
        prompt += `text content:\n${buffer.toString("utf-8")}`;
      }
    }

    if (sdImage) {
      images = [sdImage];
    }

    // Send request to Ollama
    const responseStream = await ollama.generate({
      model,
      prompt,
      images: images || undefined,
      stream: true,
      keep_alive: 0,
    });

    // Stream the response back to the client
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const response of responseStream) {
          if (response.response) {
            controller.enqueue(encoder.encode(response.response)); // Extract and stream text response
          }
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Ollama API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
