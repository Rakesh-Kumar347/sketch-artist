import { create } from "zustand";

export type CursorType = "default" | "view" | "drag" | "order" | "play";

interface ArtworkItem {
  id: string;
  title: string;
  medium: string;
  year: string;
  description: string;
  image: string;
  category: string;
  price: string;
}

interface StoreState {
  // Cursor
  cursorType: CursorType;
  setCursorType: (type: CursorType) => void;

  // Modal
  modalOpen: boolean;
  activeArtwork: ArtworkItem | null;
  openModal: (artwork: ArtworkItem) => void;
  closeModal: () => void;

  // Audio
  audioEnabled: boolean;
  toggleAudio: () => void;

  // Preloader
  preloaderDone: boolean;
  setPreloaderDone: () => void;
}

export const useStore = create<StoreState>((set) => ({
  cursorType: "default",
  setCursorType: (type) => set({ cursorType: type }),

  modalOpen: false,
  activeArtwork: null,
  openModal: (artwork) => set({ modalOpen: true, activeArtwork: artwork }),
  closeModal: () => set({ modalOpen: false, activeArtwork: null }),

  audioEnabled: false,
  toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),

  preloaderDone: false,
  setPreloaderDone: () => set({ preloaderDone: true }),
}));
