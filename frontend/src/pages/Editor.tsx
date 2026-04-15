import { useMutation, useQuery } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createDoc, deleteDoc, getDoc, updateDoc } from "../lib/api";
import { queryClient } from "../lib/queryClient";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { EditorToolbar } from "../components/EditorToolbar";
import { TipTapEditor } from "../components/TipTapEditor";
import { ShareModal } from "../components/ShareModal";
import { ArrowLeft, Trash2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

/* ── Constants ───────────────────────────────────────────── */

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };
const MAX_TITLE_LENGTH = 60;

/* ── Save Indicator ──────────────────────────────────────── */

function SaveIndicator({ status }: { status: string }) {
  const color =
    status === "Saved"
      ? "bg-emerald-400"
      : status === "Saving…"
        ? "bg-blue-400"
        : status === "Unsaved"
          ? "bg-amber-400"
          : status === "Draft"
            ? "bg-violet-400"
            : "bg-slate-300";

  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${color} ${status === "Saving…" ? "animate-pulse" : ""}`}
      />
      {status}
    </div>
  );
}

/* ── Editor Skeleton ─────────────────────────────────────── */

function EditorSkeleton() {
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="skeleton h-10 w-full rounded-xl" />
      <div className="skeleton h-[60vh] w-full rounded-xl" />
    </div>
  );
}

/* ── Editor Page ─────────────────────────────────────────── */

export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isNew = id === "new";

  /* ── Fetch existing doc ────────────────────────────────── */
  const docId = id && id !== "new" ? id : null;
  const docQuery = useQuery({
    queryKey: ["doc", docId],
    queryFn: () => getDoc(docId as string),
    enabled: !!docId,
  });

  /* ── Local state ───────────────────────────────────────── */
  const [title, setTitle] = useState(isNew ? "Untitled" : "");
  const [content, setContent] = useState<JSONContent>(EMPTY_DOC);
  const lastSavedRef = useRef<{ title: string; contentStr: string } | null>(null);

  // Keep latest values in refs so the save function always reads fresh data
  const latestTitleRef = useRef(title);
  const latestContentRef = useRef(content);
  latestTitleRef.current = title;
  latestContentRef.current = content;

  // Sync state when existing doc data arrives
  useEffect(() => {
    if (docQuery.data) {
      setTitle(docQuery.data.title);
      setContent(docQuery.data.content);
      lastSavedRef.current = {
        title: docQuery.data.title,
        contentStr: JSON.stringify(docQuery.data.content),
      };
    }
  }, [docQuery.data]);

  /* ── Draft → Create on first edit (for new docs) ───────── */
  const creatingRef = useRef(false);

  const createAndSave = useCallback(
    (draftTitle: string, draftContent: JSONContent) => {
      if (creatingRef.current) return;
      creatingRef.current = true;

      createDoc(draftTitle || "Untitled", draftContent).then((doc) => {
        queryClient.invalidateQueries({ queryKey: ["docs"] });
        lastSavedRef.current = {
          title: doc.title,
          contentStr: JSON.stringify(doc.content),
        };
        // Navigate replaces /docs/new with the real id
        navigate(`/docs/${doc._id}`, { replace: true });
      }).catch(() => {
        creatingRef.current = false;
      });
    },
    [navigate]
  );

  /* ── Save existing doc via refs ────────────────────────── */
  const docIdRef = useRef(docId);
  docIdRef.current = docId;

  const doSave = useCallback(() => {
    const currentDocId = docIdRef.current;
    if (!currentDocId) return;
    const last = lastSavedRef.current;
    const nextTitle = latestTitleRef.current;
    const nextContent = latestContentRef.current;
    const nextStr = JSON.stringify(nextContent);
    const titleChanged = !last || last.title !== nextTitle;
    const contentChanged = !last || last.contentStr !== nextStr;
    if (!titleChanged && !contentChanged) return;
    const payload: any = {};
    if (titleChanged) payload.title = nextTitle;
    if (contentChanged) payload.content = nextContent;

    updateDoc(currentDocId, payload).then((doc) => {
      lastSavedRef.current = { title: doc.title, contentStr: JSON.stringify(doc.content) };
      queryClient.invalidateQueries({ queryKey: ["docs"] });
      queryClient.setQueryData(["doc", currentDocId], doc);
    }).catch(() => {
      // silently fail, will retry on next debounce
    });
  }, []);

  /* ── Debounced auto-save (800ms) ───────────────────────── */
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // If we're still on /docs/new, create the doc first
      if (!docIdRef.current && !creatingRef.current) {
        createAndSave(latestTitleRef.current, latestContentRef.current);
      } else {
        doSave();
      }
    }, 800);
  }, [doSave, createAndSave]);

  /* ── Immediate save (for blur / beforeunload) ──────────── */
  const flushSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!docIdRef.current && !creatingRef.current) {
      // Check if user actually typed something (not just an empty doc)
      const hasContent = JSON.stringify(latestContentRef.current) !== JSON.stringify(EMPTY_DOC);
      const hasTitle = latestTitleRef.current && latestTitleRef.current !== "Untitled";
      if (hasContent || hasTitle) {
        createAndSave(latestTitleRef.current, latestContentRef.current);
      }
    } else {
      doSave();
    }
  }, [doSave, createAndSave]);

  /* ── Track save status ─────────────────────────────────── */
  const [saveStatus, setSaveStatus] = useState<"" | "Saving…" | "Saved" | "Unsaved" | "Draft">("");

  useEffect(() => {
    if (isNew && !docId) {
      setSaveStatus("Draft");
      return;
    }
    const last = lastSavedRef.current;
    if (!last) {
      setSaveStatus("");
      return;
    }
    const dirty = last.title !== title || last.contentStr !== JSON.stringify(content);
    setSaveStatus(dirty ? "Unsaved" : "Saved");
  }, [title, content, isNew, docId]);

  /* ── Save on page leave ────────────────────────────────── */
  useEffect(() => {
    const handleBeforeUnload = () => flushSave();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      flushSave();
    };
  }, [flushSave]);

  /* ── Delete ────────────────────────────────────────────── */
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!docId) throw new Error("Missing document id");
      return deleteDoc(docId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["docs"] });
      navigate("/dashboard", { replace: true });
    },
  });

  /* ── Main render ───────────────────────────────────────── */
  const showEditor = isNew || (!docQuery.isLoading && !docQuery.isError);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b-2 border-slate-900 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button asChild variant="ghost" size="icon">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
              <div className="relative">
                <Input
                  value={title}
                  maxLength={MAX_TITLE_LENGTH}
                  onChange={(e) => {
                    const val = e.target.value.slice(0, MAX_TITLE_LENGTH);
                    setTitle(val);
                    scheduleSave();
                  }}
                  onBlur={flushSave}
                  placeholder="Give your doc a name…"
                  className="h-8 w-[min(320px,50vw)] border-transparent bg-transparent font-medium focus-visible:border-slate-200 focus-visible:bg-white pr-12"
                />
                {title.length > MAX_TITLE_LENGTH - 15 && (
                  <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium ${
                    title.length >= MAX_TITLE_LENGTH ? "text-red-500" : "text-slate-400"
                  }`}>
                    {title.length}/{MAX_TITLE_LENGTH}
                  </span>
                )}
              </div>
            </div>
            <SaveIndicator status={saveStatus} />
          </div>
          <div className="flex items-center gap-2">
            {docId && docQuery.data ? (
              <ShareModal
                docId={docId}
                shareToken={docQuery.data.shareToken}
              />
            ) : null}
            {docId ? (
              <Button
                variant="ghost"
                size="icon"
                disabled={deleteMutation.isPending}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
            {isNew && (
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400"
                onClick={() => navigate("/dashboard")}
              >
                Discard
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-6">
        {!isNew && docQuery.isLoading ? (
          <EditorSkeleton />
        ) : !isNew && docQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-500">
            {docQuery.error instanceof Error ? docQuery.error.message : "Failed to load"}
          </div>
        ) : showEditor ? (
          <div className="space-y-3 animate-fade-in">
            <div className="sticky top-[57px] z-20">
              <EditorToolbar editor={editorInstance} />
            </div>
            <TipTapEditor
              initialContent={content}
              onReady={(e) => setEditorInstance(e)}
              onUpdate={(next) => {
                setContent(next);
                scheduleSave();
              }}
            />
          </div>
        ) : null}
      </main>

      {/* Delete confirmation modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this document? 🗑️</DialogTitle>
            <DialogDescription>
              This will permanently remove "{title || 'Untitled'}" and all its content. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                setDeleteOpen(false);
                deleteMutation.mutate();
              }}
            >
              {deleteMutation.isPending ? "Deleting…" : "Yes, delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
