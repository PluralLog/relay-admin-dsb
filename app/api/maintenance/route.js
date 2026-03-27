import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { runMaintenance, expireAllSessions } from "@/lib/relay";

export async function POST(request) {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await request.json();

  try {
    if (action === "cleanup") {
      const data = await runMaintenance();
      return NextResponse.json(data);
    } else if (action === "expire_sessions") {
      const data = await expireAllSessions();
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
