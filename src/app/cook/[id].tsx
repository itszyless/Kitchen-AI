import { CookingStage } from "@/components/CookingStage";
import { useLanguage } from "@/i18n";
import { useEffect, useState, useRef } from "react";
import { AppState } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import * as Haptics from "expo-haptics";
import { Timer, Check } from "lucide-react-native";
import { Screen, Back, T, Panel, Button, Empty } from "@/components/ui";
import { recipes } from "@/data/catalog";
import { eligible } from "@/domain/matching";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
import { scheduleTimerAlert, cancelTimerAlert } from "@/services/timer-notifications";
export default function Cooking() {
  useKeepAwake(undefined, { suppressDeactivateWarnings: true });
  const { id, servings: servingParam } = useLocalSearchParams<{
    id: string;
    servings?: string;
  }>();
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
  const language = useLanguage((s) => s.language);
  const [original, setOriginal] = useState(false);
  const [alertStatus, setAlertStatus] = useState("");
  useEffect(() => {
    if (!end || !r) return;
    let active = true;
    let notificationId: string | null = null;
    void scheduleTimerAlert(end, r.title, p.notificationsEnabled !== false).then(id => {
      notificationId = id;
      if (!active) { if (id) void cancelTimerAlert(id).catch(() => {}); return; }
      setAlertStatus(id ? "A timer alert is scheduled. Phone settings may silence or delay it." : "Keep Kitchen AI open for alerts, or enable Notifications in Settings.");
    }).catch(() => { if (active) setAlertStatus("Couldn't schedule an alert. Keep Kitchen AI open for this timer."); });
    return () => { active = false; if (notificationId) void cancelTimerAlert(notificationId).catch(() => {}); };
  }, [end, r, p.notificationsEnabled]);
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
  const servings = Math.min(
    12,
    Math.max(1, Number(servingParam) || r.servings),
  );
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
    <Screen
      footer={
        <>
          <Button
            label={
              step === r.steps.length - 1 ? "I’m done — let’s eat" : "Next step"
            }
            onPress={() => {
              void Haptics.selectionAsync().catch(() => {});
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
        </>
      }
    >
      <Back title="Let’s cook" />
      <T size={13} muted>
        {r.title} · {servings} servings
      </T>
      <CookingStage
        step={step}
        total={r.steps.length}
        title={current.title}
        body={current.body}
        original={original}
      />
      {language === "de" ? (
        <Button
          secondary
          label={original ? "Show translation" : "Show original"}
          onPress={() => setOriginal(!original)}
        />
      ) : null}
      <Button
        secondary
        label={tip ? "Hide the little extra help" : "A little extra help"}
        onPress={() => setTip(!tip)}
      />
      {tip ? (
        <Panel>
          <T size={18} original={original}>
            {current.tip}
          </T>
        </Panel>
      ) : null}
      {current.seconds && !end ? (
        <Button
          secondary
          icon={Timer}
          label={"Start " + current.seconds / 60 + ":00 timer"}
          onPress={() => {
            setTimerDone(false);
            setAlertStatus("Scheduling timer alert…");
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
        {alertStatus || "Enable timer notifications in Profile for alerts outside the app. Leaving this cooking screen cancels its timer alert."}
      </T>
    </Screen>
  );
}
