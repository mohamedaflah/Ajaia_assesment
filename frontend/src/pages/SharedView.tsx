import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { getSharedDoc } from "../lib/api";
import { TipTapEditor } from "../components/TipTapEditor";
import { FileText, ArrowLeft, Eye } from "lucide-react";
import { Button } from "../components/ui/button";

export function SharedViewPage() {
  const { token } = useParams();

  const docQuery = useQuery({
    queryKey: ["shared", token],
    queryFn: () => getSharedDoc(token as string),
    enabled: !!token,
  });

  return (
    <div className="min-h-screen bg-[#f0f0f3]">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b-2 border-slate-900 bg-[#f7f7f9]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center bg-slate-900 text-white">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-base font-black tracking-tight text-slate-900 uppercase">DocEditor</span>
            <div className="mx-2 h-5 w-px bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Read only</span>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to="/login" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Sign in
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-6">
        {docQuery.isLoading ? (
          <div className="space-y-3 animate-fade-in">
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-[60vh] w-full" />
          </div>
        ) : docQuery.isError ? (
          <div className="border-2 border-red-500 bg-red-50 px-6 py-10 text-center">
            <p className="text-sm font-medium text-red-600">
              {docQuery.error instanceof Error ? docQuery.error.message : "Document not found or link expired"}
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/login">Go to login</Link>
            </Button>
          </div>
        ) : docQuery.data ? (
          <div className="animate-slide-up">
            {/* Title */}
            <div className="mb-4 flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900">
                {docQuery.data.title}
              </h1>
            </div>
            {/* Read-only editor */}
            <div className="pointer-events-none opacity-90">
              <TipTapEditor
                initialContent={docQuery.data.content}
                onUpdate={() => {}}
              />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
