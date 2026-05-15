import { useState, useCallback } from "react";
import { Palette, Copy, Check } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255),
  ];
}

export function ColourConverter() {
  const [hex, setHex] = useState("#3b82f6");
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });
  const [copied, setCopied] = useState("");

  const updateFromHex = useCallback((val: string) => {
    setHex(val);
    const result = hexToRgb(val);
    if (result) {
      const [r, g, b] = result;
      setRgb({ r, g, b });
      const [h, s, l] = rgbToHsl(r, g, b);
      setHsl({ h, s, l });
    }
  }, []);

  const updateFromRgb = useCallback((r: number, g: number, b: number) => {
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    setRgb({ r, g, b });
    setHex(rgbToHex(r, g, b));
    const [h, s, l] = rgbToHsl(r, g, b);
    setHsl({ h, s, l });
  }, []);

  const updateFromHsl = useCallback((h: number, s: number, l: number) => {
    h = Math.min(360, Math.max(0, h));
    s = Math.min(100, Math.max(0, s));
    l = Math.min(100, Math.max(0, l));
    setHsl({ h, s, l });
    const [r, g, b] = hslToRgb(h, s, l);
    setRgb({ r, g, b });
    setHex(rgbToHex(r, g, b));
  }, []);

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const hexStr = hex.toUpperCase();
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  return (
    <ToolLayout name="Colour Converter" description="Convert colours between HEX, RGB, and HSL formats instantly." icon={Palette}>
      <div className="space-y-6 max-w-xl">
        {/* Preview */}
        <div className="flex items-center gap-4">
          <div className="size-20 rounded-xl border shadow-sm" style={{ backgroundColor: hex }} />
          <div>
            <input
              type="color"
              value={hex.length === 7 ? hex : "#000000"}
              onChange={(e) => updateFromHex(e.target.value)}
              className="w-12 h-8 cursor-pointer rounded border-0"
            />
            <p className="text-xs text-muted-foreground mt-1">Pick a colour</p>
          </div>
        </div>

        {/* HEX */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">HEX</label>
            <Button onClick={() => copy(hexStr, "hex")} variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
              {copied === "hex" ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied === "hex" ? "Copied" : "Copy"}
            </Button>
          </div>
          <Input
            value={hex}
            onChange={(e) => updateFromHex(e.target.value)}
            placeholder="#3b82f6"
            className="font-mono"
          />
        </div>

        {/* RGB */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">RGB</label>
            <Button onClick={() => copy(rgbStr, "rgb")} variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
              {copied === "rgb" ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied === "rgb" ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">R</label>
              <Input type="number" min={0} max={255} value={rgb.r} onChange={(e) => updateFromRgb(Number(e.target.value), rgb.g, rgb.b)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">G</label>
              <Input type="number" min={0} max={255} value={rgb.g} onChange={(e) => updateFromRgb(rgb.r, Number(e.target.value), rgb.b)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">B</label>
              <Input type="number" min={0} max={255} value={rgb.b} onChange={(e) => updateFromRgb(rgb.r, rgb.g, Number(e.target.value))} className="font-mono" />
            </div>
          </div>
        </div>

        {/* HSL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">HSL</label>
            <Button onClick={() => copy(hslStr, "hsl")} variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
              {copied === "hsl" ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied === "hsl" ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">H (°)</label>
              <Input type="number" min={0} max={360} value={hsl.h} onChange={(e) => updateFromHsl(Number(e.target.value), hsl.s, hsl.l)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">S (%)</label>
              <Input type="number" min={0} max={100} value={hsl.s} onChange={(e) => updateFromHsl(hsl.h, Number(e.target.value), hsl.l)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">L (%)</label>
              <Input type="number" min={0} max={100} value={hsl.l} onChange={(e) => updateFromHsl(hsl.h, hsl.s, Number(e.target.value))} className="font-mono" />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
