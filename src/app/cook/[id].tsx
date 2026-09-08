import { useEffect, useState, useRef } from "react";
import { View, AppState } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import * as Haptics from "expo-haptics";
import { Timer, Check } from "lucide-react-native";
import { Screen, Back, T, Panel, Button, Row, Empty } from "@/components/ui";
import { recipes } from "@/data/catalog";
import { eligible } from "@/domain/matching";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
export default function Cooking() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = recipes.find((r) => r.id === id);
  const p = useCook((s) => s.preferences);
  const complete = useCook((s) => s.complete);
  const [step, setStep] = useState(0);
  const [tip, setTip] = useState(false);
  const [end, setEnd] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [done, setDone] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const completed = useRef(false);
  const c = useTheme();
  useEffect(() => {
    if (!end) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setEnd(null);
        setTimerDone(true);
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
      }
    };
    tick();
    const interval = setInterval(tick, 500);
    const sub = AppState.addEventListener("change", tick);
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [end]);
  if (!r || !eligible(r, p))
    return (
      <Screen>
        <Back title="Cooking" />
        <Empty
          title="Recipe unavailable"
          body="Choose a recipe that fits your preferences."
        />
      </Screen>
    );
  const current = r.steps[step];
  if (done)
    return (
      <Screen>
        <Check size={60} color={c.primary} />
        <T size={40} bold>
          You made something good.
        </T>
        <T muted>
          Enjoy your meal. Pantry quantities haven’t been deducted
          automatically.
        </T>
        <Button
          label="Back to my kitchen"
          onPress={() => router.replace("/")}
        />
      </Screen>
    );
  return (
    <Screen>
      <Back title="Let’s cook" />
      <T size={13} muted>
        {r.title}
      </T>
      <Row>
        {r.steps.map((_, n) => (
          <View
            key={n}
            style={{
              height: 5,
              borderRadius: 4,
              flex: 1,
              backgroundColor: n <= step ? c.primary : c.border,
            }}
          />
        ))}
      </Row>
      <T size={13} bold muted>
        STEP {step + 1} OF {r.steps.length}
      </T>
      <T size={38} bold>
        {current.title}
      </T>
      <T size={22} style={{ lineHeight: 34 }}>
        {current.body}
      </T>
      <Button
        secondary
        label={tip ? "Hide the little extra help" : "A little extra help"}
        onPress={() => setTip(!tip)}
      />
      {tip ? (
        <Panel>
          <T size={18}>{current.tip}</T>
        </Panel>
      ) : null}
      {current.seconds && !end ? (
        <Button
          secondary
          icon={Timer}
          label={"Start " + current.seconds / 60 + ":00 timer"}
          onPress={() => {
            setTimerDone(false);
            setRemaining(current.seconds || 0);
            setEnd(Date.now() + (current.seconds || 0) * 1000);
          }}
        />
      ) : null}
      {end ? (
        <Panel>
          <T size={40} bold>
            {Math.floor(remaining / 60)}:
            {String(remaining % 60).padStart(2, "0")}
          </T>
          <T muted>Timer keeps its time if you switch away.</T>
          <Button secondary label="Cancel timer" onPress={() => setEnd(null)} />
        </Panel>
      ) : null}
      {timerDone ? (
        <T accessibilityRole="alert" bold>
          Timer finished. Check your food before moving on.
        </T>
      ) : null}
      <T size={12} muted>
        Keep Cook open for timer alerts. Background notifications are not
        enabled in this preview.
      </T>
      <Button
        label={
          step === r.steps.length - 1 ? "I’m done — let’s eat" : "Next step"
        }
        onPress={() => {
          if (step === r.steps.length - 1) {
            if (!completed.current) {
              complete();
              completed.current = true;
            }
            setDone(true);
            setEnd(null);
          } else {
            setStep((s) => s + 1);
            setTip(false);
          }
        }}
      />
      {step > 0 ? (
        <Button
          secondary
          label="Previous step"
          onPress={() => {
            setStep((s) => s - 1);
            setTip(false);
          }}
        />
      ) : null}
    </Screen>
  );
}
