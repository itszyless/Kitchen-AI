export interface Entitlements {
  advancedScanning: boolean;
  mealPlanning: boolean;
}
export const entitlements: Entitlements = {
  advancedScanning: false,
  mealPlanning: false,
};
export type Retailer = {
  id: string;
  name: string;
  countries: string[];
  affiliate: boolean;
  url: string;
};
export const retailers: Retailer[] = [];
