import { useCallback, useEffect, useRef, useState } from "react";
import { View, Pressable, Platform, AppState, Linking } from "react-native";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { X, ImagePlus, ScanLine, Zap } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, T, Button } from "@/components/ui";
import { kitchenAI } from "@/services/ai/client";
import { recognitionCandidates } from "@/services/ai/results";
import { barcodeSchema } from "@/services/products/provider";
import { useScan } from "@/state/scan";
type Mode = "Fridge" | "Ingredients" | "Barcode";
export default function Capture() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<Mode>(
    params.mode === "barcode"
      ? "Barcode"
      : params.mode === "ingredients"
        ? "Ingredients"
        : "Fridge",
  );
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const permissionAsked = useRef(false);
  useEffect(() => {
    if (
      Platform.OS === "web" ||
      !permission ||
      permission.granted ||
      !permission.canAskAgain ||
      permissionAsked.current
    )
      return;
    permissionAsked.current = true;
    void requestPermission().catch(() => {});
  }, [permission, requestPermission]);
  const close = () =>
    router.canGoBack() ? router.back() : router.replace("/");
  const [active, setActive] = useState(AppState.currentState === "active");
  const [focused, setFocused] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setActive(state === "active");
      if (state === "active" && Platform.OS !== "web") void getPermission();
    });
    return () => subscription.remove();
  }, [getPermission]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [torch, setTorch] = useState(false);
  const [automatic, setAutomatic] = useState(true);
  const [epoch, setEpoch] = useState(0);
  const camera = useRef<CameraView>(null);
  const inFlight = useRef(false);
  const alive = useRef(true);
  const attempt = useRef("");
  const save = useScan((s) => s.set);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const process = useCallback(
    async (uri: string) => {
      const context = ImageManipulator.manipulate(uri);
      context.resize({ width: 1200 });
      const image = await context.renderAsync();
      const compressed = await image.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.7,
        base64: true,
      });
      if (!compressed.base64 || compressed.base64.length > 3000000)
        throw new Error("Please choose a smaller photo.");
      const data = await kitchenAI({
        action: "scan",
        image: compressed.base64,
      });
      const candidates = recognitionCandidates(data);
      if (!candidates.length)
        throw new Error(
          "No clear food items found. Try a closer, brighter photo.",
        );
      if (alive.current) {
        save(candidates, uri);
        router.replace("/review");
      }
    },
    [save],
  );
  const shoot = useCallback(async () => {
    if (inFlight.current || !camera.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const picture = await camera.current.takePictureAsync({ quality: 0.7 });
      if (!picture) throw new Error("Could not take the photo. Try again.");
      await process(picture.uri);
    } catch (e) {
      if (alive.current)
        setError(
          e instanceof Error ? e.message : "Scan failed. Please try again.",
        );
    } finally {
      inFlight.current = false;
      if (alive.current) setBusy(false);
    }
  }, [process]);
  useEffect(() => {
    const key = mode + epoch;
    if (
      !active ||
      !focused ||
      !ready ||
      mode === "Barcode" ||
      !automatic ||
      attempt.current === key
    )
      return;
    const timer = setTimeout(() => {
      attempt.current = key;
      void shoot();
    }, 1800);
    return () => clearTimeout(timer);
  }, [active, focused, ready, mode, automatic, epoch, shoot]);
  const pick = async () => {
    if (inFlight.current) return;
    setAutomatic(false);
    setError("");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        exif: false,
        quality: 0.8,
      });
      if (result.canceled) return;
      inFlight.current = true;
      setBusy(true);
      await process(result.assets[0].uri);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open this photo.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  if (Platform.OS === "web" || !permission?.granted)
    return (
      <Screen>
        <Button
          secondary
          label="Back"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/")
          }
        />
        <T bold size={34}>
          Scan your kitchen
        </T>
        <T muted>
          Point your camera at ingredients, your fridge, or a barcode.
        </T>
        {Platform.OS !== "web" ? (
          <Button
            label={
              permission?.canAskAgain === false
                ? "Open settings"
                : "Open camera"
            }
            onPress={() =>
              void (permission?.canAskAgain === false
                ? Linking.openSettings()
                : requestPermission())
            }
          />
        ) : null}
        <Button
          label={busy ? "Scanning…" : "Choose photo"}
          disabled={busy}
          onPress={() => void pick()}
        />
        <Button
          secondary
          label="Search ingredients"
          onPress={() => router.push("/add")}
        />
        <Button
          label="Search food products"
          secondary
          onPress={() => router.push("/products")}
        />
        <Button
          label="Enter barcode"
          secondary
          onPress={() => router.replace("/barcode")}
        />
        <T muted size={12}>
          Photos are processed by Groq to identify food. You review each result
          before saving.
        </T>
        {error ? <T accessibilityRole="alert">{error}</T> : null}
      </Screen>
    );
  return (
    <View style={{ flex: 1, backgroundColor: "#101113" }}>
      <StatusBar style="light" />
      <CameraView
        active={active && focused}
        ref={camera}
        style={{ flex: 1 }}
        facing="back"
        enableTorch={torch}
        onCameraReady={() => setReady(true)}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
        }}
        onBarcodeScanned={
          mode === "Barcode"
            ? (event) => {
                if (
                  !active ||
                  !focused ||
                  inFlight.current ||
                  !barcodeSchema.safeParse(event.data).success
                )
                  return;
                inFlight.current = true;
                router.replace({
                  pathname: "/barcode",
                  params: { code: event.data },
                });
              }
            : undefined
        }
      />
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          inset: 0,
          justifyContent: "space-between",
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 16),
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close camera"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
            style={{
              padding: 12,
              backgroundColor: "#00000066",
              borderRadius: 24,
            }}
          >
            <X size={24} color="white" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle flash"
            onPress={() => setTorch(!torch)}
            style={{
              padding: 12,
              backgroundColor: "#00000066",
              borderRadius: 24,
            }}
          >
            <Zap size={24} color={torch ? "#F4C44E" : "white"} />
          </Pressable>
        </View>
        <View pointerEvents="none" style={{ alignItems: "center", gap: 16 }}>
          <ScanLine size={170} strokeWidth={0.6} color="white" />
          <T
            bold
            size={18}
            style={{
              color: "white",
              textAlign: "center",
              backgroundColor: "#00000066",
              padding: 10,
              borderRadius: 10,
            }}
          >
            {busy
              ? "Finding your ingredients…"
              : mode === "Barcode"
                ? "Hold the barcode inside the frame"
                : "Keep your ingredients in the frame"}
          </T>
        </View>
        <View style={{ gap: 18 }}>
          {error ? (
            <T
              accessibilityRole="alert"
              style={{
                color: "white",
                backgroundColor: "#202124",
                padding: 12,
                borderRadius: 12,
              }}
            >
              {error}
            </T>
          ) : null}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#FFFFFF",
              borderRadius: 999,
              padding: 5,
            }}
          >
            {(["Barcode", "Fridge", "Ingredients"] as const).map((m) => (
              <Pressable
                key={m}
                accessibilityRole="tab"
                accessibilityState={{ selected: mode === m }}
                disabled={busy}
                onPress={() => {
                  setMode(m);
                  setEpoch((n) => n + 1);
                  setError("");
                }}
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  borderRadius: 999,
                  backgroundColor: mode === m ? "#171719" : "transparent",
                }}
              >
                <T
                  size={13}
                  bold
                  style={{
                    textAlign: "center",
                    color: mode === m ? "white" : "#171719",
                  }}
                >
                  {m === "Ingredients" ? "Item" : m}
                </T>
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close camera"
              onPress={close}
              style={{ flex: 1, minHeight: 44, justifyContent: "center" }}
            >
              <T
                size={13}
                bold
                style={{ textAlign: "center", color: "#171719" }}
              >
                Close
              </T>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/add")}
            disabled={busy}
            style={{ minHeight: 44, justifyContent: "center" }}
          >
            <T bold style={{ color: "white", textAlign: "center" }}>
              Search ingredients or products
            </T>
          </Pressable>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose photo"
              disabled={busy}
              onPress={() => void pick()}
              style={{ padding: 14 }}
            >
              <ImagePlus size={26} color="white" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Take photo"
              disabled={busy || mode === "Barcode"}
              onPress={() => void shoot()}
              style={{
                width: 76,
                height: 76,
                borderRadius: 38,
                borderWidth: 4,
                borderColor: "white",
                padding: 5,
                opacity: busy ? 0.5 : 1,
              }}
            >
              <View
                style={{ flex: 1, borderRadius: 32, backgroundColor: "white" }}
              />
            </Pressable>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: automatic }}
              accessibilityLabel="Automatic scan"
              disabled={busy}
              onPress={() => {
                setAutomatic(!automatic);
                setEpoch((n) => n + 1);
              }}
              style={{ padding: 12 }}
            >
              <T size={12} bold style={{ color: "white" }}>
                {automatic ? "Auto on" : "Auto off"}
              </T>
            </Pressable>
          </View>
          <T size={11} style={{ color: "#FFFFFF", textAlign: "center" }}>
            Photos are processed with AI. Check every result.
          </T>
        </View>
      </View>
    </View>
  );
}
