import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";
import { parseTextFile } from "../utils/fileParser";
import { DocumentModel } from "../models/Document";

function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

/**
 * Convert markdown text to TipTap-compatible JSON document.
 * Handles: headings (#, ##, ###), bullet lists (* / - / •), numbered lists,
 * bold (**text**), italic (*text*), and regular paragraphs.
 */
function markdownToTipTapDoc(text: string) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const content: any[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Heading: # H1, ## H2, ### H3
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch && headingMatch[1] && headingMatch[2]) {
      const level = headingMatch[1].length;
      content.push({
        type: "heading",
        attrs: { level },
        content: parseInlineMarks(headingMatch[2]),
      });
      i++;
      continue;
    }

    // Bullet list: *, -, • at start
    if (/^[\*\-•]\s+/.test(line)) {
      const items: any[] = [];
      while (i < lines.length && /^[\*\-•]\s+/.test(lines[i])) {
        const text = lines[i].replace(/^[\*\-•]\s+/, "");
        items.push({
          type: "listItem",
          content: [{ type: "paragraph", content: parseInlineMarks(text) }],
        });
        i++;
      }
      content.push({ type: "bulletList", content: items });
      continue;
    }

    // Numbered list: 1. 2. etc.
    if (/^\d+[\.\)]\s+/.test(line)) {
      const items: any[] = [];
      while (i < lines.length && /^\d+[\.\)]\s+/.test(lines[i])) {
        const text = lines[i].replace(/^\d+[\.\)]\s+/, "");
        items.push({
          type: "listItem",
          content: [{ type: "paragraph", content: parseInlineMarks(text) }],
        });
        i++;
      }
      content.push({ type: "orderedList", content: items });
      continue;
    }

    // Empty line → empty paragraph
    if (!line.trim()) {
      content.push({ type: "paragraph", content: [] });
      i++;
      continue;
    }

    // Regular paragraph
    content.push({
      type: "paragraph",
      content: parseInlineMarks(line),
    });
    i++;
  }

  if (content.length === 0) {
    content.push({ type: "paragraph", content: [] });
  }

  return { type: "doc", content };
}

/**
 * Parse inline markdown marks: **bold**, *italic*, `code`
 */
function parseInlineMarks(text: string): any[] {
  const result: any[] = [];
  // Simple regex-based inline parsing
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add plain text before match
    if (match.index > lastIndex) {
      const plain = text.slice(lastIndex, match.index);
      if (plain) result.push({ type: "text", text: plain });
    }

    if (match[2]) {
      // Bold: **text**
      result.push({ type: "text", text: match[2], marks: [{ type: "bold" }] });
    } else if (match[3]) {
      // Italic: *text*
      result.push({ type: "text", text: match[3], marks: [{ type: "italic" }] });
    } else if (match[4]) {
      // Code: `text`
      result.push({ type: "text", text: match[4], marks: [{ type: "code" }] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining plain text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining) result.push({ type: "text", text: remaining });
  }

  if (result.length === 0 && text.length > 0) {
    result.push({ type: "text", text });
  }

  return result;
}

export async function createDocFromUpload(params: {
  userId: string;
  originalName: string;
  buffer: Buffer;
  titleOverride?: string;
}) {
  const titleFromName = params.originalName.replace(/\.(txt|md)$/i, "");
  const title = (params.titleOverride?.trim() || titleFromName || "Untitled").trim();
  if (!title) throw new ApiError(400, "Title cannot be empty");

  const text = parseTextFile(params.buffer);
  if (!text.trim()) throw new ApiError(400, "File content is empty");

  const ext = params.originalName.toLowerCase();
  const docJson = ext.endsWith(".md") ? markdownToTipTapDoc(text) : markdownToTipTapDoc(text);

  const created = await DocumentModel.create({
    title,
    content: docJson,
    owner: toObjectId(params.userId),
    collaborators: [],
  });
  return created.toObject();
}
