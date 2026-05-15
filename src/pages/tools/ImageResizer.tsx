import { useState, useRef, useCallback } from "react";
import { ImageIcon, Download, Upload, RotateCcw, Maximize } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Preset {
  name: string;
  width: number;
  height: number;
  platform: string;
}

const presets: Preset[] = [
  { name: "Post", width: 1080, height: 1080, platform: "Instagram" },
  { name: "Story", width: 1080, height: 1920, platform: "Instagram" },
  { name: "Profile", width: 320, height: 320, platform: "Instagram" },
  { name: "Cover", width: 1500, height: 500, platform: "Twitter" },
  { name: "Post", width: 1200, height: 675, platform: "Twitter" },
  { name: "Cover", width: 820, height: 312, platform: "Facebook" },
  { name: "Post", width: 1200, height: 630, platform: "Facebook" },
  { name: "Banner", width: 2560, height: 1440, platform: "YouTube" },
  { name: "Thumbnail", width: 1280, height: 720, platform: "YouTube" },
  { name: "Cover", width: 1584, height: 396, platform: "LinkedIn" },
  { name: "Post", width: 1200, height: 627, platform: "LinkedIn" },
  { name: "Favicon", width: 32, height: 32, platform: "Web" },
  { name: "OG Image", width: 1200, height: 630, platform: "Web" },
  { name: "HD", width: 1920, height: 1080, platform: "Standard" },
  { name: "4K", width: 3840, height: 2160, platform: "Standard" },
];

const platforms = [...new Set(presets.map((p) => p.platform))];

export function ImageResizer() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setFileName(file.name);
        setWidth(img.width);
        setHeight(img.height);
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) loadImage(file);
    },
    [loadImage],
  );

  const handleWidthChange = (w: number) => {
    setWidth(w);
    if (lockAspect && originalWidth > 0) {
      setHeight(Math.round((w / originalWidth) * originalHeight));
    }
  };

  const handleHeightChange = (h: number) => {
    setHeight(h);
    if (lockAspect && originalHeight > 0) {
      setWidth(Math.round((h / originalHeight) * originalWidth));
    }
  };

  const applyPreset = (preset: Preset) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setLockAspect(false);
  };

  const reset = () => {
    if (image) {
      setWidth(originalWidth);
      setHeight(originalHeight);
      setLockAspect(true);
    }
  };

  const download = () => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, width, height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ext = fileName.split(".").pop() || "png";
      a.href = url;
      a.download = `resized-${width}x${height}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Image downloaded!");
    }, "image/png");
  };

  const ratio = originalWidth > 0 ? (width / originalWidth) * 100 : 100;

  return (
    <ToolLayout
      name="Image Resizer"
      description="Resize images for social media, web, and print. All processing happens in your browser."
      icon={ImageIcon}
    >
      <canvas ref={canvasRef} className="hidden" />

      {!image ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Upload className="size-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">Drop an image here</p>
              <p className="text-muted-foreground text-sm mt-1">or click to browse — PNG, JPG, WebP, GIF</p>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) loadImage(file);
            }}
          />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          {/* Preview */}
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/20 p-4 flex items-center justify-center min-h-[300px] overflow-hidden">
              <img
                src={image.src}
                alt="Preview"
                className="max-w-full max-h-[400px] object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{fileName}</span>
              <span>•</span>
              <span>
                Original: {originalWidth} × {originalHeight}px
              </span>
              <span>•</span>
              <span>
                Output: {width} × {height}px ({ratio.toFixed(0)}%)
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Dimensions */}
            <div className="rounded-xl border bg-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Dimensions</h3>
                <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs gap-1">
                  <RotateCcw className="size-3" />
                  Reset
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1.5">Width (px)</Label>
                  <Input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    min={1}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5">Height (px)</Label>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    min={1}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={lockAspect}
                  onChange={(e) => setLockAspect(e.target.checked)}
                  className="rounded"
                />
                <Maximize className="size-3.5 text-muted-foreground" />
                Lock aspect ratio
              </label>
            </div>

            {/* Presets */}
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <h3 className="font-semibold text-sm">Social Media Presets</h3>
              <div className="flex flex-wrap gap-1.5">
                {platforms.map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setActivePlatform(activePlatform === p ? null : p)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      activePlatform === p
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {presets
                  .filter((p) => !activePlatform || p.platform === activePlatform)
                  .map((preset) => (
                    <button
                      type="button"
                      key={`${preset.platform}-${preset.name}`}
                      onClick={() => applyPreset(preset)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-muted/50 transition-colors text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] px-1.5">
                          {preset.platform}
                        </Badge>
                        {preset.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {preset.width}×{preset.height}
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={download} className="flex-1 gap-2">
                <Download className="size-4" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setImage(null);
                  setFileName("");
                }}
              >
                New Image
              </Button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
