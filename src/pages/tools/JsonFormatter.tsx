import { useState } from "react";
import { Braces, Copy, Check, Minimize2, Maximize2, AlertCircle } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState(2);

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout name="JSON Formatter" description="Format, validate and beautify JSON data." icon={Braces}>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="text-sm font-medium">Input JSON</label>
          <Textarea
            placeholder='{"key": "value", "array": [1, 2, 3]}'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={format} className="gap-2">
              <Maximize2 className="size-4" />
              Format
            </Button>
            <Button onClick={minify} variant="outline" className="gap-2">
              <Minimize2 className="size-4" />
              Minify
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-xs text-muted-foreground">Indent:</label>
              <select
                value={indent}
                onChange={(e) => setIndent(Number(e.target.value))}
                className="text-xs border rounded px-2 py-1 bg-background"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={1}>1 tab</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Output</label>
            {output && (
              <Button onClick={copy} variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}
          <Textarea
            value={output}
            readOnly
            placeholder="Formatted JSON will appear here…"
            className="min-h-[300px] font-mono text-sm"
          />
        </div>
      </div>
    </ToolLayout>
  );
}
