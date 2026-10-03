import { NextResponse, type NextRequest } from "next/server";
import { availabilityQuerySchema } from "@/lib/booking/schema";
import { getAvailability } from "@/lib/booking/service";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const parsed = availabilityQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Provide a valid date (YYYY-MM-DD), barber and service." },
      { status: 400 },
    );
  }
  const { date, barber, service } = parsed.data;
  const slots = getAvailability({ date, barber, service });
  return NextResponse.json({ date, barber, service, slots, generatedAt: new Date().toISOString() });
}
