import { Brand } from "@/components/Brand";
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
import { useAuth } from "@/services/supabase/AuthProvider";
type Mode = "Fridge" | "Ingredients" | "Barcode";
export default function Capture() {
  const { session } = useAuth();
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
      (!session && mode !== "Barcode") ||
      !permission ||
      permission.granted ||
      !permission.canAskAgain ||
      permissionAsked.current
    )
      return;
    permissionAsked.current = true;
    void requestPermission().catch(() => {});
  }, [permission, requestPermission, session, mode]);

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

  const camera = useRef<CameraView>(null);
  const inFlight = useRef(false);
  const alive = useRef(true);

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
    if (inFlight.current || !camera.current || !ready || !active || !focused)
      return;
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
  }, [process, ready, active, focused]);
  const pick = async () => {
    if (inFlight.current) return;

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
  if (!session && mode !== "Barcode") return <Screen>
    <Button secondary label="Back" onPress={() => router.canGoBack() ? router.back() : router.replace("/")} />
    <T bold size={30}>Unlock AI scanning</T>
    <T>Create an account to recognize ingredients from photos. You can keep adding ingredients manually or scan barcodes as a guest.</T>
    <Button label="Create account" onPress={() => router.push({ pathname: "/auth", params: { mode: "register" } })} />
    <Button secondary label="Sign in" onPress={() => router.push("/auth")} />
    <Button secondary label="Scan a barcode" onPress={() => setMode("Barcode")} />
  </Screen>;
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
          <View style={{ justifyContent: "center", paddingHorizontal: 12, borderRadius: 24, backgroundColor: "#00000088" }}><Brand light width={150} /></View>
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
          {mode === "Barcode" ? (
            <View
              style={{
                width: "90%",
                maxWidth: 320,
                height: 110,
                borderWidth: 2,
                borderColor: "white",
                borderRadius: 16,
              }}
            />
          ) : (
            <ScanLine size={170} strokeWidth={0.6} color="white" />
          )}
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
          </View>
          <T size={11} style={{ color: "#FFFFFF", textAlign: "center" }}>
            Photos are processed with AI. Check every result.
          </T>
        </View>
      </View>
    </View>
  );
}
