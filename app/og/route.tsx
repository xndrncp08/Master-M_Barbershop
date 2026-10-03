import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

const GOLD = "#d4a64a";
const GOLD_LIGHT = "#f2d58c";

export async function GET() {
  const logo = await readFile(join(process.cwd(), "public", SITE.logo.src512));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "64px 80px",
          background: "radial-gradient(circle at 25% 40%, #2a2112 0%, #0b0a08 55%, #050504 100%)",
          color: "#f5efe2",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            right: 24,
            bottom: 24,
            border: "2px solid rgba(212, 166, 74, 0.55)",
            borderRadius: 28,
            display: "flex",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={400} height={400} alt="" style={{ marginRight: 64 }} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: GOLD,
              display: "flex",
            }}
          >
            SE Calgary · Midnapore
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              marginTop: 18,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Master M</span>
            <span style={{ color: GOLD_LIGHT }}>Barbershop</span>
          </div>
          <div style={{ fontSize: 27, marginTop: 24, color: "#d8cfbd", display: "flex" }}>
            Precision Cuts. Master Barbering. Pure Style.
          </div>
          <div
            style={{
              marginTop: 36,
              display: "flex",
              flexDirection: "column",
              fontSize: 24,
              color: "#bfb5a2",
              gap: 8,
            }}
          >
            <span>{SITE.address.singleLine}</span>
            <span>{SITE.phone.display}</span>
          </div>
          {SITE.rating ? (
            <div
              style={{
                marginTop: 28,
                display: "flex",
                alignItems: "center",
                fontSize: 28,
                color: GOLD_LIGHT,
              }}
            >
              {`★ ${SITE.rating.value.toFixed(1)} · ${SITE.rating.count} Google reviews`}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
