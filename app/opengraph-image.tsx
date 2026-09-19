import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";
import { tools } from "@/lib/tools";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #09090b 0%, #052e16 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            A
          </div>
          <div style={{ fontSize: 44, fontWeight: 700 }}>{SITE.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 1000 }}>{SITE.tagline}</div>
          <div style={{ fontSize: 28, color: "#a1a1aa" }}>Gratis · Tanpa login · Diproses 100% di browser</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {tools.map((t) => (
            <div
              key={t.slug}
              style={{
                fontSize: 22,
                padding: "10px 18px",
                borderRadius: 999,
                border: "1px solid #3f3f46",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              {t.name}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
