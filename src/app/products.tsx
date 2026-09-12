import { useTranslate } from "@/i18n";
import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronDown, Package, ChevronRight } from "lucide-react-native";
import { Back, Button, Screen, SearchBar, T } from "@/components/ui";
import { CookSheet } from "@/components/CookSheet";
import {
  productCountries,
  searchProducts,
  SearchProduct,
} from "@/services/products/search";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";

export default function Products() {
  const c = useTheme();
  const t = useTranslate();
  const preferred = useCook((s) => s.preferences.country);
  const [country, setCountry] = useState(
    productCountries.some(([code]) => code === preferred) ? preferred : "WORLD",
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const search = async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    setSearched(false);
    setResults([]);
    try {
      const items = await searchProducts(query, country, controller.signal);
      if (!controller.signal.aborted) {
        setResults(items);
        setSearched(true);
      }
    } catch (e) {
      if (!controller.signal.aborted)
        setError(
          e instanceof Error ? e.message : "Please try searching again.",
        );
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  };
  return (
    <Screen>
      <Back title="Find food" />
      <T bold size={32}>
        What’s in your kitchen?
      </T>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Food, brand or product…"
        accessibilityLabel="Search food products"
        returnKeyType="search"
        onSubmitEditing={() => {
          if (query.trim().length > 1) void search();
        }}
      />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("Choose product country")}
          onPress={() => setCountryOpen(true)}
          style={{
            flex: 1,
            minHeight: 48,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <T>{productCountries.find(([code]) => code === country)?.[1]}</T>
          <ChevronDown size={18} color={c.text} />
        </Pressable>
        <Button
          label={busy ? "Searching…" : "Search"}
          disabled={busy || query.trim().length < 2}
          onPress={() => void search()}
        />
      </View>
      {error ? <T accessibilityRole="alert">{error}</T> : null}
      {searched && !results.length ? (
        <View style={{ gap: 12, paddingVertical: 20 }}>
          <T bold size={22}>
            No matches yet
          </T>
          <T muted>Try a different spelling, brand, or search worldwide.</T>
          <Button
            secondary
            label="Scan a barcode"
            onPress={() =>
              router.push({ pathname: "/capture", params: { mode: "barcode" } })
            }
          />
          <Button
            secondary
            label="Add food manually"
            onPress={() => router.push("/barcode")}
          />
        </View>
      ) : null}
      {results.map((item) => (
        <Pressable
          key={item.code}
          accessibilityRole="button"
          onPress={() =>
            router.push({ pathname: "/barcode", params: { code: item.code } })
          }
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderColor: c.border,
          }}
        >
          <View
            style={{
              width: 64,
              height: 72,
              borderRadius: 12,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {item.image_front_small_url?.startsWith("https://") ? (
              <Image
                source={item.image_front_small_url}
                contentFit="contain"
                style={{ width: 58, height: 66 }}
              />
            ) : (
              <Package color="#747474" size={28} />
            )}
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <T bold>{item.product_name}</T>
            <T muted size={13}>
              {[item.brands, item.quantity].filter(Boolean).join(" · ")}
            </T>
          </View>
          <ChevronRight size={20} color={c.muted} />
        </Pressable>
      ))}
      <T muted size={12}>
        Product information by Open Food Facts · ODbL. Always check the package
        for allergens.
      </T>
      <CookSheet
        visible={countryOpen}
        onClose={() => setCountryOpen(false)}
        title="Search in"
      >
        {productCountries.map(([code, name]) => (
          <Pressable
            key={code}
            accessibilityRole="button"
            accessibilityState={{ selected: code === country }}
            onPress={() => {
              request.current?.abort();
              setBusy(false);
              setCountry(code);
              setSearched(false);
              setResults([]);
              setCountryOpen(false);
            }}
            style={{
              minHeight: 52,
              justifyContent: "center",
              borderBottomWidth: 1,
              borderColor: c.border,
            }}
          >
            <T bold={country === code}>{name}</T>
          </Pressable>
        ))}
      </CookSheet>
    </Screen>
  );
}
