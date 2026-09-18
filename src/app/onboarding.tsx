import { CountryPicker } from "@/components/country-picker";
import { Choice } from "@/components/ui";
import asset0 from "../../assets/images/mockups/mockup_v1.png";
import asset1 from "../../assets/images/icons/apps/app_store.png";
import asset2 from "../../assets/images/icons/apps/play_store.png";
import asset3 from "../../assets/images/icons/apps/youtube.png";
import asset4 from "../../assets/images/icons/apps/x.png";
import asset5 from "../../assets/images/icons/apps/instagram.png";
import asset6 from "../../assets/images/dots/1.png";
import asset7 from "../../assets/images/dots/2.png";
import asset8 from "../../assets/images/dots/3.png";
import { Brand } from "@/components/Brand";
import { DietaryChoices } from "@/components/DietaryChoices";
import { BirthDatePicker } from "@/components/BirthDatePicker";
import { ageFromBirthDate } from "@/domain/birth-date";
import { acquisitionSources, useAcquisition } from "@/services/acquisition";
import { useTranslate } from "@/i18n";
import { LanguagePicker } from "@/components/LanguagePicker";
import { useRef, useState } from "react";
import {
  View,
  Pressable,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ArrowLeft,
  Check,
  Clock,
  Utensils,
  ChefHat,
  Store,
  Play,
  Music2,
  Video,
  Tv,
  Camera,
  Search,
  MessageCircle,
  Users,
  MoreHorizontal,
  AtSign,
} from "lucide-react-native";
import Animated, {
  FadeInRight,
  FadeInLeft,
  useReducedMotion,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Screen, T, Button, Row, IconButton, Progress } from "@/components/ui";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
import { normalize } from "@/domain/matching";
import { supportsTimerNotifications } from "@/services/timer-notifications";

