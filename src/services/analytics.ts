export type AnalyticsEvent =
  | "onboarding_completed"
  | "scan_started"
  | "scan_reviewed"
  | "pantry_added"
  | "recipe_opened"
  | "recipe_started"
  | "recipe_completed"
  | "substitution_viewed";
export interface Analytics {
  track(event: AnalyticsEvent): void;
}
export const analytics: Analytics = {
  track() {
    /* No data collection until explicit consent and a provider are configured. */
  },
};
