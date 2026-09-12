import { create } from "zustand";
import type { RecognitionCandidate } from "@/services/ai/provider";
export const useScan = create<{
  candidates: RecognitionCandidate[];
  photo: string | null;
  set: (items: RecognitionCandidate[], photo: string) => void;
  clear: () => void;
}>((set) => ({
  candidates: [],
  photo: null,
  set: (candidates, photo) => set({ candidates, photo }),
  clear: () => set({ candidates: [], photo: null }),
}));
