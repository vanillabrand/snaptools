import { useState } from "react";
import { Link2, Copy, Check, ArrowDownUp } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function UrlEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const process = (text: string, m: "encode" | "decode") => {
    try {
      setOutput(m === "encode" ? encodeURIComponent(text) : decodeURIComponent(text));
      setError("");
    } catch {
      setError("Invalid input for " + (m === "decode" ? "decoding" : "encoding"));
      setOutput("");
    }
  };

  const handleInput = (text: string) => {
    setInput(text);
    if (text) process(text, mode);
    else { setOutput(""); setError(""); }
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
    <ToolLayout name="URL Encoder / Decoder" description="Encode or decode URLs and query string parameters." icon={Link2}>
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-3">
          <Button onClick={toggleMode} variant="outline" className="gap-2">
            <ArrowDownUp className="size-4" />
            {mode === "encode" ? "Encoding" : "Decoding"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {mode === "encode" ? "Text → URL-encoded" : "URL-encoded → Text"}
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Input</label>
          <Textarea
            placeholder={mode === "encode" ? "hello world & foo=bar" : "hello%20world%20%26%20foo%3Dbar"}
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            className="min-h-[120px] font-mono text-sm"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

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
          <Textarea value={output} readOnly placeholder="Result…" className="min-h-[120px] font-mono text-sm" />
        </div>
      </div>
    </ToolLayout>
  );
}
