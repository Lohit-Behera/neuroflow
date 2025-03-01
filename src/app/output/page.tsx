"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Eye,
  Download,
  Calendar,
  Loader2,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

// Updated interface for saved workflow outputs with multiple images
interface SavedOutput {
  id: string;
  name: string;
  timestamp: number;
  output: string;
  images: Record<string, string>; // Changed from single image to multiple images
}

const SavedOutputsViewer: React.FC = () => {
  const [savedOutputs, setSavedOutputs] = useState<SavedOutput[]>([]);
  const [selectedOutput, setSelectedOutput] = useState<SavedOutput | null>(
    null
  );
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved outputs from localStorage on component mount
  useEffect(() => {
    try {
      const savedOutputsJson = localStorage.getItem("savedWorkflowOutputs");
      if (savedOutputsJson) {
        const outputs = JSON.parse(savedOutputsJson);

        // Handle migration from old format (with single image) to new format (with images object)
        const migratedOutputs = outputs.map((output: any) => {
          if (output.image !== undefined && !output.images) {
            // Convert old single image format to new multiple images format
            return {
              ...output,
              images: output.image ? { main: output.image } : {},
              image: undefined,
            };
          }
          return output;
        });

        setSavedOutputs(migratedOutputs);
      }
    } catch (error) {
      console.error("Error loading saved outputs:", error);
      toast.error("Failed to load saved outputs");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleViewOutput = (output: SavedOutput) => {
    setSelectedOutput(output);
    setViewDialogOpen(true);
  };

  const handleDeleteOutput = (id: string) => {
    try {
      const updatedOutputs = savedOutputs.filter((output) => output.id !== id);
      localStorage.setItem(
        "savedWorkflowOutputs",
        JSON.stringify(updatedOutputs)
      );
      setSavedOutputs(updatedOutputs);

      // If currently viewing the deleted output, close the dialog
      if (selectedOutput?.id === id) {
        setViewDialogOpen(false);
      }

      toast.success("Output deleted successfully");
    } catch (error) {
      console.error("Error deleting output:", error);
      toast.error("Failed to delete output");
    }
  };

  const handleDownloadImage = (imageUrl: string, imageName: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${selectedOutput?.name.replace(
      /\s+/g,
      "-"
    )}-${imageName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const parseStreamingOutput = (output: string) => {
    if (!output) return [];

    const sections: Array<{
      nodeId: string;
      title: string;
      content: string;
      nodeType: "Ollama" | "SDForge" | "Other";
    }> = [];

    // Split by node execution markers
    const nodeOutputs = output.split(/\nExecuting (Ollama|SDForge) Node: /);

    // First item might be empty or contain initial output
    if (nodeOutputs[0].trim()) {
      sections.push({
        nodeId: "initial",
        title: "Initialization",
        content: nodeOutputs[0].trim(),
        nodeType: "Other",
      });
    }

    // Process node outputs
    for (let i = 1; i < nodeOutputs.length; i += 2) {
      const nodeType = nodeOutputs[i] as "Ollama" | "SDForge";
      const content = nodeOutputs[i + 1] || "";

      // Extract node ID from the content
      const idMatch = content.match(/^([a-zA-Z0-9-_]+)/);
      const nodeId = idMatch ? idMatch[1] : "unknown";

      // Remove the completion message if it's in this section
      const cleanContent = content.replace(/\n\n🚀 Execution Complete!/g, "");

      sections.push({
        nodeId: nodeId,
        title: `${nodeType} Node: ${nodeId}`,
        content: cleanContent.trim(),
        nodeType: nodeType,
      });
    }

    return sections;
  };

  // Get thumbnail image for card display (first image if multiple exist)
  const getThumbnailImage = (output: SavedOutput) => {
    if (!output.images || Object.keys(output.images).length === 0) {
      return null;
    }

    // Return the first image in the images object
    return Object.values(output.images)[0];
  };

  // Count images for a given output
  const getImageCount = (output: SavedOutput) => {
    return output.images ? Object.keys(output.images).length : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container h-full mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Saved Workflow Outputs</h2>
      </div>

      {savedOutputs.length === 0 ? (
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No saved outputs</h3>
          <p className="text-muted-foreground">
            Run a workflow and save the results to see them here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savedOutputs.map((output) => {
            const thumbnailImage = getThumbnailImage(output);
            const imageCount = getImageCount(output);

            return (
              <div
                key={output.id}
                className="bg-card rounded-lg border shadow-sm overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold truncate">{output.name}</h3>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteOutput(output.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground mt-1 mb-3">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(output.timestamp)}
                  </div>

                  <div className="flex gap-2 items-center justify-between mt-4">
                    {thumbnailImage ? (
                      <div className="w-16 h-16 relative rounded overflow-hidden border">
                        <Image
                          src={thumbnailImage}
                          alt={output.name}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                        {imageCount > 1 && (
                          <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
                            +{imageCount - 1}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center bg-muted rounded">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    <Button onClick={() => handleViewOutput(output)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedOutput && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{selectedOutput.name}</DialogTitle>
              <DialogDescription>
                Saved on {formatDate(selectedOutput.timestamp)}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                {parseStreamingOutput(selectedOutput.output).map(
                  (section, index) => {
                    const sectionImage =
                      selectedOutput.images?.[section.nodeId];

                    return (
                      <div key={index} className="bg-muted/30 rounded-lg p-4">
                        <h3 className="text-sm font-semibold mb-2">
                          {section.title}
                        </h3>
                        <pre className="text-sm whitespace-pre-wrap">
                          {section.content}
                        </pre>

                        {/* Display image if this section has one */}
                        {section.nodeType === "SDForge" && sectionImage && (
                          <div className="mt-4 flex flex-col items-center">
                            <Image
                              src={sectionImage}
                              width={512}
                              height={512}
                              alt={`${section.title} result`}
                              className="rounded-lg shadow-sm max-w-full"
                            />
                            <Button
                              variant="outline"
                              className="mt-2"
                              onClick={() =>
                                handleDownloadImage(
                                  sectionImage,
                                  section.nodeId
                                )
                              }
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Image
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => handleDeleteOutput(selectedOutput.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SavedOutputsViewer;
