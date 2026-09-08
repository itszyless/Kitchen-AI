import { brand } from "@/theme/tokens";
import { useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ArrowRight, Leaf } from "lucide-react-native";
import { Screen, T, Button, Chip, Row, Panel, Back } from "@/components/ui";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
import { allergens } from "@/domain/types";
import { recipes } from "@/data/catalog";
export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const p = useCook((s) => s.preferences);
  const update = useCook((s) => s.updatePreferences);
  const finish = useCook((s) => s.finishOnboarding);
  const c = useTheme();
  const done = (scan: boolean) => {
    finish();
    router.replace(scan ? "/scan" : "/");
  };
  return (
    <Screen>
      {step > 0 ? (
        <Back title="Your kitchen, your way" />
      ) : (
        <Row>
          <Leaf color={c.primary} />
          <T bold size={28}>
            {brand.name}
          </T>
        </Row>
      )}
      <Row>
        {[0, 1, 2, 3].map((n) => (
          <View
            key={n}
            style={{
              height: 4,
              flex: 1,
              borderRadius: 5,
              backgroundColor: n <= step ? c.primary : c.border,
            }}
          />
        ))}
      </Row>
      {step === 0 ? (
        <>
          <Image
            source={recipes[1].image}
            style={{ height: 300, borderRadius: 32 }}
            contentFit="cover"
          />
          <T size={40} bold>
            Less wondering.{String.fromCharCode(10)}More cooking.
          </T>
          <T muted size={18}>
            Turn what you have into something you’ll love. A little inspiration,
            a helping hand, and dinner is on.
          </T>
          <Button
            label="Make it mine"
            icon={ArrowRight}
            onPress={() => setStep(1)}
          />
          <T size={12} muted>
            No account needed. Your kitchen stays on this device for now.
          </T>
        </>
      ) : null}
      {step === 1 ? (
        <>
          <T size={34} bold>
            First, what’s off the menu?
          </T>
          <T muted>
            Choose every allergy we should exclude from recipe recommendations.
          </T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {allergens.map((a) => (
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
            <Chip
              label="No food allergies"
              selected={confirmed && p.allergies.length === 0}
              onPress={() => {
                setConfirmed(true);
                update({ allergies: [] });
              }}
            />
          </View>
          <Panel>
            <T size={14}>
              Always check ingredient labels and cross-contact risks yourself,
              especially with serious allergies. Cook cannot guarantee that a
              meal is allergen-free.
            </T>
          </Panel>
          <Button
            label="Continue"
            disabled={!confirmed}
            onPress={() => setStep(2)}
          />
        </>
      ) : null}
      {step === 2 ? (
        <>
          <T size={34} bold>
            Let’s find your kind of food.
          </T>
          <T bold>Your way of eating</T>
          <Row style={{ flexWrap: "wrap" }}>
            {(["Anything", "Vegetarian", "Vegan"] as const).map((d) => (
              <Chip
                key={d}
                label={d}
                selected={p.diet === d}
                onPress={() => update({ diet: d })}
              />
            ))}
          </Row>
          <T bold>Most nights, I have…</T>
          <Row>
            {[15, 30, 60].map((m) => (
              <Chip
                key={m}
                label={m + " min"}
                selected={p.minutes === m}
                onPress={() => update({ minutes: m })}
              />
            ))}
          </Row>
          <T bold>At home in the kitchen</T>
          <Row style={{ flexWrap: "wrap" }}>
            {(["Getting started", "Comfortable", "Confident"] as const).map(
              (skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  selected={p.skill === skill}
                  onPress={() => update({ skill })}
                />
              ),
            )}
          </Row>
          <T bold>Cooking for {p.household}</T>
          <Row>
            {[1, 2, 3, 4, 6].map((n) => (
              <Chip
                key={n}
                label={String(n)}
                selected={p.household === n}
                onPress={() => update({ household: n })}
              />
            ))}
          </Row>
          <Button label="Nearly there" onPress={() => setStep(3)} />
        </>
      ) : null}
      {step === 3 ? (
        <>
          <T size={36} bold>
            You’re ready to Cook.
          </T>
          <T muted>
            Start with your fridge, or find your next favorite recipe. It’s your
            kitchen.
          </T>
          <T bold>Product region · {p.country}</T>
          <T muted size={14}>
            Suggested from your device region. No location tracking.
          </T>
          <Row style={{ flexWrap: "wrap" }}>
            {[
              ["AT", "Austria"],
              ["DE", "Germany"],
              ["US", "United States"],
              ["GB", "United Kingdom"],
              ["FR", "France"],
              ["IT", "Italy"],
            ].map(([code, name]) => (
              <Chip
                key={code}
                label={name}
                selected={p.country === code}
                onPress={() => update({ country: code })}
              />
            ))}
          </Row>
          <Button label="Scan my fridge" onPress={() => done(true)} />
          <Button
            label="Explore recipes"
            secondary
            onPress={() => done(false)}
          />
        </>
      ) : null}
      {step > 0 ? (
        <Button
          label="Previous step"
          secondary
          onPress={() => setStep((s) => s - 1)}
        />
      ) : null}
    </Screen>
  );
}
