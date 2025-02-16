import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StreamingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  output: string;
  title?: string;
}

export const StreamingDialog: React.FC<StreamingDialogProps> = ({
  open,
  onOpenChange,
  output,
  title = "Generating Response...",
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="p-4 whitespace-pre-wrap text-sm">
        {output || "Loading..."}
      </div>
    </DialogContent>
  </Dialog>
);
