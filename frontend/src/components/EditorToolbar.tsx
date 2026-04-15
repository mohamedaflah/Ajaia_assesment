import type { Editor } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";
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
    <button
      type="button"
      onClick={props.onClick}
      title={props.label}
      className={`h-8 w-8 flex items-center justify-center border-2 transition-all duration-100 ${
        props.isActive
          ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-[2px_2px_0_#6366f1]"
          : "border-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {props.icon}
    </button>
  );
}

/* ── Number-based Font Size dropdown ─────────────────────── */

const PRESET_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64] as const;
const MIN_SIZE = 8;
const MAX_SIZE = 120;

function FontSizeDropdown({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const customRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowCustom(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (showCustom && customRef.current) customRef.current.focus();
  }, [showCustom]);

  const rawSize = (editor.getAttributes("textStyle")?.fontSize as string) ?? "";
  const currentPx = rawSize ? parseInt(rawSize, 10) : 16;

  const applySize = (px: number) => {
    const clamped = Math.max(MIN_SIZE, Math.min(MAX_SIZE, px));
    if (clamped === 16) {
      editor.chain().focus().unsetMark("textStyle").run();
    } else {
      editor.chain().focus().setMark("textStyle", { fontSize: `${clamped}px` }).run();
    }
    setOpen(false);
    setShowCustom(false);
    setCustomInput("");
  };

  const handleCustomSubmit = () => {
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val > 0) {
      applySize(val);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="h-8 flex items-center gap-1 px-2 border-2 border-transparent text-xs font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all"
        onClick={() => { setOpen(!open); setShowCustom(false); }}
        title="Font Size"
      >
        <Type className="h-3.5 w-3.5" />
        <span className="w-6 text-center">{currentPx}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-36 border-2 border-slate-900 bg-white shadow-[4px_4px_0_#0f172a] z-50 animate-scale-in">
          {/* Preset sizes */}
          <div className="max-h-52 overflow-y-auto py-1">
            {PRESET_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                className={`w-full px-3 py-1.5 text-left text-sm font-medium transition-colors hover:bg-slate-50 flex items-center justify-between ${
                  currentPx === size
                    ? "text-indigo-600 bg-indigo-50 border-l-2 border-indigo-500"
                    : "text-slate-700 border-l-2 border-transparent"
                }`}
                onClick={() => applySize(size)}
              >
                <span>{size}px</span>
                {size === 16 && (
                  <span className="text-[9px] font-bold text-slate-400 uppercase">default</span>
                )}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t-2 border-slate-200" />

          {/* Custom size */}
          {showCustom ? (
            <div className="p-2 flex items-center gap-1">
              <input
                ref={customRef}
                type="number"
                min={MIN_SIZE}
                max={MAX_SIZE}
                placeholder={`${MIN_SIZE}–${MAX_SIZE}`}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCustomSubmit();
                  if (e.key === "Escape") { setShowCustom(false); setCustomInput(""); }
                }}
                className="w-full border-2 border-slate-300 px-2 py-1 text-sm font-mono text-slate-700 outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleCustomSubmit}
                className="border-2 border-slate-900 bg-slate-900 text-white px-2 py-1 text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                OK
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-50 transition-colors"
              onClick={() => setShowCustom(true)}
            >
              Custom size…
            </button>
          )}

          {/* Size limit hint */}
          <div className="px-3 pb-2 text-[9px] text-slate-400 font-medium">
            Min {MIN_SIZE}px · Max {MAX_SIZE}px
          </div>
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
    <div className="flex flex-wrap items-center gap-1 border-2 border-slate-300 bg-white p-1.5">
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

      <div className="mx-1 h-5 w-px bg-slate-300" />

      {/* Font Size */}
      <FontSizeDropdown editor={e} />

      <div className="mx-1 h-5 w-px bg-slate-300" />

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

      <div className="mx-1 h-5 w-px bg-slate-300" />

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
