import type { Editor } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Type,
  ChevronDown,
} from "lucide-react";

/* ── Toolbar icon button ─────────────────────────────────── */

function ToolbarButton(props: {
  onClick: () => void;
  isActive: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant={props.isActive ? "secondary" : "ghost"}
      onClick={props.onClick}
      title={props.label}
      className="h-8 w-8"
    >
      {props.icon}
    </Button>
  );
}

/* ── Font size dropdown ──────────────────────────────────── */

const FONT_SIZES = [
  { label: "Small", value: "14px" },
  { label: "Normal", value: "" },
  { label: "Large", value: "20px" },
  { label: "Huge", value: "28px" },
] as const;

function FontSizeDropdown({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const currentSize =
    (editor.getAttributes("textStyle")?.fontSize as string) ?? "";

  const currentLabel =
    FONT_SIZES.find((s) => s.value === currentSize)?.label ?? "Normal";

  const applySize = (value: string) => {
    if (value === "") {
      editor.chain().focus().unsetMark("textStyle").run();
    } else {
      editor.chain().focus().setMark("textStyle", { fontSize: value }).run();
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1 px-2 text-xs"
        onClick={() => setOpen(!open)}
        title="Font Size"
      >
        <Type className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{currentLabel}</span>
        <ChevronDown className="h-3 w-3" />
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-32 rounded-lg border border-slate-200 bg-white shadow-lg z-50 py-1 animate-scale-in">
          {FONT_SIZES.map((s) => (
            <button
              key={s.label}
              type="button"
              className={`w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-slate-50 ${
                currentLabel === s.label
                  ? "text-indigo-600 font-medium bg-indigo-50/50"
                  : "text-slate-700"
              }`}
              onClick={() => applySize(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Toolbar ─────────────────────────────────────────────── */

export function EditorToolbar(props: { editor: Editor | null }) {
  const e = props.editor;
  if (!e) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-1.5 shadow-sm">
      {/* Text formatting */}
      <ToolbarButton
        onClick={() => e.chain().focus().toggleBold().run()}
        isActive={e.isActive("bold")}
        icon={<Bold className="h-4 w-4" />}
        label="Bold"
      />
      <ToolbarButton
        onClick={() => e.chain().focus().toggleItalic().run()}
        isActive={e.isActive("italic")}
        icon={<Italic className="h-4 w-4" />}
        label="Italic"
      />
      <ToolbarButton
        onClick={() => e.chain().focus().toggleUnderline().run()}
        isActive={e.isActive("underline")}
        icon={<Underline className="h-4 w-4" />}
        label="Underline"
      />

      <div className="mx-1 h-5 w-px bg-slate-200" />

      {/* Font Size */}
      <FontSizeDropdown editor={e} />

      <div className="mx-1 h-5 w-px bg-slate-200" />

      {/* Headings */}
      <ToolbarButton
        onClick={() => e.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={e.isActive("heading", { level: 1 })}
        icon={<Heading1 className="h-4 w-4" />}
        label="Heading 1"
      />
      <ToolbarButton
        onClick={() => e.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={e.isActive("heading", { level: 2 })}
        icon={<Heading2 className="h-4 w-4" />}
        label="Heading 2"
      />
      <ToolbarButton
        onClick={() => e.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={e.isActive("heading", { level: 3 })}
        icon={<Heading3 className="h-4 w-4" />}
        label="Heading 3"
      />

      <div className="mx-1 h-5 w-px bg-slate-200" />

      {/* Lists */}
      <ToolbarButton
        onClick={() => e.chain().focus().toggleBulletList().run()}
        isActive={e.isActive("bulletList")}
        icon={<List className="h-4 w-4" />}
        label="Bullet List"
      />
      <ToolbarButton
        onClick={() => e.chain().focus().toggleOrderedList().run()}
        isActive={e.isActive("orderedList")}
        icon={<ListOrdered className="h-4 w-4" />}
        label="Numbered List"
      />
    </div>
  );
}
