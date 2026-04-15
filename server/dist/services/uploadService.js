"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocByShareToken = exports.toggleShareLink = exports.createDocFromUpload = void 0;
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
const ApiError_1 = require("../utils/ApiError");
const fileParser_1 = require("../utils/fileParser");
const Document_1 = require("../models/Document");
function toObjectId(id) {
    return new mongoose_1.default.Types.ObjectId(id);
}
/**
 * Convert markdown text to TipTap-compatible JSON document.
 * Handles: headings (#, ##, ###), bullet lists (* / - / •), numbered lists,
 * bold (**text**), italic (*text*), and regular paragraphs.
 */
function markdownToTipTapDoc(text) {
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const content = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i] ?? "";
        // Heading: # H1, ## H2, ### H3
        const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
        if (headingMatch) {
            const hashes = headingMatch[1] ?? "#";
            const headingText = headingMatch[2] ?? "";
            content.push({
                type: "heading",
                attrs: { level: hashes.length },
                content: parseInlineMarks(headingText),
            });
            i++;
            continue;
        }
        // Bullet list: *, -, • at start
        if (/^[\*\-•]\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^[\*\-•]\s+/.test(lines[i] ?? "")) {
                const itemLine = (lines[i] ?? "").replace(/^[\*\-•]\s+/, "");
                items.push({
                    type: "listItem",
                    content: [{ type: "paragraph", content: parseInlineMarks(itemLine) }],
                });
                i++;
            }
            content.push({ type: "bulletList", content: items });
            continue;
        }
        // Numbered list: 1. 2. etc.
        if (/^\d+[\.\)]\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^\d+[\.\)]\s+/.test(lines[i] ?? "")) {
                const itemLine = (lines[i] ?? "").replace(/^\d+[\.\)]\s+/, "");
                items.push({
                    type: "listItem",
                    content: [{ type: "paragraph", content: parseInlineMarks(itemLine) }],
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
function parseInlineMarks(text) {
    const result = [];
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            const plain = text.slice(lastIndex, match.index);
            if (plain)
                result.push({ type: "text", text: plain });
        }
        if (match[2]) {
            result.push({ type: "text", text: match[2], marks: [{ type: "bold" }] });
        }
        else if (match[3]) {
            result.push({ type: "text", text: match[3], marks: [{ type: "italic" }] });
        }
        else if (match[4]) {
            result.push({ type: "text", text: match[4], marks: [{ type: "code" }] });
        }
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
        const remaining = text.slice(lastIndex);
        if (remaining)
            result.push({ type: "text", text: remaining });
    }
    if (result.length === 0 && text.length > 0) {
        result.push({ type: "text", text });
    }
    return result;
}
async function createDocFromUpload(params) {
    const titleFromName = params.originalName.replace(/\.(txt|md)$/i, "");
    const title = (params.titleOverride?.trim() || titleFromName || "Untitled").trim();
    if (!title)
        throw new ApiError_1.ApiError(400, "Title cannot be empty");
    const text = (0, fileParser_1.parseTextFile)(params.buffer);
    if (!text.trim())
        throw new ApiError_1.ApiError(400, "File content is empty");
    const docJson = markdownToTipTapDoc(text);
    const created = await Document_1.DocumentModel.create({
        title,
        content: docJson,
        owner: toObjectId(params.userId),
        collaborators: [],
    });
    return created.toObject();
}
exports.createDocFromUpload = createDocFromUpload;
/**
 * Toggle public sharing for a document.
 */
async function toggleShareLink(documentId, ownerId) {
    const doc = await Document_1.DocumentModel.findById(documentId).select({ owner: 1, shareToken: 1 }).lean();
    if (!doc)
        throw new ApiError_1.ApiError(404, "Document not found");
    if (String(doc.owner) !== ownerId)
        throw new ApiError_1.ApiError(403, "Only owner can share");
    if (doc.shareToken) {
        await Document_1.DocumentModel.updateOne({ _id: documentId }, { $set: { shareToken: null } });
        return { shareToken: null, shared: false };
    }
    else {
        const token = crypto_1.default.randomBytes(16).toString("hex");
        await Document_1.DocumentModel.updateOne({ _id: documentId }, { $set: { shareToken: token } });
        return { shareToken: token, shared: true };
    }
}
exports.toggleShareLink = toggleShareLink;
/**
 * Get a document by its public share token. No auth required.
 */
async function getDocByShareToken(token) {
    const doc = await Document_1.DocumentModel.findOne({ shareToken: token })
        .select({ title: 1, content: 1, shareToken: 1, createdAt: 1, updatedAt: 1 })
        .lean();
    if (!doc)
        throw new ApiError_1.ApiError(404, "Document not found or link expired");
    return doc;
}
exports.getDocByShareToken = getDocByShareToken;
//# sourceMappingURL=uploadService.js.map