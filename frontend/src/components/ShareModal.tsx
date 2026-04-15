import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { shareDoc, type DocPermission } from "../lib/api";
import { queryClient } from "../lib/queryClient";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Share2, Users, Mail } from "lucide-react";

type Collaborator = { user: string; permission: DocPermission };

export function ShareModal(props: {
  docId: string;
  collaborators?: Collaborator[];
}) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<DocPermission>("read");
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: () => shareDoc(props.docId, email, permission),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["doc", props.docId] });
      setEmail("");
      setPermission("read");
    },
  });

  const errorText = useMemo(() => {
    if (!mutation.isError) return null;
    return mutation.error instanceof Error ? mutation.error.message : "Share failed";
  }, [mutation.isError, mutation.error]);

  const collabs = props.collaborators ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
          {collabs.length > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-100 px-1.5 text-xs font-medium text-indigo-600">
              {collabs.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share document</DialogTitle>
          <DialogDescription>Invite people to read or edit this document.</DialogDescription>
        </DialogHeader>

        {/* Current collaborators */}
        {collabs.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              People with access
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {collabs.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-mono text-xs truncate max-w-[200px]">{c.user}</span>
                  </div>
                  <span
                    className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                      c.permission === "write"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {c.permission === "write" ? "Can edit" : "Read only"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invite new */}
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Invite someone
          </h4>
          <div>
            <label className="text-sm font-medium text-slate-700">Email address</label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Permission level</label>
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={permission === "read" ? "default" : "outline"}
                onClick={() => setPermission("read")}
              >
                Read only
              </Button>
              <Button
                type="button"
                size="sm"
                variant={permission === "write" ? "default" : "outline"}
                onClick={() => setPermission("write")}
              >
                Can edit
              </Button>
            </div>
          </div>
          {errorText && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{errorText}</p>
          )}
          {mutation.isSuccess && (
            <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
              Shared successfully!
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
          <Button
            type="button"
            disabled={!email.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Sharing…" : "Share"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
