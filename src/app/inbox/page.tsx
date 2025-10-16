"use client";
import { useState } from "react";

export default function InboxPage() {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true); setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/subscribe", { method: "POST", body: form });
    const j = await res.json();
    setPending(false);
    if (!res.ok) return setError(j.error || "Something went wrong.");
    setDone(true);
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl mb-4">Soft Rebuild Daily</h1>
      <p className="opacity-80 mb-6">
        One gentle note each morning. Free, calm, and in British English.
      </p>
      {done ? (
        <div className="p-4 rounded bg-green-50 border border-green-200">
          You're in. Check your email for a hello from me 🌿
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-3">
          <input name="name" placeholder="Your name (optional)" className="border rounded px-3 py-2" />
          <input required type="email" name="email" placeholder="you@example.com" className="border rounded px-3 py-2" />
          <button disabled={pending} className="rounded px-4 py-2 border">
            {pending ? "Subscribing…" : "Subscribe free"}
          </button>
        </form>
      )}
      {error && <p className="text-red-600 mt-3">{error}</p>}

      <div className="mt-10 text-sm opacity-70">
        Prefer more? Join the paid Sunday letter: deeper reflection + gentle exercises.
      </div>
    </main>
  );
}
