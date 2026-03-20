import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadMeeting } from "@/hooks/use-workspaces";

export function UploadModal({ isOpen, onClose, workspaceId }: { isOpen: boolean, onClose: () => void, workspaceId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const uploadMutation = useUploadMeeting();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      // Auto-fill the title with the filename (without extension) if title is empty
      if (!title) {
        setTitle(acceptedFiles[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'audio/*': [], 'video/*': [] },
    maxFiles: 1 
  });

  const handleUpload = () => {
    if (!file || !title) return;
    
    uploadMutation.mutate({ workspaceId, file, title }, {
      onSuccess: () => {
        setFile(null);
        setTitle("");
        onClose(); // Close the modal on success
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Meeting Recording</DialogTitle>
          <DialogDescription>
            Upload an audio or video file. Our AI will transcribe and analyze it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Meeting Title</Label>
            <Input 
              placeholder="e.g. Q3 Marketing Sync" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {!file ? (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Drag & drop your file here</p>
              <p className="text-xs text-muted-foreground mt-1">MP3, M4A, WAV, or MP4 up to 500MB</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/30">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <UploadCloud className="w-5 h-5 text-primary" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="shrink-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || !title || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Upload to AI
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}