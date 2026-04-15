import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { uploadFileToDoc } from "../lib/api";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";

export function UploadButton(props: { onUploaded: (docId: string) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const mutation = useMutation({
    mutationFn: async (file: File) => uploadFileToDoc(file),
    onSuccess: (doc) => props.onUploaded(doc._id),
  });

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,text/plain,text/markdown"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) mutation.mutate(f);
          e.currentTarget.value = "";
        }}
      />
      <Button
        variant="outline"
        disabled={mutation.isPending}
        onClick={() => inputRef.current?.click()}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        {mutation.isPending ? "Uploading…" : "Upload"}
      </Button>
    </>
  );
}
