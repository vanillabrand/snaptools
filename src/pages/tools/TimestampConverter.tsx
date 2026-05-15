import { useState, useEffect } from "react";
import { Clock, Copy, Check, RefreshCw } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TimestampConverter() {
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000).toString());
  const [dateStr, setDateStr] = useState("");
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const ts = Number(timestamp);
      if (isNaN(ts)) { setError("Invalid timestamp"); setDateStr(""); return; }
      // Auto-detect seconds vs milliseconds
      const ms = ts > 1e12 ? ts : ts * 1000;
      const d = new Date(ms);
      if (isNaN(d.getTime())) { setError("Invalid timestamp"); setDateStr(""); return; }
      setDateStr(d.toISOString());
      setError("");
    } catch {
      setError("Invalid timestamp");
      setDateStr("");
    }
  }, [timestamp]);

  const fromDate = (val: string) => {
    setDateStr(val);
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return;
      setTimestamp(Math.floor(d.getTime() / 1000).toString());
      setError("");
    } catch {
      setError("Invalid date");
    }
  };

  const useNow = () => {
    const ts = Math.floor(Date.now() / 1000);
    setTimestamp(ts.toString());
  };

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const ts = Number(timestamp);
  const ms = ts > 1e12 ? ts : ts * 1000;
  const date = new Date(ms);
  const isValid = !isNaN(date.getTime()) && !error;

  return (
    <ToolLayout name="Unix Timestamp Converter" description="Convert between Unix timestamps and human-readable dates." icon={Clock}>
      <div className="space-y-6 max-w-xl">
        {/* Live clock */}
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Current Unix Timestamp</p>
          <p className="text-3xl font-mono font-bold tabular-nums">{now}</p>
        </div>

        {/* Timestamp input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Unix Timestamp</label>
            <div className="flex gap-1">
              <Button onClick={useNow} variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
                <RefreshCw className="size-3" />
                Now
              </Button>
              <Button onClick={() => copy(timestamp, "ts")} variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
                {copied === "ts" ? <Check className="size-3" /> : <Copy className="size-3" />}
              </Button>
            </div>
          </div>
          <Input
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            placeholder="1700000000"
            className="font-mono"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        {/* Date input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">ISO 8601 Date</label>
            {dateStr && (
              <Button onClick={() => copy(dateStr, "date")} variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
                {copied === "date" ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copied === "date" ? "Copied" : "Copy"}
              </Button>
            )}
          </div>
          <Input
            value={dateStr}
            onChange={(e) => fromDate(e.target.value)}
            placeholder="2026-01-01T00:00:00.000Z"
            className="font-mono"
          />
        </div>

        {/* Breakdown */}
        {isValid && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              ["UTC", date.toUTCString()],
              ["Local", date.toLocaleString()],
              ["Date", date.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })],
              ["Time", date.toLocaleTimeString()],
              ["Day of Year", Math.ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000).toString()],
              ["Week", Math.ceil(((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(date.getFullYear(), 0, 1).getDay() + 1) / 7).toString()],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border bg-card p-2.5">
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="text-xs font-mono truncate">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
