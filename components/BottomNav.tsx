"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "Today",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 2 A9 9 0 0 1 11 20" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  },
  {
    href: "/meals",
    label: "Meals",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <line x1="4" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="11" x2="18" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/shop",
    label: "Shop",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 3 L5.5 3 L7.5 14 L17 14 L19 7 L6.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="17.5" r="1.5" fill="currentColor" />
        <circle cx="15" cy="17.5" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "History",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 4 L13 4 L13 11 L11 11 Z" fill="currentColor" opacity="0.4" />
        <ellipse cx="11" cy="6" rx="4" ry="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 9 Q7 18 11 18 Q15 18 15 9" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.2" />
        <line x1="9" y1="15" x2="13" y2="15" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M11 3 L12.2 5.8 L15.2 5.2 L16 8.2 L19 9 L17.8 11.8 L19 14.6 L16.2 15.8 L15.6 19 L12.4 18 L11 20 L9.6 18 L6.4 19 L5.8 15.8 L3 14.6 L4.2 11.8 L3 9 L6 8.2 L6.8 5.2 L9.8 5.8 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 430,
        background: "#fff",
        borderTop: "1px solid var(--border)",
        display: "flex",
        zIndex: 50,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {tabs.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "10px 0 12px",
              color: active ? "var(--primary)" : "var(--text-muted)",
              textDecoration: "none",
              fontSize: 10,
              fontWeight: active ? 600 : 400,
              transition: "color 0.15s",
            }}
          >
            {tab.icon}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
