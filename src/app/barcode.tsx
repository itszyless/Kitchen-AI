import { useState } from "react";
import { View, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
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
  const [permission, requestPermission] = useCameraPermissions();
  const [camera, setCamera] = useState(false);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<Unit>("piece");
  const add = useCook((s) => s.addPantry);
  const c = useTheme();
  const lookup = async (value: string) => {
    setCamera(false);
    setCode(value);
    if (!barcodeSchema.safeParse(value).success) {
      setMessage("Please enter a valid food barcode (8, 12, 13 or 14 digits).");
      return;
    }
    setBusy(true);
    try {
      await products.lookup(value);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lookup failed. Try again.");
    } finally {
      setBusy(false);
    }
  };
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
      {camera && permission?.granted ? (
        <View style={{ height: 280, borderRadius: 24, overflow: "hidden" }}>
          <CameraView
            style={{ flex: 1 }}
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
            }}
            onBarcodeScanned={(event) => void lookup(event.data)}
          />
        </View>
      ) : null}
      <Button
        label={camera ? "Close camera" : "Open barcode camera"}
        onPress={async () => {
          if (camera) {
            setCamera(false);
            return;
          }
          if (permission?.granted) {
            setCamera(true);
            return;
          }
          const response = await requestPermission();
          if (response.granted) setCamera(true);
          else
            setMessage(
              "Camera access is off. You can enter the barcode below.",
            );
        }}
      />
      {Platform.OS === "web" ? (
        <T size={13} muted>
          Camera scanning is best tested in Expo Go on your iPhone.
        </T>
      ) : null}
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
        Create a private product
      </T>
      <T size={14} muted>
        Saved only in your pantry. Unverified products are not automatically
        treated as safe recipe ingredients.
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
      <Button label="Save private product" onPress={save} />
      <T size={12} style={{ color: c.muted }}>
        Open Food Facts integration is prepared separately. Live requests
        require completing their API usage setup first.
      </T>
    </Screen>
  );
}
