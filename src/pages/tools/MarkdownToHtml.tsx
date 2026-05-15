import { useState, useMemo } from "react";
import { FileCode, Copy, Check } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function markdownToHtml(md: string): string {
  let html = md;
  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) => `<pre><code>${escapeHtml(code.trim())}</code></pre>`);
  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Headings
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");
  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  // Horizontal rule
  html = html.replace(/^---$/gm, "<hr />");
  // Unordered lists
  html = html.replace(/^[\s]*[-*+]\s+(.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
  // Ordered lists
  html = html.replace(/^[\s]*\d+\.\s+(.+)$/gm, "<li>$1</li>");
  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");
  // Paragraphs (remaining lines)
  html = html.replace(/^(?!<[a-z/])((?!^\s*$).+)$/gm, "<p>$1</p>");
  // Clean up empty lines
  html = html.replace(/\n{3,}/g, "\n\n");
  return html.trim();
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function MarkdownToHtml() {
  const [input, setInput] = useState(`# Hello World

This is a **Markdown** to *HTML* converter.

## Features

- Headings
- **Bold** and *italic* text
- [Links](https://example.com)
- Code blocks
- Lists

\`\`\`javascript
const greeting = "Hello!";
console.log(greeting);
\`\`\`

> This is a blockquote.

---

Enjoy using SnapTools!`);
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => markdownToHtml(input), [input]);

  const copy = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout name="Markdown to HTML" description="Convert Markdown text to clean HTML with live preview." icon={FileCode}>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Markdown Input</label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
            placeholder="Type Markdown here…"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Output</label>
            <Button onClick={copy} variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? "Copied" : "Copy HTML"}
            </Button>
          </div>
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
              <TabsTrigger value="html" className="flex-1">HTML</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <div
                className="prose prose-sm dark:prose-invert max-w-none min-h-[370px] rounded-md border bg-card p-4 overflow-auto"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </TabsContent>
            <TabsContent value="html">
              <Textarea value={html} readOnly className="min-h-[370px] font-mono text-xs" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ToolLayout>
  );
}
