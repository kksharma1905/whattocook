"use client";

import { useEffect } from "react";
import { initIfEmpty } from "@/lib/store";

export default function StoreInit() {
  useEffect(() => {
    initIfEmpty();
  }, []);
  return null;
}