export default function Onboarding() {
  const acquisition = useAcquisition();
  const sourceIcons = [
    Store,
    Play,
    Music2,
    Video,
    Tv,
    AtSign,
    Camera,
    Search,
    MessageCircle,
    Users,
    MoreHorizontal,
  ];
  const [position, setPosition] = useState(0);
  const order = [0, 10, 11, 7, 9, 2, 1, 3, 4, 5, 6, 8, 13, 12];
  const step = order[position];
  const [backward, setBackward] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const [search, setSearch] = useState("");

  const answered = useCook((s) => s.onboardingAnswered);
  const mark = useCook((s) => s.answerOnboarding);
  const confirmed = answered.includes(1);
  const p = useCook((s) => s.preferences);
  const age = ageFromBirthDate(p.birthDate ?? "");
  const savePreferences = useCook((s) => s.updatePreferences);
  const update = (values: Parameters<typeof savePreferences>[0]) => {
    savePreferences(values);
    mark(step);
  };
  const finish = useCook((s) => s.finishOnboarding);
  const c = useTheme();
  const t = useTranslate();
  const { height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const next = () => {
    void Haptics.selectionAsync().catch(() => {});
    if (step === 7) update({ age: age ?? 0 });
    setSearch("");
    setBackward(false);
    scroll.current?.scrollTo({ y: 0, animated: false });
    setPosition((s) => s + 1);
  };
  const done = () => {
    acquisition.submit(p);
    finish();
    if (supportsTimerNotifications)
      router.push({ pathname: "/notifications", params: { onboarding: "1" } });
    else router.push({ pathname: "/auth", params: { mode: "register" } });
  };
  const titles = [
    "Dinner starts here.",
    "Anything off the menu?",
    "How do you like to eat?",
    "How much time do you have?",
    "At home in the kitchen?",
    "Who are you cooking for?",
    "Where’s your kitchen?",
    "When were you born?",
    "Where did you hear about us?",
    "Choose your gender",
    "What brings you to the kitchen?",
    "What gets in the way?",
    "Your kitchen, your way.",
    "What would you like to share?",
  ];
  const subtitles = [
    "Turn the food you have into a meal you’ll love.",
    "Choose every allergy we should exclude.",
    "Recipe ideas that fit the way you eat.",
    "Think about an ordinary weeknight.",
    "We’ll help as much as you need.",
    "Choose your usual number of servings.",
    "Your region helps us find familiar ingredients.",
    "Kitchen AI is for people aged 13 and older.",
    "",
    "Optional. You can choose not to say.",
    "Choose what matters most to you.",
    "Let’s make everyday cooking easier.",
    "Your preferences are ready. You can change them in settings.",
    "Choose what appears on your profile. You can change each setting later.",
  ];
  const options =
    step === 2
      ? ["Anything", "Vegetarian", "Vegan"]
      : step === 3
        ? ["15 minutes", "30 minutes", "60 minutes"]
        : step === 4
          ? ["Getting started", "Comfortable", "Confident"]
          : step === 5
            ? ["1-2 people", "3-4 people", "5+ people"]
            : [];
  const chosen = (n: number) =>
    answered.includes(step) &&
    (step === 2
      ? p.diet === options[n]
      : step === 3
        ? p.minutes === [15, 30, 60][n]
        : step === 4
          ? p.skill === options[n]
          : p.household === [2, 4, 6][n]);
  const choose = (n: number) => {
    void Haptics.selectionAsync().catch(() => {});
    if (step === 2)
      update({ diet: (["Anything", "Vegetarian", "Vegan"] as const)[n] });
    if (step === 3) update({ minutes: [15, 30, 60][n] });
    if (step === 4)
      update({
        skill: (["Getting started", "Comfortable", "Confident"] as const)[n],
      });
    if (step === 5) update({ household: [2, 4, 6][n] });
  };
  return (
    <Screen
      scrollRef={scroll}
      style={{ flexGrow: 1, gap: 20, paddingBottom: 28 }}
      footer={
        step === 0 ? (
          <>
            <Button label="Get started" onPress={next} />
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: "/auth", params: { mode: "signin" } })
              }
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <T size={14} style={{ textAlign: "center" }}>
                Already have an account?{" "}
                <T size={14} bold>
                  Sign in
                </T>
              </T>
            </Pressable>
          </>
        ) : step === 12 ? (
          <Button label="Let’s go" onPress={done} />
        ) : (
          <Button
            label="Continue"
            disabled={
              !answered.includes(step) ||
              (step === 8 && !acquisition.source) ||
              (step === 7 && (age === null || age < 13))
            }
            onPress={next}
          />
        )
      }
    >
      {step > 0 ? (
        <Row>
          <IconButton
            icon={ArrowLeft}
            label="Previous step"
            onPress={() => {
              setBackward(true);
              setSearch("");
              scroll.current?.scrollTo({ y: 0, animated: false });
              setPosition((s) => s - 1);
            }}
          />
          <Progress value={(position / (order.length - 1)) * 100} />
          <LanguagePicker compact />
        </Row>
      ) : (
        <Row style={{ justifyContent: "space-between" }}>
          <Brand />
          <LanguagePicker compact />
        </Row>
      )}
      <Animated.View
        key={step}
        entering={
          reduced
            ? undefined
            : (backward ? FadeInLeft : FadeInRight).duration(240)
        }
        style={{ flexGrow: 1, gap: 16 }}
      >
        {step === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", gap: 28 }}>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
              }}
            >
              <View
                style={{
                  width: "82%",
                  maxWidth: 300,
                  height: Math.min(height * 0.42, 340),
                  borderRadius: 0,
                  overflow: "hidden",
                  backgroundColor: "transparent",
                }}
              >
                <Image
                  source={asset0}
                  contentFit="contain"
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
            </View>
            <T
              bold
              size={40}
              style={{ textAlign: "center", letterSpacing: -1.6 }}
            >
              What should I{String.fromCharCode(10)}cook today?
            </T>
            <T muted style={{ textAlign: "center", paddingHorizontal: 12 }}>
              {subtitles[0]}
            </T>
          </View>
        ) : (
          <>
            <T
              accessibilityRole="header"
              bold
              size={34}
              style={{ marginTop: 12, letterSpacing: -1.2 }}
            >
              {titles[step]}
            </T>
            {subtitles[step] ? (
              <T muted size={16}>
                {subtitles[step]}
              </T>
            ) : null}
            {step === 8 ? (
              <View style={{ gap: 10, paddingTop: 16 }}>
                {acquisitionSources
                  .filter((source) =>
                    [
                      Platform.OS === "android" ? "Google Play" : "App Store",
                      "YouTube",
                      "X",
                      "Instagram",
                      "TV",
                      "Others",
                    ].includes(source),
                  )
                  .map((source) => {
                    const index = acquisitionSources.indexOf(source);
                    const assets: Record<string, typeof asset1> = {
                      "App Store": asset1,
                      "Google Play": asset2,
                      YouTube: asset3,
                      X: asset4,
                      Instagram: asset5,
                    };
                    const Icon = sourceIcons[index];
                    const selected =
                      answered.includes(8) && acquisition.source === source;
                    return (
                      <Pressable
                        key={source}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        onPress={() => {
                          acquisition.select(source);
                          mark(8);
                          void Haptics.selectionAsync().catch(() => {});
                        }}
                        style={({ pressed }) => ({
                          minHeight: 68,
                          paddingHorizontal: 18,
                          borderRadius: 16,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 16,
                          backgroundColor: selected ? c.primary : c.surface,
                          opacity: pressed ? 0.75 : 1,
                        })}
                      >
                        {assets[source] ? (
                          <Image
                            source={assets[source]}
                            contentFit="contain"
                            style={{ width: 28, height: 28 }}
                          />
                        ) : (
                          <Icon
                            size={23}
                            color={selected ? c.onPrimary : c.text}
                          />
                        )}
                        <T
                          style={{
                            flex: 1,
                            color: selected ? c.onPrimary : c.text,
                          }}
                        >
                          {source}
                        </T>
                        {selected ? (
                          <Check size={20} color={c.onPrimary} />
                        ) : null}
                      </Pressable>
                    );
                  })}
              </View>
            ) : null}
            {step === 10 || step === 11 ? (
              <View style={{ flex: 1, justifyContent: "center", gap: 12 }}>
                {(step === 10
                  ? [
                      "Use what I have",
                      "Try new recipes",
                      "Build a cooking habit",
                    ]
                  : [
                      "Not enough time",
                      "Not sure what to make",
                      "Missing ingredients",
                    ]
                ).map((answer) => (
                  <Pressable
                    key={answer}
                    accessibilityRole="radio"
                    accessibilityState={{
                      checked:
                        answered.includes(step) &&
                        (step === 10 ? p.cookingGoal : p.cookingChallenge) ===
                          answer,
                    }}
                    onPress={() =>
                      update(
                        step === 10
                          ? { cookingGoal: answer }
                          : { cookingChallenge: answer },
                      )
                    }
                    style={{
                      minHeight: 76,
                      borderRadius: 16,
                      padding: 20,
                      justifyContent: "center",
                      backgroundColor:
                        answered.includes(step) &&
                        (step === 10 ? p.cookingGoal : p.cookingChallenge) ===
                          answer
                          ? c.primary
                          : c.surface,
                    }}
                  >
                    <T
                      style={{
                        color:
                          answered.includes(step) &&
                          (step === 10 ? p.cookingGoal : p.cookingChallenge) ===
                            answer
                            ? c.onPrimary
                            : c.text,
                      }}
                    >
                      {answer}
                    </T>
                  </Pressable>
                ))}
              </View>
            ) : null}
            {step === 13 ? (
              <View style={{ gap: 14 }}>
                <Choice
                  title="Yes, show my country and food preferences"
                  body="Includes the allergies you entered."
                  selected={
                    answered.includes(13) &&
                    p.showCountry === true &&
                    p.showDiet === true &&
                    p.showAllergies === true
                  }
                  onPress={() =>
                    update({
                      showCountry: true,
                      showDiet: true,
                      showAllergies: true,
                    })
                  }
                />
                <Choice
                  title="No, keep these private"
                  body="Your recipe preferences still work."
                  selected={
                    answered.includes(13) &&
                    p.showCountry === false &&
                    p.showDiet === false &&
                    p.showAllergies === false
                  }
                  onPress={() =>
                    update({
                      showCountry: false,
                      showDiet: false,
                      showAllergies: false,
                    })
                  }
                />
              </View>
            ) : null}
            {step === 12 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  gap: 24,
                  paddingVertical: 24,
                }}
              >
                <View
                  style={{
                    alignSelf: "center",
                    width: 104,
                    height: 104,
                    borderRadius: 32,
                    backgroundColor: c.surface,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChefHat size={52} color={c.text} />
                </View>
                <T bold size={24} style={{ textAlign: "center" }}>
                  A little less guessing. A lot more cooking.
                </T>
                <View
                  style={{
                    backgroundColor: c.surface,
                    borderRadius: 24,
                    padding: 24,
                    gap: 20,
                  }}
                >
                  {[
                    { Icon: Utensils, text: p.diet },
                    { Icon: Clock, text: p.minutes + " minutes" },
                    {
                      Icon: Users,
                      text:
                        p.household === 6
                          ? "5+ people"
                          : p.household === 4
                            ? "3-4 people"
                            : "1-2 people",
                    },
                  ].map(({ Icon, text }) => (
                    <Row key={text}>
                      <Icon size={22} color={c.text} />
                      <T>{text}</T>
                      <Check size={18} color={c.muted} />
                    </Row>
                  ))}
                </View>
                <T muted style={{ textAlign: "center" }}>
                  Create your account next to save your preferences.
                </T>
              </View>
            ) : null}
            {step === 9 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  gap: 12,
                  paddingVertical: 24,
                }}
              >
                {(
                  ["Male", "Female", "Other", "Prefer not to say"] as const
                ).map((gender) => (
                  <Pressable
                    key={gender}
                    accessibilityRole="radio"
                    accessibilityState={{
                      checked: answered.includes(9) && p.gender === gender,
                    }}
                    onPress={() => update({ gender })}
                    style={{
                      minHeight: 72,
                      borderRadius: 16,
                      backgroundColor:
                        answered.includes(9) && p.gender === gender
                          ? c.primary
                          : c.surface,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <T
                      style={{
                        color:
                          answered.includes(9) && p.gender === gender
                            ? c.onPrimary
                            : c.text,
                      }}
                    >
                      {gender}
                    </T>
                  </Pressable>
                ))}
              </View>
            ) : null}
            {step === 7 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  paddingVertical: 28,
                  gap: 16,
                }}
              >
                <BirthDatePicker
                  value={answered.includes(7) ? p.birthDate : undefined}
                  onChange={(birthDate) => update({ birthDate })}
                />
                {p.birthDate && (age === null || age < 13) ? (
                  <T accessibilityRole="alert" muted>
                    Enter a valid date of birth. You must be 13 or older.
                  </T>
                ) : null}
              </View>
            ) : null}
            {step === 2 ? (
              <DietaryChoices
                selectionEnabled={answered.includes(2)}
                onConfirm={(selected) => mark(2, selected)}
              />
            ) : null}
            {options.length && step !== 2 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  gap: 12,
                  paddingVertical: 24,
                }}
              >
                {options.map((o, n) =>
                  step !== 2 ||
                  normalize(o + " " + t(o)).includes(normalize(search)) ? (
                    <Pressable
                      key={o}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: chosen(n) }}
                      aria-checked={chosen(n)}
                      onPress={() => choose(n)}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.75 : 1,
                        transform: [{ scale: pressed && !reduced ? 0.985 : 1 }],
                        minHeight: step === 5 ? 92 : 76,
                        backgroundColor: chosen(n) ? c.primary : c.surface,
                        borderRadius: 16,
                        padding: 20,
                        justifyContent: "center",
                      })}
                    >
                      {step === 5 ? (
                        <Image
                          source={[asset6, asset7, asset8][n]}
                          contentFit="contain"
                          style={{
                            position: "absolute",
                            left: 20,
                            width: 32,
                            height: 32,
                            tintColor: chosen(n) ? c.onPrimary : c.text,
                          }}
                        />
                      ) : null}
                      <T
                        bold={chosen(n)}
                        size={17}
                        style={{
                          textAlign: "center",
                          color: chosen(n) ? c.onPrimary : c.text,
                        }}
                      >
                        {o}
                      </T>
                    </Pressable>
                  ) : null,
                )}
              </View>
            ) : null}
            {step === 1 ? (
              <DietaryChoices
                allergy
                confirmed={confirmed}
                selectionEnabled={confirmed}
                onConfirm={(selected) => mark(1, selected)}
              />
            ) : null}
            {step === 6 ? (
              <CountryPicker
                value={answered.includes(6) ? p.country : undefined}
                onChange={(country) => update({ country })}
              />
            ) : null}
          </>
        )}
      </Animated.View>
    </Screen>
  );
}
