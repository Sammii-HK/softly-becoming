export function assertInternal(req: Request) {
  const v = req.headers.get("x-internal") || req.headers.get("authorization") || "";
  if (v.trim() !== process.env.CRON_SHARED_SECRET) throw new Error("unauthorised");
}

export function assertAdmin(req: Request) {
  const v = req.headers.get("authorization") || "";
  if (v !== `Bearer ${process.env.ADMIN_TOKEN}`) throw new Error("unauthorised");
}
