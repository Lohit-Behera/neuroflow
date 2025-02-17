"use client";
import React from "react";
import dynamic from "next/dynamic";
import { SidebarTrigger } from "./ui/sidebar";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchOllamaModels } from "@/lib/features/ollamaSlice";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setBaseUrl, setUse } from "@/lib/features/baseSlice";
import {
  fetchSamplers,
  fetchSchedulers,
  fetchSdModels,
} from "@/lib/features/sdSlice";
import { Checkbox } from "@/components/ui/checkbox";

const ModeToggle = dynamic(
  () => import("@/components/mode-toggle").then((mod) => mod.ModeToggle),
  {
    ssr: false,
  }
);

function Header() {
  const dispatch = useAppDispatch();
  const ollama = useAppSelector((state) => state.base.ollama);
  const sdforge = useAppSelector((state) => state.base.sdforge);
  const [open, setOpen] = useState(true);
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState(ollama.baseUrl);
  const [sdforgeBaseUrl, setSdforgeBaseUrl] = useState(sdforge.baseUrl);
  const [useOllama, setUseOllama] = useState(ollama.useOllama);
  const [useSdforge, setUseSdforge] = useState(sdforge.useSdforge);

  useEffect(() => {
    if (!open) {
      if (ollama.useOllama) {
        dispatch(fetchOllamaModels());
      }
      if (sdforge.useSdforge) {
        dispatch(fetchSdModels());
        dispatch(fetchSamplers());
        dispatch(fetchSchedulers());
      }
    }
  }, [open]);

  const handleSave = () => {
    dispatch(setBaseUrl({ ollamaBaseUrl, sdforgeBaseUrl }));
    dispatch(setUse({ useOllama, useSdforge }));
    setOpen(false);
  };
  return (
    <>
      <header className="z-20 w-full sticky top-0 p-2 backdrop-blur bg-background">
        <nav className="flex justify-between space-x-2">
          <SidebarTrigger />
          <div className="flex items-center justify-center space-x-2">
            <Button onClick={() => setOpen(true)} variant="outline">
              Set Details
            </Button>
            <ModeToggle />
          </div>
        </nav>
      </header>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              Set Base URL for Ollama and Stable Diffusion
            </DialogTitle>
            <div className="grid gap-4 py-4">
              <h3 className="text-lg font-semibold">Ollama</h3>
              <div className="grid gap-2">
                <Label htmlFor="ollamaBaseUrl">Ollama Base URL</Label>
                <Input
                  id="ollamaBaseUrl"
                  placeholder="http://localhost:8000"
                  value={ollamaBaseUrl}
                  onChange={(e) => setOllamaBaseUrl(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-ollama"
                  checked={useOllama}
                  onCheckedChange={(e: boolean) => setUseOllama(e)}
                />
                <Label htmlFor="use-ollama">Use Ollama</Label>
              </div>
              <h3 className="text-lg font-semibold">Stable Diffusion</h3>
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-sd"
                  checked={useSdforge}
                  onCheckedChange={(e: boolean) => setUseSdforge(e)}
                />
                <Label htmlFor="use-sd">Use Stable Diffusion</Label>
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
    </>
  );
}

export default Header;
