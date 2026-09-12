import { useState, useCallback, useEffect } from "react";

import { router, useLocalSearchParams } from "expo-router";
import {
  Screen,
  Back,
  T,
  Button,
  Field,
  Panel,
  Row,
  Chip,
} from "@/components/ui";
import { barcodeSchema, products } from "@/services/products/provider";
import { productSchema } from "@/features/pantry/validation";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
import { Unit } from "@/domain/types";
export default function Barcode() {
  const { code: scannedCode } = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState(scannedCode ?? "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(Boolean(scannedCode));
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<Unit>("piece");
  const add = useCook((s) => s.addPantry);
  const c = useTheme();
  const lookup = useCallback(async (value: string) => {
    setCode(value);
    if (!barcodeSchema.safeParse(value).success) {
      setMessage("Please enter a valid food barcode (8, 12, 13 or 14 digits).");
      return;
    }
    setBusy(true);
    try {
      const product = await products.lookup(value);
      setName(product?.name ?? "");
      setBrand(product?.brand ?? "");
      setMessage(
        product
          ? "Product found. Check the package label and amount before saving."
          : "No match found. Add the product details below.",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lookup failed. Try again.");
    } finally {
      setBusy(false);
    }
  }, []);
  useEffect(() => {
    if (!scannedCode) return;
    let active = true;
    void products.lookup(scannedCode).then(product => {
      if (!active) return;
      setName(product?.name ?? ""); setBrand(product?.brand ?? "");
      setMessage(product ? "Product found. Check the package label and amount before saving." : "No match found. Add the product details below.");
    }).catch(error => { if(active) setMessage(error instanceof Error ? error.message : "Lookup failed. Try again."); }).finally(() => { if(active) setBusy(false); });
    return () => { active = false; };
  }, [scannedCode]);
  const save = () => {
    const result = productSchema.safeParse({ name, brand, quantity, unit });
    if (!result.success) {
      setMessage(
        "Enter a name with at least two characters and a positive amount.",
      );
      return;
    }
    add([
      {
        id: "private-" + Date.now(),
        ingredientId: "private-" + (code || Date.now()),
        name: result.data.brand
          ? result.data.brand + " " + result.data.name
          : result.data.name,
        quantity: result.data.quantity,
        unit,
      },
    ]);
    router.replace("/pantry");
  };
  return (
    <Screen>
      <Back title="Scan a barcode" />
      <T bold size={32}>
        Meet your product.
      </T>
      <Button
        label="Open camera"
        onPress={() =>
          router.replace({ pathname: "/capture", params: { mode: "barcode" } })
        }
      />
      <Field
        accessibilityLabel="Barcode digits"
        keyboardType="number-pad"
        placeholder="Enter barcode digits"
        value={code}
        onChangeText={setCode}
      />
      <Button
        label={busy ? "Looking up…" : "Look up barcode"}
        secondary
        disabled={busy || !code}
        onPress={() => void lookup(code)}
      />
      {message ? (
        <Panel>
          <T accessibilityRole="alert">{message}</T>
        </Panel>
      ) : null}
      <T bold size={24}>
        Product details
      </T>
      <T size={14} muted>
        Check the package label and confirm the amount.
      </T>
      <Field
        accessibilityLabel="Product name"
        placeholder="Product name"
        value={name}
        onChangeText={setName}
      />
      <Field
        accessibilityLabel="Brand"
        placeholder="Brand (optional)"
        value={brand}
        onChangeText={setBrand}
      />
      <Field
        accessibilityLabel="Product amount"
        placeholder="Amount"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="decimal-pad"
      />
      <Row>
        {(["g", "ml", "piece"] as const).map((u) => (
          <Chip
            key={u}
            label={u}
            selected={u === unit}
            onPress={() => setUnit(u)}
          />
        ))}
      </Row>
      <Button label="Add to pantry" onPress={save} />
      <T size={12} style={{ color: c.muted }}>
        Product data: Open Food Facts (ODbL). Coverage varies by country.
        Missing allergen information never means a product is allergen-free.
      </T>
    </Screen>
  );
}
