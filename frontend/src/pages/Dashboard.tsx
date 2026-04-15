import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { listDocs } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/ui/button";
import { DocumentList } from "../components/DocumentList";
import { UploadButton } from "../components/UploadButton";
import { FileText, LogOut, Plus } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-base font-bold text-slate-900">DocEditor</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link to="/docs/new" className="gap-2">
                <Plus className="h-4 w-4" />
                New doc
              </Link>
            </Button>
            <UploadButton onUploaded={(docId) => navigate(`/docs/${docId}`)} />
            <Button variant="ghost" onClick={logout} className="gap-2 text-slate-500">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-slate-900">Your Documents</h1>
          <p className="mt-1 text-sm text-slate-500">Create, edit, and share your documents.</p>
        </div>

        {docsQuery.isLoading ? (
          <DashboardSkeleton />
        ) : docsQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-500">
            {docsQuery.error instanceof Error ? docsQuery.error.message : "Failed to load"}
          </div>
        ) : !docsQuery.data ? (
          <div className="text-sm text-slate-400 text-center py-10">No data</div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            <DocumentList
              title="Owned"
              docs={docsQuery.data.owned}
              emptyText="No owned documents yet. Create your first one!"
            />
            <DocumentList
              title="Shared with me"
              docs={docsQuery.data.shared}
              emptyText="No shared documents yet."
            />
          </div>
        )}
      </main>
    </div>
  );
}
