import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { getHealth, getStats } from "@/lib/relay";

export async function GET() {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [health, stats] = await Promise.all([getHealth(), getStats()]);
    return NextResponse.json({ health, stats });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 502 }
    );
  }
}
