import { useEffect, useState } from "react";
import { AppState, Modal, Pressable, View, ScrollView } from "react-native";
import { Image } from "expo-image";
import { Check } from "lucide-react-native";
import { useReducedMotion } from "react-native-reanimated";
import { cookingStreak, cookingWeek } from "@/domain/activity";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
import { Brand } from "./Brand";
import { Button, Row, T } from "./ui";
import done from "../../assets/images/icons/ui/streak_done.png";
import unfinished from "../../assets/images/icons/ui/streak_unfinished.png";
export function Streak() {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const days = useCook((s) => s.cookedDays);
  const c = useTheme();
  const reduced = useReducedMotion();
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") setNow(new Date());
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  const streak = cookingStreak(days, now);
  const source = streak.active ? done : unfinished;
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Cooking streak: ${streak.count} days`}
        onPress={() => {
          setNow(new Date());
          setOpen(true);
        }}
        style={{ minHeight: 44, justifyContent: "center" }}
      >
        <Row
          style={{
            gap: 4,
            borderWidth: 1,
            borderColor: c.border,
            paddingHorizontal: 11,
            paddingVertical: 4,
            borderRadius: 24,
          }}
        >
          <Image
            source={source}
            style={{ width: 22, height: 25 }}
            contentFit="contain"
          />
          <T bold size={13}>
            {streak.count}
          </T>
        </Row>
      </Pressable>
      <Modal
        transparent
        visible={open}
        animationType={reduced ? "none" : "fade"}
        onRequestClose={() => setOpen(false)}
      >
        <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close streak"
            onPress={() => setOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
          />
          <ScrollView
            accessibilityViewIsModal
            style={{
              flexGrow: 0,
              maxHeight: "85%",
              width: "100%",
              maxWidth: 410,
              alignSelf: "center",
              borderRadius: 28,
              backgroundColor: c.bg,
            }}
            contentContainerStyle={{ padding: 24, gap: 22 }}
          >
            <Brand width={114} />
            <View style={{ alignItems: "center", gap: 5 }}>
              <Image
                source={source}
                style={{ width: 130, height: 145 }}
                contentFit="contain"
              />
              <T
                bold
                size={28}
                style={{ color: streak.active ? "#D87928" : c.text }}
              >
                {streak.count} day streak
              </T>
            </View>
            <Row style={{ justifyContent: "space-between", gap: 4 }}>
              {cookingWeek(days, now).map((day) => (
                <View
                  key={day.key}
                  style={{ alignItems: "center", gap: 9 }}
                  accessibilityLabel={`${day.label}: ${day.done ? "cooked" : "not completed"}`}
                >
                  <T size={11} muted>
                    {day.label}
                  </T>
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: day.done ? "#DB914F" : c.border,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {day.done ? <Check color="#FFFFFF" size={16} /> : null}
                  </View>
                </View>
              ))}
            </Row>
            <T muted size={14} style={{ textAlign: "center" }}>
              {streak.active
                ? "A little cooking, a little progress. See you tomorrow."
                : streak.count > 0
                  ? "Your streak is still going. Cook a meal today to keep it warm."
                  : "A fresh start is one meal away. Let’s cook something good."}
            </T>
            <Button label="Close" onPress={() => setOpen(false)} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
