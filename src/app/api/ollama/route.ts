import { NextRequest, NextResponse } from "next/server";
import { Ollama } from "@langchain/ollama";

export async function POST(req: NextRequest) {
  try {
    const { input, instructions, model, baseUrl } = await req.json();
    console.log(input, instructions, model, baseUrl);

    if (!input || !model || !baseUrl) {
      return NextResponse.json(
        { error: "Input, model, and baseUrl are required" },
        { status: 400 }
      );
    }

    const ollama = new Ollama({ baseUrl, model, keepAlive: 0 });

    // Combine instructions and input
    const fullPrompt = instructions ? `${instructions}\n\n${input}` : input;

    // Use streaming
    const stream = await ollama.stream(fullPrompt);

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          controller.enqueue(encoder.encode(chunk));
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
      { error: "Failed to get response from Ollama" },
      { status: 500 }
    );
  }
}
