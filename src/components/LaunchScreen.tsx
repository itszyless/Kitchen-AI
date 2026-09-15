import { PropsWithChildren, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import Animated, { FadeInDown, FadeOut, useReducedMotion } from "react-native-reanimated";
import { useTheme } from "@/theme/useTheme";
import { Brand } from "./Brand";

/** One launch reveal per app mount. Waits for real storage and auth readiness. */
export function LaunchScreen({ ready, children }: PropsWithChildren<{ ready: boolean }>) {
  const c = useTheme();
  const reduced = useReducedMotion();
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const reveal = setTimeout(() => setMinimumElapsed(true), reduced ? 0 : 1400);
    const loading = setTimeout(() => setSlow(true), 2500);
    return () => { clearTimeout(reveal); clearTimeout(loading); };
  }, [reduced]);
  const visible = !ready || !minimumElapsed;
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {ready ? children : null}
      {visible ? (
        <Animated.View
          key="launch"
          exiting={reduced ? undefined : FadeOut.duration(280)}
          accessibilityLabel="Kitchen AI"
          accessibilityState={{ busy: !ready }}
          style={{ position: "absolute", inset: 0, zIndex: 100, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}
        >
          <Animated.View entering={reduced ? undefined : FadeInDown.duration(420)}>
            <Brand width={240} />
          </Animated.View>
          {slow && !ready ? <ActivityIndicator color={c.muted} style={{ position: "absolute", bottom: "20%" }} /> : null}
        </Animated.View>
      ) : null}
    </View>
  );
}
