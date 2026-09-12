import { useRecipeTranslation } from "@/components/RecipeTranslation";
import { AISubstitutions } from "@/components/AISubstitutions";
import { useState } from "react";
import { Linking, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { Bookmark } from "lucide-react-native";
import { Screen, Back, T, Button, Row, Progress, Empty, IconButton } from "@/components/ui";
import {
  recipeLibrary,
  instructionSteps,
  libraryEligible,
} from "@/data/recipeLibrary";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";

export default function LibraryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = recipeLibrary.find((r) => r.id === id);
  const p = useCook((s) => s.preferences);
  const saved = useCook(s => s.saved.includes(id));
  const toggleSaved = useCook(s => s.toggleSaved);
  const complete = useCook(s => s.complete);
  const [selected, setSelected] = useState<number | null>(null);
  const [step, setStep] = useState<number | null>(null);
  const c = useTheme();
  const translation = useRecipeTranslation(recipe?.id ?? "", recipe ? [recipe.title, recipe.instructions, ...recipe.ingredients.map(i => i.name)] : []);
  if (!recipe || !libraryEligible(recipe, p))
    return (
      <Screen>
        <Back title="Recipe" />
        <Empty
          title="Recipe unavailable"
          body="This source has no verified allergy information for your exclusions."
        />
      </Screen>
    );
  const steps = instructionSteps(translation.texts[1]);
  return (
    <Screen
      footer={
        <Button
          label={
            step === null
              ? "Start cooking"
              : step < steps.length - 1
                ? "Next step"
                : "Finish cooking"
          }
          onPress={() => {
            if (step !== null && step === steps.length - 1) complete();
            setStep(step === null ? 0 : step < steps.length - 1 ? step + 1 : null);
          }}
        />
      }
    >
      <Row style={{justifyContent:"space-between"}}><Back title={step === null ? "Recipe" : "Cooking"} /><IconButton icon={Bookmark} label={saved ? "Unsave recipe" : "Save recipe"} active={saved} onPress={() => toggleSaved(id)} /></Row>
      {step === null ? (
        <>
          <Image
            source={recipe.image}
            contentFit="cover"
            style={{ height: 300, marginHorizontal: -20 }}
          />
          <T size={32} bold original>
            {translation.texts[0]}
          </T>
          {translation.control}
          <T muted>
            {recipe.cuisine} · {recipe.category}
          </T>
          <T size={12} muted>
            From TheMealDB · Community contributed
          </T>
          <T bold size={24}>
            Ingredients
          </T>
          {recipe.ingredients.map((i, n) => (
            <View key={n} style={{ gap: 12 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Substitutions for ${i.name}`}
                onPress={() => setSelected(selected === n ? null : n)}
              >
                <Row
                  style={{
                    justifyContent: "space-between",
                    borderBottomWidth: 1,
                    borderColor: c.border,
                    paddingBottom: 12,
                  }}
                >
                  <T original style={{ flex: 1 }}>{translation.texts[n + 2]}</T>
                  <T muted style={{ maxWidth: "45%" }}>
                    {i.measure}
                  </T>
                </Row>
              </Pressable>
              {selected === n ? (
                <AISubstitutions
                  ingredient={i.measure + " " + i.name}
                  recipe={recipe.title + "\n" + recipe.instructions}
                />
              ) : null}
            </View>
          ))}
          <T muted size={12}>
            Tap an ingredient to find a substitute for this recipe.
          </T>
          <T bold size={24}>
            Method
          </T>
          {steps.map((body, n) => (
            <View key={n} style={{ gap: 6 }}>
              <T bold>Step {n + 1}</T>
              <T original>{body}</T>
            </View>
          ))}
          {/^https:\/\//.test(recipe.sourceUrl) ? (
            <Button
              label="Read original source"
              secondary
              onPress={() => void Linking.openURL(recipe.sourceUrl)}
            />
          ) : null}
        </>
      ) : (
        <>
          <Row>
            <Progress value={((step + 1) / steps.length) * 100} />
            <T muted>
              {step + 1}/{steps.length}
            </T>
          </Row>
          <T muted original>{translation.texts[0]}</T>
          <T bold size={34}>
            Step {step + 1}
          </T>
          <T size={25} original>{steps[step]}</T>
          {step > 0 ? (
            <Button
              label="Previous step"
              secondary
              onPress={() => setStep(step - 1)}
            />
          ) : null}
        </>
      )}
    </Screen>
  );
}
