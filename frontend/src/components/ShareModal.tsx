import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toggleShare } from "../lib/api";
import { queryClient } from "../lib/queryClient";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Share2, Link2, Copy, Check, Unlink } from "lucide-react";

export function ShareModal(props: {
  docId: string;
  shareToken?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: () => toggleShare(props.docId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["doc", props.docId] });
    },
  });

  const shareToken = props.shareToken;
  const shareUrl = shareToken
    ? `${window.location.origin}/shared/${shareToken}`
    : null;

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share document</DialogTitle>
          <DialogDescription>
            Generate a public link anyone can use to view this document.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {shareUrl ? (
            <>
              {/* Active link */}
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Public link active</span>
              </div>

              <div className="flex items-stretch border-2 border-slate-300 bg-slate-50">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-transparent px-3 py-2 text-sm font-mono text-slate-700 outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="border-l-2 border-slate-300 px-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors"
                  title="Copy link"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-slate-600">Copy</span>
                    </>
                  )}
                </button>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2 text-red-500 hover:text-red-600 hover:border-red-300"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                <Unlink className="h-4 w-4" />
                {mutation.isPending ? "Revoking…" : "Revoke link"}
              </Button>
            </>
          ) : (
            <>
              {/* No link yet */}
              <div className="border-2 border-dashed border-slate-300 bg-[#f7f7f9] px-4 py-6 text-center">
                <Link2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  No public link yet. Generate one to share this document.
                </p>
              </div>

              <Button
                className="w-full gap-2"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                <Link2 className="h-4 w-4" />
                {mutation.isPending ? "Generating…" : "Generate public link"}
              </Button>
            </>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
