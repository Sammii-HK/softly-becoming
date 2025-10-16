"use client";
import { useEffect, useState } from "react";

type Letter = {
  id: string; slug: string; subject: string; theme: string; status: "DRAFT"|"SCHEDULED"|"SENT"; sendAt?: string;
  lineToKeep: string;
};

export default function LettersAdmin() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function fetchList(t: string) {
    setLoading(true);
    setErr(null);
    const res = await fetch("/api/letters/list", { headers: { Authorization: `Bearer ${t}` } });
    const j = await res.json();
    setLoading(false);
    if (!res.ok) return setErr(j.error || "Error");
    setLetters(j.letters);
  }

  function onSetToken(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const t = (e.currentTarget.elements.namedItem("tok") as HTMLInputElement).value.trim();
    setToken(t);
    fetchList(t);
  }

  async function updateLetter(id: string, data: Partial<Letter>) {
    const res = await fetch("/api/letters/update", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, ...data })
    });
    if (res.ok) fetchList(token);
  }

  async function sendNow(id: string) {
    const res = await fetch("/api/letters/send-now", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id })
    });
    if (res.ok) fetchList(token);
  }

  async function del(id: string) {
    if (!confirm("Delete this letter?")) return;
    const res = await fetch("/api/letters/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id })
    });
    if (res.ok) fetchList(token);
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl mb-4">Letters admin</h1>

      {!token && (
        <form onSubmit={onSetToken} className="flex gap-2 mb-6">
          <input name="tok" placeholder="Admin token" className="border rounded px-3 py-2" />
          <button className="border rounded px-4">Unlock</button>
        </form>
      )}

      {err && <p className="text-red-600">{err}</p>}
      {loading && <p>Loading…</p>}

      <div className="grid gap-3">
        {letters.map(l => (
          <div key={l.id} className="border rounded p-4">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div>
                <div className="text-sm opacity-70">{l.theme} · {l.slug}</div>
                <div className="text-lg">{l.subject}</div>
                <div className="text-sm opacity-70">status: {l.status} {l.sendAt ? `· sendAt: ${new Date(l.sendAt).toLocaleString()}` : ""}</div>
                <div className="text-sm mt-1 italic">keep: {l.lineToKeep}</div>
              </div>
              <div className="flex gap-2">
                {l.status !== "SENT" && (
                  <>
                    <button onClick={() => {
                      const iso = prompt("New sendAt ISO (e.g. 2025-10-19T08:00:00Z)", l.sendAt || "");
                      if (iso) updateLetter(l.id, { sendAt: iso, status: "SCHEDULED" });
                    }} className="border rounded px-3 py-1">Set date</button>
                    <button onClick={() => updateLetter(l.id, { status: "DRAFT" })} className="border rounded px-3 py-1">Mark draft</button>
                    <button onClick={() => updateLetter(l.id, { status: "SCHEDULED" })} className="border rounded px-3 py-1">Schedule</button>
                    <button onClick={() => sendNow(l.id)} className="border rounded px-3 py-1">Send now</button>
                  </>
                )}
                <button onClick={() => del(l.id)} className="border rounded px-3 py-1">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
