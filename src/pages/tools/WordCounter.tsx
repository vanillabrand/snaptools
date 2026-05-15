import { useState, useMemo } from "react";
import { FileText } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";

export function WordCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const sentences = trimmed ? (trimmed.match(/[.!?]+/g) || []).length || (trimmed.length > 0 ? 1 : 0) : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
    const lines = trimmed ? trimmed.split("\n").length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { characters, charactersNoSpaces, words, sentences, paragraphs, lines, readingTime };
  }, [text]);

  const statCards = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.characters },
    { label: "No Spaces", value: stats.charactersNoSpaces },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Lines", value: stats.lines },
    { label: "Reading Time", value: `${stats.readingTime} min` },
  ];

  return (
    <ToolLayout name="Word & Character Counter" description="Count words, characters, sentences and paragraphs in any text." icon={FileText}>
      <div className="space-y-4 max-w-3xl">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-lg border bg-card p-3 text-center">
              <p className="text-xl md:text-2xl font-bold tabular-nums">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <Textarea
          placeholder="Start typing or paste your text here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[350px] text-base leading-relaxed"
        />
      </div>
    </ToolLayout>
  );
}
