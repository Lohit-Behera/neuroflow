"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { FileStack, Save, Settings2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { SidebarGroup, SidebarMenuButton } from "@/components/ui/sidebar";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchOllamaModels } from "@/lib/features/ollamaSlice";
import {
  fetchSamplers,
  fetchSchedulers,
  fetchSdModels,
} from "@/lib/features/sdSlice";
import { setBaseUrl, setUse } from "@/lib/features/baseSlice";
import { fetchCreateProject } from "@/lib/features/projectSlice";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PopoverClose } from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteAll } from "@/lib/features/flowSlice";
import { usePathname } from "next/navigation";

function NavSetting() {
  const router = useRouter();
  const pathName = usePathname();

  const dispatch = useAppDispatch();
  const ollama = useAppSelector((state) => state.base.ollama);
  const sdforge = useAppSelector((state) => state.base.sdforge);
  const ollamaStatus = useAppSelector((state) => state.ollama.modelsStatus);
  const modelsStatus = useAppSelector((state) => state.sd.modelsStatus);
  const samplersStatus = useAppSelector((state) => state.sd.samplersStatus);
  const schedulersStatus = useAppSelector((state) => state.sd.schedulersStatus);
  const flowState = useAppSelector((state) => state.flow);

  const [open, setOpen] = useState(true);
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState(ollama.baseUrl);
  const [sdforgeBaseUrl, setSdforgeBaseUrl] = useState(sdforge.baseUrl);
  const [useOllama, setUseOllama] = useState(ollama.useOllama);
  const [useSdforge, setUseSdforge] = useState(sdforge.useSdforge);

  const [errorOllama, setErrorOllama] = useState(false);
  const [errorSdforge, setErrorSdforge] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [name, setName] = useState("");

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
  }, [open, dispatch, ollama.useOllama, sdforge.useSdforge]);

  useEffect(() => {
    let newUseOllama = useOllama;
    let newUseSdforge = useSdforge;
    let hasError = false;

    if (ollamaStatus === "failed") {
      setErrorOllama(true);
      newUseOllama = false;
      hasError = true;
    }
    if (
      modelsStatus === "failed" ||
      samplersStatus === "failed" ||
      schedulersStatus === "failed"
    ) {
      setErrorSdforge(true);
      newUseSdforge = false;
      hasError = true;
    }

    if (hasError) {
      dispatch(setUse({ useOllama: newUseOllama, useSdforge: newUseSdforge }));
      setErrorOpen(true);
    }
  }, [
    ollamaStatus,
    modelsStatus,
    samplersStatus,
    schedulersStatus,
    dispatch,
    useOllama,
    useSdforge,
  ]);

  const handleSave = () => {
    dispatch(setBaseUrl({ ollamaBaseUrl, sdforgeBaseUrl }));
    dispatch(setUse({ useOllama, useSdforge }));
    setOpen(false);
  };

  const handleSaveProject = () => {
    const createProjectPromise = dispatch(
      fetchCreateProject({ name, flow: flowState })
    ).unwrap();
    toast.promise(createProjectPromise, {
      loading: "Saving project...",
      success: () => {
        setName("");
        return "Project saved successfully";
      },
      error: "Failed to save project",
    });
  };
  return (
    <>
      <SidebarGroup>
        <SidebarMenuButton
          tooltip={"Output"}
          onClick={() => router.push("/output")}
        >
          <FileStack />
          Out Puts
        </SidebarMenuButton>
        <Popover>
          <PopoverTrigger asChild>
            <SidebarMenuButton disabled={pathName !== "/"}>
              <Save />
              Save WorkFlow
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent>
            <div className="grid gap-4">
              <Label htmlFor="project-name">WorkFlow Name</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <PopoverClose asChild>
                <Button onClick={handleSaveProject}>Save</Button>
              </PopoverClose>
            </div>
          </PopoverContent>
        </Popover>
        <SidebarMenuButton onClick={() => setOpen(true)}>
          <Settings2 />
          Settings
        </SidebarMenuButton>
        <SidebarMenuButton
          disabled={pathName !== "/"}
          onClick={() => dispatch(deleteAll())}
        >
          <Trash2 />
          Delete All Nodes
        </SidebarMenuButton>
      </SidebarGroup>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={() => setOpen(false)}>
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

      {/* Error Dialog */}
      <Dialog open={errorOpen} onOpenChange={() => setErrorOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription className="gap-2">
              {errorOllama && (
                <p>
                  Ollama Error:{" "}
                  <b>Check Ollama is running and Base URL and try again</b>
                </p>
              )}
              {errorSdforge && (
                <p>
                  Stable Diffusion Error:{" "}
                  <b>
                    Check Stable Diffusion is running and Base URL and try again
                  </b>
                </p>
              )}
              <p>
                For try again, click on <b>Setting</b>
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default NavSetting;
