import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { Screen, Back, T, Button, Field } from "@/components/ui";
import { FoodAmount } from "@/components/FoodAmount";
import { products, ProductResult } from "@/services/products/provider";
import { useCook } from "@/state/store";
export default function Barcode() {
  const { code: scannedCode } = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState(scannedCode ?? "");
  const [product, setProduct] = useState<ProductResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [macros, setMacros] = useState(false);
  const add = useCook((s) => s.addPantry);
  useEffect(() => {
    if (scannedCode) void lookup(scannedCode);
  }, [scannedCode]);
  async function lookup(value: string) {
    setBusy(true);
    setMessage("");
    try {
      const found = await products.lookup(value);
      setProduct(found);
      if (!found) setMessage("No product found. Try another search.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen>
      <Back title="Add to pantry" />
      {product ? (
        <>
          {product.image ? (
            <Image
              source={product.image}
              style={{ height: 180, width: "100%" }}
              contentFit="contain"
            />
          ) : null}
          <T muted>{product.brand}</T>
          <FoodAmount
            item={{
              id: product.id,
              ingredientId: product.id,
              name: product.name,
              quantity: 100,
              unit: "g",
            }}
            onAdd={(item) => {
              add([item]);
              if (router.canGoBack()) router.back();
              else router.replace("/add");
            }}
          />
          {product.nutrition && Object.keys(product.nutrition).length ? (
            <>
              <Button
                secondary
                label={macros ? "Hide nutrition" : "See nutrition"}
                onPress={() => setMacros(!macros)}
              />
              {macros ? (
                <>
                  <T muted>Per 100 g / 100 ml, as listed on the package</T>
                  {Object.entries(product.nutrition).map(([name, value]) => (
                    <T key={name}>
                      {name}: {value}
                    </T>
                  ))}
                </>
              ) : null}
            </>
          ) : null}
        </>
      ) : (
        <>
          {!scannedCode ? (
            <>
              <Field
                accessibilityLabel="Barcode digits"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
              />
              <Button
                label="Look up barcode"
                disabled={busy}
                onPress={() => void lookup(code)}
              />
            </>
          ) : null}
          {busy ? <T>Looking up…</T> : null}
          {message ? <T accessibilityRole="alert">{message}</T> : null}
          <Button
            secondary
            label="Search"
            onPress={() => router.replace("/add")}
          />
        </>
      )}
      <T muted size={12}>
        Product data: Open Food Facts (ODbL).
      </T>
    </Screen>
  );
}
