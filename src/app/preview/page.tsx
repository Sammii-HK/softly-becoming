"use client";
import { useEffect, useState } from "react";

type Quote = {
  id: string;
  theme: string;
  tone: string;
  lines: string[];
  tags: string[];
};

export default function Preview() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/generate?count=12&seed=42")
      .then(r => r.json())
      .then(data => {
        setQuotes(data.quotes || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10">Loading quotes...</div>;

  return (
    <main className="p-10 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-3 mb-6">
        <h1 className="text-2xl mb-2">Quote Preview</h1>
        <p className="opacity-70">Generated quotes using seed=42 for consistency</p>
      </div>
      {quotes.map((q: Quote) => (
        <div key={q.id} className="bg-[#FAF9F7] text-[#3A3A3A] p-8 rounded-xl">
          <div className="text-sm opacity-60 mb-4">{q.theme} · {q.tone}</div>
          <pre className="whitespace-pre-wrap font-serif text-2xl leading-snug">
            {q.lines.join("\n")}
          </pre>
          <div className="mt-4 text-xs opacity-60">{q.tags.join(" • ")}</div>
        </div>
      ))}
    </main>
  );
}
