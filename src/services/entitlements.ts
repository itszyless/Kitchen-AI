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
