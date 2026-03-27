import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { getVolumes } from "@/lib/relay";

export async function GET() {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getVolumes();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
