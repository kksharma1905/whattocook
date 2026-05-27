"use client";

import { useState } from "react";

const AVATAR_COLORS: Array<[string, string]> = [
  ["#fde8e4", "#c4533a"],
  ["#d4edda", "#3a7d44"],
  ["#fef3cd", "#856404"],
  ["#d1ecf1", "#0c5460"],
  ["#e8d5f5", "#6f42c1"],
  ["#f5d0c4", "#8a3a1f"],
  ["#cde7f5", "#1f6f8a"],
  ["#f5e6c8", "#856404"],
];

function letterAvatarColors(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface Props {
  name: string;
  initialUrl?: string | null;
  size: number;
  radius?: number;
  dim?: boolean;
}

export function MealImage({ name, initialUrl = null, size, radius = 12, dim = false }: Props) {
  const [errored, setErrored] = useState(false);

  if (initialUrl && !errored) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={initialUrl}
        alt={name}
        onError={() => setErrored(true)}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          objectFit: "cover",
          flexShrink: 0,
          opacity: dim ? 0.6 : 1,
          transition: "opacity 0.3s",
        }}
      />
    );
  }

  const [bg, fg] = letterAvatarColors(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: bg,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.42,
        fontWeight: 700,
        color: fg,
        opacity: dim ? 0.6 : 1,
        transition: "opacity 0.3s",
        userSelect: "none",
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
