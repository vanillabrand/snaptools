import { useState, useCallback } from "react";
import { Palette, RefreshCw, Lock, Unlock, Copy, Check, Code2, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaletteColor {
  hex: string;
  locked: boolean;
}

function randomHex(): string {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function generateHarmonious(): string[] {
  const strategies = [
    // Analogous
    () => {
      const base = Math.random() * 360;
      return Array.from({ length: 5 }, (_, i) => {
        const h = (base + i * 25 - 50) % 360;
        const s = 55 + Math.random() * 30;
        const l = 40 + Math.random() * 35;
        return hslToHex(h, s, l);
      });
    },
    // Complementary spread
    () => {
      const base = Math.random() * 360;
      const hues = [base, base + 30, base + 180, base + 200, base + 210];
      return hues.map((h) => {
        const s = 50 + Math.random() * 35;
        const l = 35 + Math.random() * 40;
        return hslToHex(h % 360, s, l);
      });
    },
    // Triadic
    () => {
      const base = Math.random() * 360;
      const hues = [base, base + 120, base + 240, base + 60, base + 300];
      return hues.map((h) => {
        const s = 45 + Math.random() * 40;
        const l = 35 + Math.random() * 40;
        return hslToHex(h % 360, s, l);
      });
    },
    // Monochromatic
    () => {
      const h = Math.random() * 360;
      const s = 40 + Math.random() * 40;
      return Array.from({ length: 5 }, (_, i) => {
        const l = 25 + i * 13 + Math.random() * 5;
        return hslToHex(h, s, l);
      });
    },
    // Random vibrant
    () => Array.from({ length: 5 }, () => randomHex()),
  ];
  const fn = strategies[Math.floor(Math.random() * strategies.length)];
  return fn();
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

type ExportFormat = "css" | "tailwind" | "scss" | "array";

function exportPalette(colors: PaletteColor[], format: ExportFormat): string {
  const hexes = colors.map((c) => c.hex);
  switch (format) {
    case "css":
      return `:root {\n${hexes.map((h, i) => `  --color-${i + 1}: ${h};`).join("\n")}\n}`;
    case "tailwind":
      return `// tailwind.config.js\ncolors: {\n  palette: {\n${hexes.map((h, i) => `    '${(i + 1) * 100}': '${h}',`).join("\n")}\n  }\n}`;
    case "scss":
      return hexes.map((h, i) => `$color-${i + 1}: ${h};`).join("\n");
    case "array":
      return JSON.stringify(hexes, null, 2);
  }
}

export function ColourPaletteGenerator() {
  const [colors, setColors] = useState<PaletteColor[]>(() =>
    generateHarmonious().map((hex) => ({ hex, locked: false })),
  );
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("css");
  const [showExport, setShowExport] = useState(false);

  const regenerate = useCallback(() => {
    const newHexes = generateHarmonious();
    setColors((prev) =>
      prev.map((c, i) => (c.locked ? c : { hex: newHexes[i] || randomHex(), locked: false })),
    );
  }, []);

  const toggleLock = (idx: number) => {
    setColors((prev) => prev.map((c, i) => (i === idx ? { ...c, locked: !c.locked } : c)));
  };

  const copyColor = async (hex: string, idx: number) => {
    await navigator.clipboard.writeText(hex);
    setCopiedIdx(idx);
    toast.success(`Copied ${hex}`);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const copyExport = async () => {
    const text = exportPalette(colors, exportFormat);
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadSVG = () => {
    const w = 500, h = 300;
    const sw = w / colors.length;
    const rects = colors.map((c, i) => `<rect x="${i * sw}" y="0" width="${sw}" height="${h}" fill="${c.hex}" />`).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${rects}</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "palette.svg";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("SVG downloaded!");
  };

  return (
    <ToolLayout
      name="Colour Palette Generator"
      description="Generate beautiful colour palettes. Lock colours you like, regenerate the rest. Export as CSS, Tailwind, or SCSS."
      icon={Palette}
    >
      <div className="space-y-6">
        {/* Main palette display */}
        <div className="rounded-2xl overflow-hidden shadow-lg border">
          <div className="flex h-56 md:h-72">
            {colors.map((color, idx) => {
              const isLight = luminance(color.hex) > 0.55;
              const rgb = hexToRgb(color.hex);
              const hsl = hexToHsl(color.hex);
              return (
                <div
                  key={idx}
                  className="flex-1 relative group transition-all hover:flex-[1.3] cursor-pointer"
                  style={{ background: color.hex }}
                  onClick={() => copyColor(color.hex, idx)}
                >
                  {/* Color info overlay */}
                  <div
                    className={`absolute inset-x-0 bottom-0 p-3 md:p-4 transition-opacity opacity-0 group-hover:opacity-100 ${
                      isLight ? "text-gray-900" : "text-white"
                    }`}
                  >
                    <p className="font-bold text-sm md:text-base uppercase tracking-wide">
                      {color.hex}
                    </p>
                    <p className="text-[10px] md:text-xs opacity-75 mt-0.5">
                      rgb({rgb.r}, {rgb.g}, {rgb.b})
                    </p>
                    <p className="text-[10px] md:text-xs opacity-75">
                      hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
                    </p>
                  </div>

                  {/* Lock button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(idx);
                    }}
                    className={`absolute top-2 left-1/2 -translate-x-1/2 size-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      color.locked
                        ? isLight
                          ? "bg-gray-900/20 text-gray-900"
                          : "bg-white/20 text-white"
                        : isLight
                          ? "bg-gray-900/10 text-gray-900/50 opacity-0 group-hover:opacity-100"
                          : "bg-white/10 text-white/50 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {color.locked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
                  </button>

                  {/* Copy confirmation */}
                  {copiedIdx === idx && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                      <div className="bg-white text-gray-900 rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                        <Check className="size-3.5 text-emerald-500" />
                        Copied!
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={regenerate} className="gap-2">
            <RefreshCw className="size-4" />
            Generate New Palette
          </Button>
          <Button variant="outline" onClick={() => setShowExport(!showExport)} className="gap-2">
            <Code2 className="size-4" />
            Export Code
          </Button>
          <Button variant="outline" onClick={downloadSVG} className="gap-2">
            <Download className="size-4" />
            Download SVG
          </Button>
          <p className="text-xs text-muted-foreground ml-auto hidden md:block">
            Press <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono">Space</kbd> to regenerate
          </p>
        </div>

        {/* Keyboard shortcut */}
        <div
          className="hidden"
          ref={(el) => {
            if (!el) return;
            const handler = (e: KeyboardEvent) => {
              if (e.code === "Space" && e.target === document.body) {
                e.preventDefault();
                regenerate();
              }
            };
            document.addEventListener("keydown", handler);
            return () => document.removeEventListener("keydown", handler);
          }}
        />

        {/* Export panel */}
        {showExport && (
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Export</h3>
              <div className="flex gap-1.5">
                {(["css", "tailwind", "scss", "array"] as const).map((fmt) => (
                  <button
                    type="button"
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      exportFormat === fmt
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <pre className="text-sm bg-muted/50 rounded-lg p-4 overflow-x-auto font-mono">
              {exportPalette(colors, exportFormat)}
            </pre>
            <Button variant="outline" size="sm" onClick={copyExport} className="gap-1.5">
              <Copy className="size-3.5" />
              Copy
            </Button>
          </div>
        )}

        {/* Individual color cards */}
        <div className="grid grid-cols-5 gap-3">
          {colors.map((color, idx) => {
            const hsl = hexToHsl(color.hex);
            return (
              <div key={idx} className="rounded-xl border bg-card overflow-hidden">
                <div className="h-16" style={{ background: color.hex }} />
                <div className="p-3 space-y-1">
                  <p className="font-mono text-xs font-bold uppercase">{color.hex}</p>
                  <p className="text-[10px] text-muted-foreground">
                    HSL {hsl.h}° {hsl.s}% {hsl.l}%
                  </p>
                  <div className="flex gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => copyColor(color.hex, idx)}
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Copy
                    </button>
                    <span className="text-[10px] text-muted-foreground">•</span>
                    <button
                      type="button"
                      onClick={() => toggleLock(idx)}
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {color.locked ? "Unlock" : "Lock"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToolLayout>
  );
}
