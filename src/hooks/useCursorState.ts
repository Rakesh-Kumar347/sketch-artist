"use client";
import { useStore } from "@/store/useStore";
export function useCursorState() {
  const { cursorType, setCursorType } = useStore();
  return { cursorType, setCursorType };
}
