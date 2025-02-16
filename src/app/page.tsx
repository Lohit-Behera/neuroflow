"use client";

import Flow from "@/components/Flow";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchOllamaModels } from "@/lib/features/ollamaSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setBaseUrl } from "@/lib/features/baseSlice";
import { ReactFlowProvider } from "@xyflow/react";
import {
  fetchSamplers,
  fetchSchedulers,
  fetchSdModels,
} from "@/lib/features/sdSlice";

function Home() {
  const dispatch = useAppDispatch();
  const ollama = useAppSelector((state) => state.base.ollama);
  const sdforge = useAppSelector((state) => state.base.sdforge);
  const [open, setOpen] = useState(true);
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState(ollama.baseUrl);
  const [sdforgeBaseUrl, setSdforgeBaseUrl] = useState(sdforge.baseUrl);

  useEffect(() => {
    if (!open) {
      dispatch(fetchOllamaModels());
      dispatch(fetchSdModels());
      dispatch(fetchSamplers());
      dispatch(fetchSchedulers());
    }
  }, [open]);

  const handleSave = () => {
    dispatch(setBaseUrl({ ollamaBaseUrl, sdforgeBaseUrl }));
    setOpen(false);
  };
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Set Base URL for Ollama and Stable Diffusion
            </DialogTitle>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="ollamaBaseUrl">Ollama Base URL</Label>
                <Input
                  id="ollamaBaseUrl"
                  placeholder="http://localhost:8000"
                  value={ollamaBaseUrl}
                  onChange={(e) => setOllamaBaseUrl(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sdforgeBaseUrl">
                  Stable Diffusion Base URL
                </Label>
                <Input
                  id="sdforgeBaseUrl"
                  placeholder="http://localhost:8000"
                  value={sdforgeBaseUrl}
                  onChange={(e) => setSdforgeBaseUrl(e.target.value)}
                />
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button type="submit" onClick={handleSave}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </>
  );
}

export default Home;

// "use client";

// import { useState } from "react";

// export default function Home() {
//   const [input, setInput] = useState<string>("");
//   const [instructions, setInstructions] = useState<string>("");
//   const [model, setModel] = useState<string>("llama3");
//   const [baseUrl, setBaseUrl] = useState<string>("http://localhost:11434");
//   const [response, setResponse] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setResponse("");

//     try {
//       const res = await fetch("/api/ollama", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ input, instructions, model, baseUrl }),
//       });

//       if (!res.body) throw new Error("No response body");

//       const reader = res.body.getReader();
//       const decoder = new TextDecoder();

//       while (true) {
//         const { value, done } = await reader.read();
//         if (done) break;
//         setResponse((prev) => prev + decoder.decode(value));
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       setResponse("An error occurred while fetching the response.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-lg mx-auto text-center p-6">
//       <h1 className="text-2xl font-bold">Ollama AI Chat (With Instructions)</h1>
//       <form onSubmit={handleSubmit} className="mt-4 space-y-4">
//         <input
//           type="text"
//           value={model}
//           onChange={(e) => setModel(e.target.value)}
//           className="w-full p-2 border rounded"
//           placeholder="Enter model name (e.g., llama3)"
//         />
//         <input
//           type="text"
//           value={baseUrl}
//           onChange={(e) => setBaseUrl(e.target.value)}
//           className="w-full p-2 border rounded"
//           placeholder="Enter base URL (e.g., http://localhost:11434)"
//         />
//         <textarea
//           value={instructions}
//           onChange={(e) => setInstructions(e.target.value)}
//           rows={3}
//           className="w-full p-2 border rounded"
//           placeholder="Enter instructions (optional, e.g., 'Answer in a formal tone')"
//         />
//         <textarea
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           rows={4}
//           className="w-full p-2 border rounded"
//           placeholder="Enter your message..."
//         />
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
//         >
//           {loading ? "Loading..." : "Submit"}
//         </button>
//       </form>
//       <div className="mt-4 p-4 border rounded min-h-[100px] text-left">
//         <h2 className="font-semibold">Response:</h2>
//         <p>{response}</p>
//       </div>
//     </div>
//   );
// }
