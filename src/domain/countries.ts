import countryData from "@/data/countries.json";
// Bundled names keep country selection available in native engines without Intl.DisplayNames.
export const countries = [...countryData].sort((a, b) =>
  a.name.localeCompare(b.name),
);
export const countryName = (code: string) =>
  countries.find((c) => c.code === code)?.name ?? code;
export const countryFlag = (code: string) =>
  /^[A-Z]{2}$/.test(code)
    ? String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0)))
    : "";
