import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Instagram";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        background: "#000",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 160,
          height: 160,
          borderRadius: 40,
          background: "linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)",
        }}
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="1.8"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4.5" />
          <circle cx="17.5" cy="6.5" r="1.2" fill="#fff" stroke="none" />
        </svg>
      </div>
      <div style={{ fontSize: 64, fontWeight: 700 }}>Instagram</div>
      <div style={{ fontSize: 28, color: "#a8a8a8" }}>
        Share photos and videos with your friends.
      </div>
    </div>,
    size,
  );
}
