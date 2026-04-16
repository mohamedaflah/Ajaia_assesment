import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listDocs } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/ui/button";
import { DocumentList } from "../components/DocumentList";
import { UploadButton } from "../components/UploadButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { FileText, LogOut, Plus, Sparkles, FolderOpen, Zap } from "lucide-react";

function DashboardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-3">
          <div className="skeleton h-5 w-24" />
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-20 w-full" />
        </div>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const docsQuery = useQuery({ queryKey: ["docs"], queryFn: listDocs });
  const [logoutOpen, setLogoutOpen] = useState(false);

  const totalOwned = docsQuery.data?.owned.length ?? 0;

  return (
    <div className="min-h-screen bg-[#f0f0f3]">
      {/* Top accent band */}
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b-2 border-slate-900 bg-[#f7f7f9]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-slate-900 text-white border-2 border-slate-900">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 uppercase">DocEditor</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link to="/docs/new" className="gap-2">
                <Plus className="h-4 w-4" />
                New doc
              </Link>
            </Button>
            <UploadButton onUploaded={(docId) => navigate(`/docs/${docId}`)} />
            <Button variant="ghost" onClick={() => setLogoutOpen(true)} className="gap-2 text-slate-500">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Logout Modal */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leaving so soon? 👋</DialogTitle>
            <DialogDescription>
              You'll be signed out. Any unsaved changes may be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              Stay
            </Button>
            <Button
              variant="destructive"
              onClick={() => { setLogoutOpen(false); logout(); }}
            >
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Hero section */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Your workspace
            </h1>
            <Sparkles className="h-6 w-6 text-amber-400" />
          </div>
          <p className="text-sm text-slate-500 max-w-lg">
            Create, edit, and collaborate. Pick up where you left off or start something new.
          </p>
        </div>

        {/* Stats row */}
        {docsQuery.data && totalOwned > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-4 animate-fade-in">
            <div className="card-brutal p-4 accent-strip">
              <div className="flex items-center gap-2 mb-2 pl-3">
                <FolderOpen className="h-4 w-4 text-indigo-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">My docs</span>
              </div>
              <p className="text-3xl font-black text-slate-900 pl-3">{totalOwned}</p>
            </div>
            <div className="card-brutal p-4 accent-strip" style={{"--accent": "#10b981"} as any}>
              <div className="flex items-center gap-2 mb-2 pl-3">
                <Zap className="h-4 w-4 text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active</span>
              </div>
              <p className="text-3xl font-black text-slate-900 pl-3">{totalOwned}</p>
            </div>
          </div>
        )}

        {docsQuery.isLoading ? (
          <DashboardSkeleton />
        ) : docsQuery.isError ? (
          <div className="border-2 border-red-500 bg-red-50 px-4 py-6 text-center text-sm text-red-600 font-medium">
            {docsQuery.error instanceof Error ? docsQuery.error.message : "Failed to load"}
          </div>
        ) : !docsQuery.data ? (
          <div className="text-sm text-slate-400 text-center py-10">No data</div>
        ) : (
          <div>
            <DocumentList
              title="📄 My Documents"
              docs={docsQuery.data.owned}
              emptyText="No documents yet — hit 'New doc' to start writing!"
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-slate-200 py-6 text-center text-xs font-medium text-slate-400 uppercase tracking-widest">
        Built with ❤️ · DocEditor
      </footer>
    </div>
  );
}
