"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import LenisProvider from "@/components/LenisProvider";

const CustomCursor = dynamic(() => import("@/components/ui/CustomCursor"), { ssr: false });

export default function ClientShell({ children }: { children: ReactNode }) {
  return (
    <LenisProvider>
      <CustomCursor />
      {children}
    </LenisProvider>
  );
}
