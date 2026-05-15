import { useState, useCallback } from "react";
import { KeyRound, Copy, Check, RefreshCw } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

function generatePassword(length: number, options: { upper: boolean; lower: boolean; digits: boolean; symbols: boolean }): string {
  let chars = "";
  if (options.lower) chars += LOWER;
  if (options.upper) chars += UPPER;
  if (options.digits) chars += DIGITS;
  if (options.symbols) chars += SYMBOLS;
  if (!chars) chars = LOWER + UPPER + DIGITS;
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => chars[n % chars.length]).join("");
}

function getStrength(pw: string): { label: string; color: string; percent: number } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 2) return { label: "Weak", color: "bg-destructive", percent: 25 };
  if (score <= 3) return { label: "Fair", color: "bg-warning", percent: 50 };
  if (score <= 4) return { label: "Good", color: "bg-info", percent: 75 };
  return { label: "Strong", color: "bg-success", percent: 100 };
}

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({ upper: true, lower: true, digits: true, symbols: true });
  const [passwords, setPasswords] = useState<string[]>(() =>
    Array.from({ length: 5 }, () => generatePassword(16, { upper: true, lower: true, digits: true, symbols: true }))
  );
  const [copied, setCopied] = useState(-1);

  const regenerate = useCallback(() => {
    setPasswords(Array.from({ length: 5 }, () => generatePassword(length, options)));
  }, [length, options]);

  const copy = async (pw: string, index: number) => {
    await navigator.clipboard.writeText(pw);
    setCopied(index);
    setTimeout(() => setCopied(-1), 2000);
  };

  const updateOption = (key: keyof typeof options) => {
    const newOpts = { ...options, [key]: !options[key] };
    setOptions(newOpts);
    setPasswords(Array.from({ length: 5 }, () => generatePassword(length, newOpts)));
  };

  const updateLength = (val: number[]) => {
    setLength(val[0]);
    setPasswords(Array.from({ length: 5 }, () => generatePassword(val[0], options)));
  };

  return (
    <ToolLayout name="Password Generator" description="Generate strong, cryptographically secure random passwords." icon={KeyRound}>
      <div className="space-y-6 max-w-xl">
        {/* Controls */}
        <div className="space-y-4 rounded-lg border bg-card p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Length: {length}</Label>
            </div>
            <Slider min={4} max={64} step={1} value={[length]} onValueChange={updateLength} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {([
              ["upper", "Uppercase (A-Z)"],
              ["lower", "Lowercase (a-z)"],
              ["digits", "Numbers (0-9)"],
              ["symbols", "Symbols (!@#$)"],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <Switch checked={options[key]} onCheckedChange={() => updateOption(key)} />
                <Label className="text-sm">{label}</Label>
              </div>
            ))}
          </div>

          <Button onClick={regenerate} className="w-full gap-2">
            <RefreshCw className="size-4" />
            Regenerate All
          </Button>
        </div>

        {/* Passwords */}
        <div className="space-y-2">
          {passwords.map((pw, i) => {
            const strength = getStrength(pw);
            return (
              <div key={i} className="flex items-center gap-2 rounded-lg border bg-card p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm truncate select-all">{pw}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1 w-16 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${strength.color}`} style={{ width: `${strength.percent}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{strength.label}</span>
                  </div>
                </div>
                <Button onClick={() => copy(pw, i)} variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
                  {copied === i ? <Check className="size-3" /> : <Copy className="size-3" />}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </ToolLayout>
  );
}
