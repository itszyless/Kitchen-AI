import { PantryItem } from "@/domain/types";
export type RecognitionCandidate = {
  item: PantryItem;
  confidence: number;
  alternatives: string[];
};
export interface VisionProvider {
  recognize(photoUris: string[]): Promise<RecognitionCandidate[]>;
}
export const unavailableVision: VisionProvider = {
  async recognize() {
    throw new Error(
      "Photo recognition is not connected. Use manual entry or the sample review.",
    );
  },
};
export const sampleCandidates: RecognitionCandidate[] = [
  {
    item: {
      id: "sample-tomato",
      ingredientId: "tomato",
      name: "Cherry tomatoes",
      quantity: 250,
      unit: "g",
    },
    confidence: 0.96,
    alternatives: [],
  },
  {
    item: {
      id: "sample-spinach",
      ingredientId: "spinach",
      name: "Baby spinach",
      quantity: 80,
      unit: "g",
    },
    confidence: 0.72,
    alternatives: ["spinach", "pepper"],
  },
  {
    item: {
      id: "sample-pasta",
      ingredientId: "pasta",
      name: "Pasta",
      quantity: 180,
      unit: "g",
    },
    confidence: 0.93,
    alternatives: [],
  },
];
