import { ImageResponse } from "next/og";
import { STAR_PATH } from "@/presentation/components/brand/Logo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
        <svg width="104" height="104" viewBox="0 0 100 100">
          <path d={STAR_PATH} fill="#f5f5f7" />
        </svg>
      </div>
    ),
    size,
  );
}
