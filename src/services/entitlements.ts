export interface Entitlements {
  advancedScanning: boolean;
  mealPlanning: boolean;
}
export const entitlements: Entitlements = {
  advancedScanning: true,
  mealPlanning: true,
};
export const membership = {
  mode: "free-preview" as const,
  label: "Cook Plus",
  billingEnabled: false,
  entitlementId: "cook_pro",
};
export type Retailer = {
  id: string;
  name: string;
  countries: string[];
  affiliate: boolean;
  url: string;
};
export const retailers: Retailer[] = [];

// All accounts currently receive Plus at no charge. Replace this source with verified billing entitlements when billing is introduced.
export const substitutionLimit = (plus = membership.mode === "free-preview") =>
  plus ? 5 : 2;
