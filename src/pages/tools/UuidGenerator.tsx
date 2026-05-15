import { useState } from "react";
import { Fingerprint, Copy, Check, RefreshCw, Plus } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";

function newUuid(): string {
  return crypto.randomUUID();
}

export function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>(() => Array.from({ length: 5 }, () => newUuid()));
  const [copied, setCopied] = useState(-1);
  const [copiedAll, setCopiedAll] = useState(false);

  const regenerate = () => setUuids(Array.from({ length: uuids.length }, () => newUuid()));
  const addMore = () => setUuids([...uuids, ...Array.from({ length: 5 }, () => newUuid())]);

  const copy = async (uuid: string, index: number) => {
    await navigator.clipboard.writeText(uuid);
    setCopied(index);
    setTimeout(() => setCopied(-1), 2000);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(uuids.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <ToolLayout name="UUID Generator" description="Generate unique UUIDs (v4) with one click. Bulk generate supported." icon={Fingerprint}>
      <div className="space-y-4 max-w-xl">
        <div className="flex flex-wrap gap-2">
          <Button onClick={regenerate} className="gap-2">
            <RefreshCw className="size-4" />
            Regenerate
          </Button>
          <Button onClick={addMore} variant="outline" className="gap-2">
            <Plus className="size-4" />
            Add 5 More
          </Button>
          <Button onClick={copyAll} variant="outline" className="gap-2 ml-auto">
            {copiedAll ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copiedAll ? "Copied All" : "Copy All"}
          </Button>
        </div>

        <div className="space-y-1.5">
          {uuids.map((uuid, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
              <code className="flex-1 text-sm font-mono select-all">{uuid}</code>
              <Button onClick={() => copy(uuid, i)} variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
                {copied === i ? <Check className="size-3" /> : <Copy className="size-3" />}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
