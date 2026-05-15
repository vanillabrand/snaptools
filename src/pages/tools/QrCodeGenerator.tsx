import { useState } from "react";
import { QrCode, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function QrCodeGenerator() {
  const [text, setText] = useState("");
  const [size, setSize] = useState(256);

  const qrUrl = text
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&margin=8`
    : "";

  const download = async () => {
    if (!qrUrl) return;
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qrcode-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(qrUrl, "_blank");
    }
  };

  return (
    <ToolLayout name="QR Code Generator" description="Generate QR codes from any text, URL or data. Download as PNG." icon={QrCode}>
      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <label className="text-sm font-medium">Text or URL</label>
          <Input
            placeholder="https://example.com"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="text-base"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Size</label>
          <div className="flex gap-2">
            {[128, 256, 512].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setSize(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                  size === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                }`}
              >
                {s}×{s}
              </button>
            ))}
          </div>
        </div>

        {text && (
          <div className="space-y-3">
            <div className="flex items-center justify-center p-6 rounded-xl border bg-white">
              <img
                src={qrUrl}
                alt={`QR code for: ${text}`}
                width={Math.min(size, 300)}
                height={Math.min(size, 300)}
                className="max-w-full"
              />
            </div>
            <Button onClick={download} variant="outline" className="w-full gap-2">
              <Download className="size-4" />
              Download PNG ({size}×{size})
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
