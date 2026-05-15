import { useState, useCallback } from "react";
import { Hash, Copy, Check } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

async function hashText(text: string, algorithm: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface HashResult {
  label: string;
  algorithm: string;
  value: string;
}

export function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<HashResult[]>([]);
  const [copied, setCopied] = useState("");

  const generateHashes = useCallback(async (text: string) => {
    if (!text) { setHashes([]); return; }
    const algorithms = [
      { label: "SHA-256", algorithm: "SHA-256" },
      { label: "SHA-384", algorithm: "SHA-384" },
      { label: "SHA-512", algorithm: "SHA-512" },
      { label: "SHA-1", algorithm: "SHA-1" },
    ];
    const results = await Promise.all(
      algorithms.map(async (a) => ({
        label: a.label,
        algorithm: a.algorithm,
        value: await hashText(text, a.algorithm),
      }))
    );
    setHashes(results);
  }, []);

  const handleInput = (text: string) => {
    setInput(text);
    generateHashes(text);
  };

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <ToolLayout name="Hash Generator" description="Generate SHA-256, SHA-384, SHA-512 and SHA-1 hashes from any text." icon={Hash}>
      <div className="space-y-4 max-w-2xl">
        <div className="space-y-2">
          <label className="text-sm font-medium">Input Text</label>
          <Textarea
            placeholder="Type or paste text to hash…"
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </div>

        {hashes.length > 0 && (
          <div className="space-y-2">
            {hashes.map((h) => (
              <div key={h.label} className="rounded-lg border bg-card p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">{h.label}</span>
                  <Button onClick={() => copy(h.value, h.label)} variant="ghost" size="sm" className="h-6 gap-1 text-xs">
                    {copied === h.label ? <Check className="size-3" /> : <Copy className="size-3" />}
                    {copied === h.label ? "Copied" : "Copy"}
                  </Button>
                </div>
                <p className="font-mono text-xs break-all select-all leading-relaxed">{h.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
