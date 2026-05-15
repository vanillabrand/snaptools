import { useState, useMemo } from "react";
import { Minimize2, Copy, Check } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")  // Remove comments
    .replace(/\s+/g, " ")               // Collapse whitespace
    .replace(/\s*([{}:;,>~+])\s*/g, "$1") // Remove space around symbols
    .replace(/;}/g, "}")                 // Remove last semicolon
    .replace(/^\s+|\s+$/g, "")          // Trim
    .trim();
}

export function CssMinifier() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => (input ? minifyCss(input) : ""), [input]);

  const savings = input.length > 0
    ? ((1 - output.length / input.length) * 100).toFixed(1)
    : "0";

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout name="CSS Minifier" description="Minify CSS to reduce file size. Remove comments and whitespace." icon={Minimize2}>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Input CSS</label>
          <Textarea
            placeholder={`.container {\n  display: flex;\n  /* Main layout */\n  gap: 1rem;\n}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />
          {input && (
            <p className="text-xs text-muted-foreground">
              {input.length.toLocaleString()} chars → {output.length.toLocaleString()} chars ({savings}% smaller)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Minified Output</label>
            {output && (
              <Button onClick={copy} variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>
          <Textarea value={output} readOnly placeholder="Minified CSS…" className="min-h-[300px] font-mono text-xs" />
        </div>
      </div>
    </ToolLayout>
  );
}
