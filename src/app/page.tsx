export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF9F7] text-[#3A3A3A]">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-serif mb-6">Soft Rebuild</h1>
        <p className="text-xl opacity-80 mb-8">
          Gentle reflections for women rebuilding softly.
        </p>
        <p className="mb-8">
          Daily quotes on Instagram. Weekly letters for deeper reflection.
        </p>
        <div className="flex gap-4">
          <a href="/inbox" className="bg-[#3A3A3A] text-[#FAF9F7] px-6 py-3 rounded hover:opacity-90">
            Join the inbox
          </a>
          <a href="/preview" className="border border-[#3A3A3A] px-6 py-3 rounded hover:bg-[#3A3A3A] hover:text-[#FAF9F7]">
            Preview quotes
          </a>
        </div>
      </div>
    </main>
  );
}