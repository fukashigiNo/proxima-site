import { ImageResponse } from "next/og";
import { SLOGAN, STAR_PATH } from "@/presentation/components/brand/Logo";

export const alt = `Proxima — ${SLOGAN}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const loadFont = async (weight: number, text: string) => {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Onest:wght@${weight}&text=${encodeURIComponent(text)}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
};

export default async function OpengraphImage() {
  const [title, slogan] = await Promise.all([loadFont(500, "Proxima"), loadFont(400, SLOGAN)]);
  const fonts = [
    title && { name: "Onest", data: title, weight: 500 as const },
    slogan && { name: "Onest", data: slogan, weight: 400 as const },
  ].filter((f) => f !== null);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#000", color: "#f5f5f7", fontFamily: "Onest" }}>
        <svg width="150" height="150" viewBox="0 0 100 100">
          <path d={STAR_PATH} fill="#f5f5f7" />
        </svg>
        <div style={{ marginTop: 48, fontSize: 96, fontWeight: 500, letterSpacing: "-0.03em" }}>Proxima</div>
        {slogan && <div style={{ marginTop: 18, fontSize: 40, color: "#86868b" }}>{SLOGAN}</div>}
      </div>
    ),
    { ...size, fonts },
  );
}
