import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import type { DocumentSummary } from "../lib/api";
import { updateDoc } from "../lib/api";
import { queryClient } from "../lib/queryClient";
import { FileText, Pencil, Check, X } from "lucide-react";

function RenameInput(props: {
  docId: string;
  currentTitle: string;
  onDone: () => void;
}) {
  const [value, setValue] = useState(props.currentTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: () => updateDoc(props.docId, { title: value.trim() || "Untitled" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docs"] });
      props.onDone();
    },
  });

  const handleSubmit = () => {
    if (value.trim() && value.trim() !== props.currentTitle) {
      mutation.mutate();
    } else {
      props.onDone();
    }
  };

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
      <input
        ref={inputRef}
        autoFocus
        value={value}
        maxLength={60}
        onChange={(e) => setValue(e.target.value.slice(0, 60))}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") props.onDone();
        }}
        className="flex-1 border-2 border-indigo-500 bg-[#fafafc] px-2 py-0.5 text-sm text-slate-900 outline-none focus:border-indigo-600"
        disabled={mutation.isPending}
      />
      <button
        type="button"
        onClick={handleSubmit}
        className="p-1 text-emerald-600 hover:bg-emerald-50 transition-colors"
        title="Save"
      >
        <Check className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={props.onDone}
        className="p-1 text-slate-400 hover:bg-slate-100 transition-colors"
        title="Cancel"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function DocumentList(props: {
  title: string;
  docs: DocumentSummary[];
  emptyText: string;
}) {
  const [renamingId, setRenamingId] = useState<string | null>(null);

  return (
    <section className="animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">{props.title}</h2>
        <span className="tag-pill text-indigo-600 border-indigo-300 bg-indigo-50">
          {props.docs.length}
        </span>
      </div>

      {props.docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 bg-[#f7f7f9] px-4 py-10 text-center">
          <FileText className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm text-slate-400">{props.emptyText}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {props.docs.map((d, i) => (
            <div
              key={d._id}
              className="group card-brutal accent-strip"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {renamingId === d._id ? (
                <div className="p-4 pl-6">
                  <RenameInput
                    docId={d._id}
                    currentTitle={d.title}
                    onDone={() => setRenamingId(null)}
                  />
                  <div className="mt-1 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    Updated {new Date(d.updatedAt).toLocaleString()}
                  </div>
                </div>
              ) : (
                <Link
                  to={`/docs/${d._id}`}
                  className="block p-4 pl-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-slate-100 text-slate-600 border-2 border-slate-300">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {d.title}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setRenamingId(d._id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          title="Rename"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="mt-0.5 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        Updated {new Date(d.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
