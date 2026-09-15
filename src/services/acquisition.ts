import { Preferences } from "@/domain/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase/client";
export const acquisitionSources = ["App Store", "Google Play", "TikTok", "YouTube", "TV", "X", "Instagram", "Google", "Facebook", "Friends or family", "Others"] as const;
export type AcquisitionSource = typeof acquisitionSources[number];
export const useAcquisition = create<{
  source: AcquisitionSource | null; owner: string | null; sent: boolean; submitted: boolean;
  answers: Preferences | null;
  submit: (answers: Preferences) => void;
  select: (source: AcquisitionSource) => void;
}>()(persist((set) => ({ source: null, owner: null, sent: false, submitted: false, answers: null,
  submit: (answers) => set({ submitted: true, answers: JSON.parse(JSON.stringify(answers)) }),
  select: (source) => set({ source, owner: null, sent: false, submitted: false }),
}), { name: "cook-acquisition", version: 1, migrate: () => ({ source: null, owner: null, sent: false, submitted: false, answers: null }), storage: createJSONStorage(() => AsyncStorage) }));
let syncing = false;
export async function syncAcquisition(userId: string) {
  const state = useAcquisition.getState();
  if (!supabase || syncing || !state.source || !state.submitted || state.sent || (state.owner && state.owner !== userId)) return;
  syncing = true;
  useAcquisition.setState({ owner: userId });
  try {
    const { error } = await supabase.from("acquisition_responses").upsert(
      { user_id: userId, source: state.source },
      { onConflict: "user_id", ignoreDuplicates: true },
    );
    if (!error && state.answers) {
      const saved = await supabase.from("onboarding_answers").upsert({ user_id: userId, answers: state.answers }, { onConflict: "user_id", ignoreDuplicates: true });
      if (saved.error) return;
    }
    const current = useAcquisition.getState();
    if (!error && current.owner === userId && current.source === state.source) useAcquisition.setState({ sent: true });
  } finally { syncing = false; }
}
