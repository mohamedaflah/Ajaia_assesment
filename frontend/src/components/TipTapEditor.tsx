import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/react";
import ListItem from "@tiptap/extension-list-item";
import { useEffect, useRef } from "react";

// Custom extension to add fontSize attribute to TextStyle
const FontSize = Extension.create({
  name: "fontSize",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
});

export function TipTapEditor(props: {
  initialContent: JSONContent;
  onUpdate: (content: JSONContent) => void;
  onReady?: (editor: any) => void;
}) {
  // Track whether changes are coming from external prop (not from user typing)
  const isExternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // Let StarterKit handle lists, but override listItem for better behavior
        listItem: false,
      }),
      // Explicit ListItem with better Enter key handling
      ListItem,
      Underline,
      TextStyle,
      FontSize,
    ],
    content: props.initialContent,
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[60vh] border-2 border-slate-300 bg-white px-6 py-4 text-slate-800 focus:outline-none transition-all focus-within:border-indigo-500 focus-within:shadow-[3px_3px_0_#6366f1]",
      },
    },
    onUpdate: ({ editor }) => {
      // Don't bubble up updates that we triggered ourselves via setContent
      if (isExternalUpdate.current) return;
      props.onUpdate(editor.getJSON());
    },
  });

  // Sync editor content when initialContent changes from a fetch
  const lastSetContentRef = useRef<string>(JSON.stringify(props.initialContent));

  useEffect(() => {
    if (!editor) return;
    const newStr = JSON.stringify(props.initialContent);
    if (lastSetContentRef.current === newStr) return;
    lastSetContentRef.current = newStr;

    isExternalUpdate.current = true;
    editor.commands.setContent(props.initialContent);
    isExternalUpdate.current = false;
  }, [editor, props.initialContent]);

  // Stable ref for onReady to avoid re-triggering
  const onReadyRef = useRef(props.onReady);
  onReadyRef.current = props.onReady;

  useEffect(() => {
    if (editor && onReadyRef.current) onReadyRef.current(editor);
  }, [editor]);

  return <EditorContent editor={editor} />;
}
