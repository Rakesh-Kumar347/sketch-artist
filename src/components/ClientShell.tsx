"use client";

import type { ReactNode } from "react";
import LenisProvider from "@/components/LenisProvider";

export default function ClientShell({ children }: { children: ReactNode }) {
  return (
    <LenisProvider>
      {children}
    </LenisProvider>
  );
}
