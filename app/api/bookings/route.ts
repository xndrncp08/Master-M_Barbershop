import { NextResponse, type NextRequest } from "next/server";
import { processBooking } from "@/lib/booking/service";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4096;

export async function POST(request: NextRequest) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Send the booking as JSON." }, { status: 415 });
  }
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const result = await processBooking(body);
  if (result.ok) return NextResponse.json(result, { status: 201 });
  const status = result.code === "conflict" ? 409 : result.code === "unavailable" ? 422 : 400;
  return NextResponse.json(result, { status });
}
