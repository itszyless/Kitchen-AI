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
import { View, Pressable, ScrollView, Platform, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ArrowLeft, Check, Store, Play, Music2, Video, Tv, Camera, Search, MessageCircle, Users, MoreHorizontal, AtSign } from "lucide-react-native";
import Animated, { FadeInRight, FadeInLeft, useReducedMotion } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  Screen,
  T,
  Button,
  Row,
  IconButton,
  Progress,
} from "@/components/ui";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
import { normalize } from "@/domain/matching";

export default function Onboarding() {
  const acquisition = useAcquisition();
  const sourceIcons = [Store, Play, Music2, Video, Tv, AtSign, Camera, Search, MessageCircle, Users, MoreHorizontal];
  const [position, setPosition] = useState(0);
  const order = [0, 10, 11, 7, 9, 2, 1, 3, 4, 5, 6, 8, 12];
  const step = order[position];
  const [backward, setBackward] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const [search, setSearch] = useState("");

  const [confirmed, setConfirmed] = useState(false);
  const p = useCook((s) => s.preferences);
  const age = ageFromBirthDate(p.birthDate ?? "");
  const update = useCook((s) => s.updatePreferences);
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
  const done = (scan: boolean) => {
    acquisition.submit(p);
    finish();
    router.replace(scan ? "/scan" : "/");
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
    step === 2
      ? p.diet === options[n]
      : step === 3
        ? p.minutes === [15, 30, 60][n]
        : step === 4
          ? p.skill === options[n]
          : p.household === [2, 4, 6][n];
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
            <Button label="Get started" onPress={next} /><Button label="Sign in" secondary onPress={() => router.push({ pathname: "/auth", params: { mode: "signin" } })} />
          </>
        ) : step === 12 ? (
          <>
            <Button
              label="Explore recipes"
              disabled={
                !acquisition.source
              }
              onPress={() => {
                update({ age: age ?? 0 });
                done(false);
              }}
            />
            <Button
              label="Start with my pantry"
              secondary
              disabled={
                !acquisition.source
              }
              onPress={() => {
                update({ age: age ?? 0 });
                done(true);
              }}
            />
          </>
        ) : (
          <Button
            label="Continue"
            disabled={(step === 8 && !acquisition.source) || (step === 1 && !confirmed) || (step === 7 && (age === null || age < 13))}
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
            onPress={() => { setBackward(true); setSearch(""); scroll.current?.scrollTo({ y: 0, animated: false }); setPosition((s) => s - 1); }}
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
        entering={reduced ? undefined : (backward ? FadeInLeft : FadeInRight).duration(240)}
        style={{ flexGrow: 1, gap: 16 }}
      >
        {step === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", gap: 28 }}>
            <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 12 }}>
              <View style={{ width: "82%", maxWidth: 300, height: Math.min(height * 0.42, 340), borderRadius: 0, overflow: "hidden", backgroundColor: c.surface }}>
                <Image source={asset0} contentFit="contain" style={{ width: "100%", height: "100%" }} />
              </View>
            </View>
            <T bold size={40} style={{ textAlign: "center", letterSpacing: -1.6 }}>
              What should I{String.fromCharCode(10)}cook today?
            </T>
            <T muted style={{ textAlign: "center", paddingHorizontal: 12 }}>
              {subtitles[0]}
            </T>
          </View>
        ) : (
          <>
            <T accessibilityRole="header" bold size={34} style={{ marginTop: 12, letterSpacing: -1.2 }}>
              {titles[step]}
            </T>
            {subtitles[step] ? <T muted size={16}>{subtitles[step]}</T> : null}
            {step === 8 ? <View style={{ gap: 10, paddingTop: 16 }}>
              {acquisitionSources.filter(source => [Platform.OS === "android" ? "Google Play" : "App Store", "YouTube", "X", "Instagram", "TV", "Others"].includes(source)).map((source) => {
                const index = acquisitionSources.indexOf(source);
                const assets: Record<string, typeof asset1> = { "App Store": asset1, "Google Play": asset2, "YouTube": asset3, "X": asset4, "Instagram": asset5 };
                const Icon = sourceIcons[index];
                const selected = acquisition.source === source;
                return <Pressable key={source} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => { acquisition.select(source); void Haptics.selectionAsync().catch(() => {}); }} style={({ pressed }) => ({ minHeight: 68, paddingHorizontal: 18, borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: selected ? c.primary : c.surface, opacity: pressed ? 0.75 : 1 })}>
                  {assets[source] ? <Image source={assets[source]} contentFit="contain" style={{ width: 28, height: 28 }} /> : <Icon size={23} color={selected ? c.onPrimary : c.text} />}
                  <T style={{ flex: 1, color: selected ? c.onPrimary : c.text }}>{source}</T>
                  {selected ? <Check size={20} color={c.onPrimary} /> : null}
                </Pressable>;
              })}
            </View> : null}
            {step === 10 || step === 11 ? <View style={{ flex: 1, justifyContent: "center", gap: 12 }}>{(step === 10 ? ["Use what I have", "Try new recipes", "Build a cooking habit"] : ["Not enough time", "Not sure what to make", "Missing ingredients"]).map(answer => <Pressable key={answer} accessibilityRole="radio" accessibilityState={{ checked: (step === 10 ? p.cookingGoal : p.cookingChallenge) === answer }} onPress={() => update(step === 10 ? { cookingGoal: answer } : { cookingChallenge: answer })} style={{ minHeight: 76, borderRadius: 16, padding: 20, justifyContent: "center", backgroundColor: (step === 10 ? p.cookingGoal : p.cookingChallenge) === answer ? c.primary : c.surface }}><T style={{ color: (step === 10 ? p.cookingGoal : p.cookingChallenge) === answer ? c.onPrimary : c.text }}>{answer}</T></Pressable>)}</View> : null}
            {step === 12 ? <View style={{ gap: 24, paddingVertical: 28 }}><Brand width={200} /><T bold size={24}>{p.cookingGoal || "Let’s get cooking."}</T><T>{p.diet}</T><T>{p.minutes} minutes</T><T>{p.household} servings</T><T muted>Scan your ingredients, find a recipe, and cook it step by step.</T></View> : null}
            {step === 9 ? <View style={{ flex: 1, justifyContent: "center", gap: 12, paddingVertical: 24 }}>
              {(["Male", "Female", "Other", "Prefer not to say"] as const).map(gender => <Pressable key={gender} accessibilityRole="radio" accessibilityState={{ checked: p.gender === gender }} onPress={() => update({ gender })} style={{ minHeight: 72, borderRadius: 16, backgroundColor: p.gender === gender ? c.primary : c.surface, justifyContent: "center", alignItems: "center" }}><T style={{ color: p.gender === gender ? c.onPrimary : c.text }}>{gender}</T></Pressable>)}
            </View> : null}
            {step === 7 ? <View style={{ flex: 1, justifyContent: "center", paddingVertical: 28, gap: 16 }}>
              <BirthDatePicker value={p.birthDate} onChange={birthDate => update({ birthDate })} />
              {p.birthDate && (age === null || age < 13) ? <T accessibilityRole="alert" muted>Enter a valid date of birth. You must be 13 or older.</T> : null}
            </View> : null}
            {step === 2 ? <DietaryChoices /> : null}
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
                      {step === 5 ? <Image source={[asset6, asset7, asset8][n]} contentFit="contain" style={{ position: "absolute", left: 20, width: 32, height: 32, tintColor: chosen(n) ? c.onPrimary : c.text }} /> : null}
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
            {step === 1 ? <DietaryChoices allergy confirmed={confirmed} onConfirm={() => setConfirmed(true)} /> : null}
            {step === 6 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  gap: 10,
                  paddingVertical: 16,
                }}
              >
                {[
                  ["AT", "Austria"],
                  ["DE", "Germany"],
                  ["US", "United States"],
                  ["GB", "United Kingdom"],
                  ["FR", "France"],
                  ["IT", "Italy"],
                ].map(([code, name]) => (
                  <Pressable
                    key={code}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: p.country === code }}
                    onPress={() => update({ country: code })}
                    style={{
                      backgroundColor:
                        p.country === code ? c.primary : c.surface,
                      padding: 16,
                      borderRadius: 16,
                    }}
                  >
                    <T
                      style={{
                        color: p.country === code ? c.onPrimary : c.text,
                      }}
                    >
                      {String.fromCodePoint(...[...code].map(char => 127397 + char.charCodeAt(0)))} {name}
                    </T>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </>
        )}
      </Animated.View>
    </Screen>
  );
}
