import { useState } from "react";
import { AlignLeft, Copy, Check, RefreshCw } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(" ");

function randomWords(count: number): string {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  return result.join(" ");
}

function generateSentence(): string {
  const len = 8 + Math.floor(Math.random() * 12);
  const s = randomWords(len);
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}

function generateParagraph(): string {
  const sentenceCount = 3 + Math.floor(Math.random() * 5);
  return Array.from({ length: sentenceCount }, () => generateSentence()).join(" ");
}

export function LoremIpsum() {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = () => {
    let result = "";
    switch (unit) {
      case "paragraphs":
        result = Array.from({ length: count }, () => generateParagraph()).join("\n\n");
        break;
      case "sentences":
        result = Array.from({ length: count }, () => generateSentence()).join(" ");
        break;
      case "words":
        result = randomWords(count);
        result = result.charAt(0).toUpperCase() + result.slice(1) + ".";
        break;
    }
    setOutput(result);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout name="Lorem Ipsum Generator" description="Generate placeholder text in paragraphs, sentences or words." icon={AlignLeft}>
      <div className="space-y-4 max-w-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium">Generate</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
            className="w-20 h-9 rounded-md border bg-background px-3 text-sm"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as "paragraphs" | "sentences" | "words")}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
          <Button onClick={generate} className="gap-2">
            <RefreshCw className="size-4" />
            Generate
          </Button>
        </div>

        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Output</label>
              <Button onClick={copy} variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <Textarea value={output} readOnly className="min-h-[250px] text-sm leading-relaxed" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
