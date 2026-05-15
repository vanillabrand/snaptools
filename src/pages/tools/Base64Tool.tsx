import { useState } from "react";
import { Binary, Copy, Check, ArrowDownUp } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const process = (text: string, m: "encode" | "decode") => {
    try {
      if (m === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(text))));
      } else {
        setOutput(decodeURIComponent(escape(atob(text.trim()))));
      }
      setError("");
    } catch {
      setError(m === "decode" ? "Invalid Base64 input" : "Could not encode input");
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
    <ToolLayout name="Base64 Encoder / Decoder" description="Encode text to Base64 or decode Base64 back to plain text." icon={Binary}>
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-3">
          <Button onClick={toggleMode} variant="outline" className="gap-2">
            <ArrowDownUp className="size-4" />
            {mode === "encode" ? "Encoding" : "Decoding"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {mode === "encode" ? "Text → Base64" : "Base64 → Text"}
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {mode === "encode" ? "Plain Text" : "Base64 String"}
          </label>
          <Textarea
            placeholder={mode === "encode" ? "Enter text to encode…" : "Paste Base64 string…"}
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            className="min-h-[150px] font-mono text-sm"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              {mode === "encode" ? "Base64 Output" : "Decoded Text"}
            </label>
            {output && (
              <Button onClick={copy} variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="Result will appear here…"
            className="min-h-[150px] font-mono text-sm"
          />
        </div>
      </div>
    </ToolLayout>
  );
}
