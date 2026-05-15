import { useState } from "react";
import { Code2, Copy, Check, ArrowDownUp } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const entityMap: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  "©": "&copy;", "®": "&reg;", "™": "&trade;", "€": "&euro;", "£": "&pound;",
  "¥": "&yen;", "§": "&sect;", "°": "&deg;", "±": "&plusmn;", "×": "&times;",
  "÷": "&divide;", "…": "&hellip;", "–": "&ndash;", "—": "&mdash;",
  " ": "&nbsp;",
};

const reverseMap: Record<string, string> = {};
for (const [char, entity] of Object.entries(entityMap)) {
  reverseMap[entity] = char;
}

function encode(text: string): string {
  return text.replace(/[&<>"'©®™€£¥§°±×÷…–—]/g, (c) => entityMap[c] || c);
}

function decode(text: string): string {
  return text
    .replace(/&[a-zA-Z]+;|&#\d+;|&#x[a-fA-F0-9]+;/g, (entity) => {
      if (reverseMap[entity]) return reverseMap[entity];
      // Numeric entities
      if (entity.startsWith("&#x")) return String.fromCharCode(parseInt(entity.slice(3, -1), 16));
      if (entity.startsWith("&#")) return String.fromCharCode(parseInt(entity.slice(2, -1), 10));
      // Use browser
      const el = document.createElement("textarea");
      el.innerHTML = entity;
      return el.value;
    });
}

export function HtmlEntities() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);

  const process = (text: string, m: "encode" | "decode") => {
    setOutput(m === "encode" ? encode(text) : decode(text));
  };

  const handleInput = (text: string) => {
    setInput(text);
    if (text) process(text, mode);
    else setOutput("");
  };

  const toggleMode = () => {
    const newMode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    if (input) process(input, newMode);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout name="HTML Entity Encoder" description="Encode special characters to HTML entities or decode them back." icon={Code2}>
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-3">
          <Button onClick={toggleMode} variant="outline" className="gap-2">
            <ArrowDownUp className="size-4" />
            {mode === "encode" ? "Encoding" : "Decoding"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {mode === "encode" ? "Characters → Entities" : "Entities → Characters"}
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Input</label>
          <Textarea
            placeholder={mode === "encode" ? '<p>Hello "World" & welcome</p>' : "&lt;p&gt;Hello &quot;World&quot;&lt;/p&gt;"}
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            className="min-h-[150px] font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Output</label>
            {output && (
              <Button onClick={copy} variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>
          <Textarea value={output} readOnly placeholder="Result…" className="min-h-[150px] font-mono text-sm" />
        </div>
      </div>
    </ToolLayout>
  );
}
