import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function Metrics() {
  const [countFree, countPaid, events] = await Promise.all([
    prisma.subscriber.count({ where: { tier: "FREE", status: "ACTIVE" } }),
    prisma.subscriber.count({ where: { tier: "PAID", status: "ACTIVE" } }),
    prisma.emailEvent.groupBy({
      by: ["type"],
      _count: { type: true },
      where: { ts: { gte: new Date(Date.now() - 1000*60*60*24*7) } } // last 7 days
    })
  ]);

  const eventMap = Object.fromEntries(events.map(e => [e.type, e._count.type]));

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl mb-6">Email metrics (last 7 days)</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Active free"> {countFree} </Card>
        <Card title="Active paid"> {countPaid} </Card>
        <Card title="Delivered"> {eventMap.delivered || 0} </Card>
        <Card title="Opened"> {eventMap.opened || 0} </Card>
        <Card title="Clicked"> {eventMap.clicked || 0} </Card>
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded p-4">
      <div className="text-sm opacity-70">{title}</div>
      <div className="text-2xl">{children}</div>
    </div>
  );
}
