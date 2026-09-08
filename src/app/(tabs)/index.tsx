import { brand } from "@/theme/tokens";
import { router } from "expo-router";
import { View } from "react-native";
import { Leaf, ShoppingBasket, ArrowRight } from "lucide-react-native";
import {
  Screen,
  T,
  Row,
  IconButton,
  Panel,
  Button,
  Empty,
} from "@/components/ui";
import { RecipeCard } from "@/components/RecipeCard";
import { recipes } from "@/data/catalog";
import { eligible, match } from "@/domain/matching";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
export default function Home() {
  const c = useTheme();
  const p = useCook((s) => s.preferences);
  const pantry = useCook((s) => s.pantry);
  const ranked = recipes
    .filter((r) => eligible(r, p))
    .map((r) => ({ recipe: r, ...match(r, pantry) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(a.recipe.minutes > p.minutes) -
          Number(b.recipe.minutes > p.minutes),
    );
  const hero = ranked[0];
  return (
    <Screen>
      <Row style={{ justifyContent: "space-between" }}>
        <Row>
          <Leaf size={24} color={c.primary} />
          <T size={26} bold>
            {brand.name}
          </T>
        </Row>
        <IconButton
          icon={ShoppingBasket}
          label="Shopping list"
          onPress={() => router.push("/shopping")}
        />
      </Row>
      <View style={{ gap: 8 }}>
        <T size={12} muted bold style={{ letterSpacing: 2 }}>
          A LITTLE INSPIRATION FOR TODAY
        </T>
        <T size={38} bold>
          What should I{String.fromCharCode(10)}cook today?
        </T>
        <T muted>Something good is closer than you think.</T>
      </View>
      {hero ? (
        <>
          <Row style={{ justifyContent: "space-between" }}>
            <T bold size={18}>
              Your dinner, sorted
            </T>
            <T size={12} muted>
              {hero.recipe.minutes} MINUTES AWAY
            </T>
          </Row>
          <RecipeCard
            recipe={hero.recipe}
            score={pantry.length ? hero.score : undefined}
          />
        </>
      ) : (
        <Empty
          title="Let’s find another idea"
          body="No sample recipes fit your current preferences. Your allergy exclusions stay in place."
        />
      )}
      <Panel>
        <Row>
          <Leaf color={c.primary} />
          <T bold size={20} style={{ flex: 1 }}>
            {pantry.length
              ? "Good things in your pantry"
              : "Your fridge has potential."}
          </T>
        </Row>
        <T muted>
          {pantry.length
            ? pantry.length +
              " ingredients, plenty of possibilities. See what you can make."
            : "Add a few ingredients. We’ll do the dinner figuring-out."}
        </T>
        <Button
          label={pantry.length ? "Open my pantry" : "Meet your pantry"}
          secondary
          icon={ArrowRight}
          onPress={() => router.push(pantry.length ? "/pantry" : "/scan")}
        />
      </Panel>
      <Row style={{ justifyContent: "space-between" }}>
        <T size={24} bold>
          A little more inspiration
        </T>
      </Row>
      {ranked.slice(1).map((r) => (
        <RecipeCard key={r.recipe.id} recipe={r.recipe} compact />
      ))}
      <T size={12} muted>
        Preview collection · Original sample recipes. *Nutrition is illustrative
        and has not been verified.
      </T>
    </Screen>
  );
}
