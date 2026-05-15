import { useState } from "react";
import { CaseSensitive, Copy, Check } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const conversions = [
  { label: "UPPERCASE", fn: (s: string) => s.toUpperCase() },
  { label: "lowercase", fn: (s: string) => s.toLowerCase() },
  { label: "Title Case", fn: (s: string) => s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()) },
  { label: "Sentence case", fn: (s: string) => s.toLowerCase().replace(/(^\w|[.!?]\s+\w)/g, (c) => c.toUpperCase()) },
  { label: "camelCase", fn: (s: string) => {
    const words = s.replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/).filter(Boolean);
    return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
  }},
  { label: "PascalCase", fn: (s: string) => {
    return s.replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
  }},
  { label: "snake_case", fn: (s: string) => s.replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "_").toLowerCase() },
  { label: "kebab-case", fn: (s: string) => s.replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "-").toLowerCase() },
  { label: "CONSTANT_CASE", fn: (s: string) => s.replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "_").toUpperCase() },
  { label: "aLtErNaTiNg", fn: (s: string) => s.split("").map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join("") },
];

export function CaseConverter() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState("");

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <ToolLayout name="Case Converter" description="Convert text between UPPER, lower, Title, camelCase, snake_case and more." icon={CaseSensitive}>
      <div className="space-y-4 max-w-3xl">
        <div className="space-y-2">
          <label className="text-sm font-medium">Input Text</label>
          <Textarea
            placeholder="Type or paste your text here…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </div>

        {input && (
          <div className="grid sm:grid-cols-2 gap-2">
            {conversions.map((conv) => {
              const result = conv.fn(input);
              return (
                <div key={conv.label} className="flex items-center gap-2 rounded-lg border bg-card p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">{conv.label}</p>
                    <p className="text-sm font-mono truncate">{result}</p>
                  </div>
                  <Button
                    onClick={() => copy(result, conv.label)}
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 shrink-0"
                  >
                    {copied === conv.label ? <Check className="size-3" /> : <Copy className="size-3" />}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
