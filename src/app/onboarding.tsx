import { useTranslate } from "@/i18n";
import { LanguagePicker } from "@/components/LanguagePicker";
import { useState } from "react";
import { View, Pressable, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react-native";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  Screen,
  T,
  Button,
  Chip,
  Row,
  IconButton,
  Progress,
  SearchBar,
  Field,
} from "@/components/ui";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
import { allergens } from "@/domain/types";
import {
  allergySearchTerms,
  otherAllergies,
  foodPreferences,
} from "@/data/foodPreferences";
import { normalize } from "@/domain/matching";
import { recipes } from "@/data/catalog";
export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [age, setAge] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const p = useCook((s) => s.preferences);
  const update = useCook((s) => s.updatePreferences);
  const finish = useCook((s) => s.finishOnboarding);
  const c = useTheme();
  const t = useTranslate();
  const { height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const next = () => {
    void Haptics.selectionAsync().catch(() => {});
    setSearch("");
    setStep((s) => s + 1);
  };
  const done = (scan: boolean) => {
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
    "How old are you?",
  ];
  const subtitles = [
    "Turn the food you have into a meal you’ll love.",
    "Choose every allergy we should exclude.",
    "Recipe ideas that fit the way you eat.",
    "Think about an ordinary weeknight.",
    "We’ll help as much as you need.",
    "Choose your usual number of servings.",
    "Your region helps us find familiar ingredients.",
    "Cook is for people aged 13 and older.",
  ];
  const options =
    step === 2
      ? ["Anything", "Vegetarian", "Vegan"]
      : step === 3
        ? ["15 minutes", "30 minutes", "60 minutes"]
        : step === 4
          ? ["Getting started", "Comfortable", "Confident"]
          : step === 5
            ? ["1 person", "2 people", "3 people", "4 people", "6 people"]
            : [];
  const chosen = (n: number) =>
    step === 2
      ? p.diet === options[n]
      : step === 3
        ? p.minutes === [15, 30, 60][n]
        : step === 4
          ? p.skill === options[n]
          : p.household === [1, 2, 3, 4, 6][n];
  const choose = (n: number) => {
    void Haptics.selectionAsync().catch(() => {});
    if (step === 2)
      update({ diet: (["Anything", "Vegetarian", "Vegan"] as const)[n] });
    if (step === 3) update({ minutes: [15, 30, 60][n] });
    if (step === 4)
      update({
        skill: (["Getting started", "Comfortable", "Confident"] as const)[n],
      });
    if (step === 5) update({ household: [1, 2, 3, 4, 6][n] });
  };
  return (
    <Screen
      style={{ flexGrow: 1, gap: 24, paddingBottom: 24 }}
      footer={
        step === 0 ? (
          <>
            <Button label="Get started" onPress={next} />
          </>
        ) : step === 7 ? (
          <>
            <Button
              label="Explore recipes"
              disabled={
                !/^\d{1,3}$/.test(age) || Number(age) < 13 || Number(age) > 120
              }
              onPress={() => {
                update({ age: Number(age) });
                done(false);
              }}
            />
            <Button
              label="Start with my pantry"
              secondary
              disabled={
                !/^\d{1,3}$/.test(age) || Number(age) < 13 || Number(age) > 120
              }
              onPress={() => {
                update({ age: Number(age) });
                done(true);
              }}
            />
          </>
        ) : (
          <Button
            label="Continue"
            disabled={step === 1 && !confirmed}
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
            onPress={() => setStep((s) => s - 1)}
          />
          <Progress value={(step / 7) * 100} />
          <LanguagePicker />
        </Row>
      ) : (
        <Row style={{ justifyContent: "space-between" }}>
          <T bold size={26} style={{ letterSpacing: -1.5 }}>
            COOK
          </T>
          <LanguagePicker />
        </Row>
      )}
      <Animated.View
        key={step}
        entering={reduced ? undefined : FadeIn.duration(180)}
        style={{ flexGrow: 1, gap: 16 }}
      >
        {step === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", gap: 28 }}>
            <View
              style={{
                height: Math.min(height * 0.43, 360),
                marginHorizontal: 10,
                borderRadius: 28,
                overflow: "hidden",
              }}
            >
              <Image
                source={recipes[0].image}
                contentFit="cover"
                style={{ width: "100%", height: "100%" }}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  right: 16,
                  padding: 15,
                  borderRadius: 16,
                  backgroundColor: "#FFFFFF",
                }}
              >
                <T bold style={{ color: "#171719" }}>
                  A little sunshine pasta
                </T>
                <T size={12} style={{ color: "#686870" }}>
                  From what’s already in your kitchen.
                </T>
              </View>
            </View>
            <T bold size={38} style={{ textAlign: "center" }}>
              What should I{String.fromCharCode(10)}cook today?
            </T>
            <T muted style={{ textAlign: "center", paddingHorizontal: 12 }}>
              {subtitles[0]}
            </T>
          </View>
        ) : (
          <>
            <T bold size={32} style={{ marginTop: 16 }}>
              {titles[step]}
            </T>
            <T muted size={16}>
              {subtitles[step]}
            </T>
            {step === 7 ? (
              <Field
                accessibilityLabel="Your age"
                placeholder="Age"
                keyboardType="number-pad"
                maxLength={3}
                value={age}
                onChangeText={setAge}
              />
            ) : null}
            {step === 2 ? (
              <SearchBar
                accessibilityLabel="Search food preferences"
                placeholder="Search eating styles…"
                value={search}
                onChangeText={setSearch}
              />
            ) : null}
            {options.length ? (
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
                      style={{
                        minHeight: step === 5 ? 58 : 72,
                        backgroundColor: chosen(n) ? c.primary : c.surface,
                        borderRadius: 18,
                        padding: 18,
                        justifyContent: "center",
                      }}
                    >
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
                {step === 2
                  ? foodPreferences
                      .filter((f) =>
                        normalize(f + " " + t(f)).includes(normalize(search)),
                      )
                      .map((f) => (
                        <Chip
                          key={f}
                          label={f}
                          selected={(p.foodPreferences ?? []).includes(f)}
                          onPress={() =>
                            update({
                              foodPreferences: (
                                p.foodPreferences ?? []
                              ).includes(f)
                                ? (p.foodPreferences ?? []).filter(
                                    (x) => x !== f,
                                  )
                                : [...(p.foodPreferences ?? []), f],
                            })
                          }
                        />
                      ))
                  : null}
              </View>
            ) : null}
            {step === 1 ? (
              <View style={{ gap: 18, paddingTop: 12 }}>
                <SearchBar
                  accessibilityLabel="Search allergies"
                  placeholder="Search allergies or foods…"
                  value={search}
                  onChangeText={setSearch}
                />
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {allergens
                    .filter((a) =>
                      normalize(
                        a +
                          " " +
                          t(a) +
                          " " +
                          (allergySearchTerms[a] ?? "") +
                          " " +
                          t(allergySearchTerms[a] ?? ""),
                      ).includes(normalize(search)),
                    )
                    .map((a) => (
                      <Chip
                        key={a}
                        label={a}
                        selected={p.allergies.includes(a)}
                        onPress={() => {
                          setConfirmed(true);
                          update({
                            allergies: p.allergies.includes(a)
                              ? p.allergies.filter((x) => x !== a)
                              : [...p.allergies, a],
                          });
                        }}
                      />
                    ))}
                </View>

                <Row style={{ flexWrap: "wrap" }}>
                  {[
                    ...new Set([
                      ...(search.trim() ? otherAllergies : []),
                      ...(p.customAllergies ?? []),
                    ]),
                  ]
                    .filter((a) =>
                      normalize(a + " " + t(a)).includes(normalize(search)),
                    )
                    .map((a) => (
                      <Chip
                        key={a}
                        label={a}
                        selected={(p.customAllergies ?? []).includes(a)}
                        onPress={() => {
                          setConfirmed(true);
                          update({
                            customAllergies: (p.customAllergies ?? []).includes(
                              a,
                            )
                              ? (p.customAllergies ?? []).filter((x) => x !== a)
                              : [...(p.customAllergies ?? []), a],
                          });
                        }}
                      />
                    ))}
                </Row>
                {search.trim().length >= 2 &&
                !allergens.some((a) =>
                  normalize(
                    a +
                      " " +
                      t(a) +
                      " " +
                      (allergySearchTerms[a] ?? "") +
                      " " +
                      t(allergySearchTerms[a] ?? ""),
                  ).includes(normalize(search)),
                ) ? (
                  <Button
                    label={`Exclude “${search.trim()}”`}
                    secondary
                    onPress={() => {
                      setConfirmed(true);
                      update({
                        customAllergies: [
                          ...new Set([
                            ...(p.customAllergies ?? []),
                            search.trim(),
                          ]),
                        ],
                      });
                      setSearch("");
                    }}
                  />
                ) : null}
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked:
                      confirmed &&
                      !p.allergies.length &&
                      !(p.customAllergies ?? []).length,
                  }}
                  onPress={() => {
                    setConfirmed(true);
                    update({ allergies: [], customAllergies: [] });
                  }}
                  style={{ paddingVertical: 16 }}
                >
                  <Row>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderWidth: 1,
                        borderColor: c.text,
                        borderRadius: 6,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {confirmed &&
                      !p.allergies.length &&
                      !(p.customAllergies ?? []).length ? (
                        <Check size={17} color={c.text} />
                      ) : null}
                    </View>
                    <T>No food allergies</T>
                  </Row>
                </Pressable>
                <Row style={{ alignItems: "flex-start" }}>
                  <ShieldCheck color={c.muted} size={20} />
                  <T muted size={12} style={{ flex: 1 }}>
                    Always check labels and cross-contact risks. Cook cannot
                    guarantee an allergen-free meal.
                  </T>
                </Row>
              </View>
            ) : null}
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
                      {name}
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
