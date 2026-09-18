import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { View, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { ShoppingBasket, ChevronRight } from "lucide-react-native";
import { Screen, T, Row, Button, SectionHeader } from "@/components/ui";
import { AppIcon } from "@/components/app-icon";
import { GlassSurface } from "@/components/glass-surface";
import { PlusCard } from "@/components/plus-card";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
import { useAuth } from "@/services/supabase/AuthProvider";
import { supabase } from "@/services/supabase/client";
import { countryFlag, countryName } from "@/domain/countries";
import { recipeLibrary, libraryEligible } from "@/data/recipeLibrary";
type OwnRecipe = { id: string; title: string; status: string; minutes: number };
export default function Profile() {
  const { session } = useAuth();
  const p = useCook((s) => s.preferences);
  const completed = useCook((s) => s.completed);
  const c = useTheme();
  const [own, setOwn] = useState<OwnRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const userId = session?.user.id;
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setOwn([]);
      setError("");
      if (!userId || !supabase) return;
      setLoading(true);
      void supabase
        .from("recipes")
        .select("id,title,status,minutes")
        .eq("author_id", userId)
        .order("created_at", { ascending: false })
        .limit(30)
        .then(
          ({ data, error }) => {
            if (!active) return;
            setLoading(false);
            if (error)
              setError(
                "Could not load your recipes. Please check your connection.",
              );
            else setOwn(data ?? []);
          },
          () => {
            if (active) {
              setLoading(false);
              setError("Could not load your recipes. Please try again.");
            }
          },
        );
      return () => {
        active = false;
      };
    }, [userId]),
  );
  const community = recipeLibrary
    .filter((r) => libraryEligible(r, p))
    .slice(0, 6);
  const avatar = session?.user.user_metadata?.avatar_url;
  return (
    <Screen style={{ gap: 24 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <T bold size={27}>
          Profile
        </T>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          onPress={() => router.push("/settings")}
        >
          <GlassSurface
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AppIcon name="settings" size={22} />
          </GlassSurface>
        </Pressable>
      </Row>
      <Row style={{ gap: 17 }}>
        <View
          style={{
            width: 78,
            height: 78,
            borderRadius: 39,
            overflow: "hidden",
            backgroundColor: c.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {typeof avatar === "string" && avatar.startsWith("https://") ? (
            <Image source={{ uri: avatar }} style={{ width: 78, height: 78 }} />
          ) : (
            <AppIcon name="profile" size={38} filled />
          )}
        </View>
        <View style={{ flex: 1, gap: 10 }}>
          <Row style={{ gap: 6, flexWrap: "wrap" }}>
            <T bold size={22}>
              {session?.user.user_metadata?.username || "Home cook"}
            </T>
            {session?.user.email_confirmed_at ? (
              <View accessible accessibilityLabel="Email verified">
                <AppIcon name="verified" size={20} color="#198CCD" />
              </View>
            ) : null}
            {session ? (
              <View accessible accessibilityLabel="Plus beta preview">
                <AppIcon name="plus" size={21} />
              </View>
            ) : null}
          </Row>
          {session ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/edit-profile")}
              style={{
                alignSelf: "flex-start",
                backgroundColor: c.primary,
                borderRadius: 30,
                paddingHorizontal: 16,
                minHeight: 44,
                justifyContent: "center",
              }}
            >
              <Row style={{ gap: 7 }}>
                <AppIcon name="edit" size={16} color={c.onPrimary} />
                <T size={13} bold style={{ color: c.onPrimary }}>
                  Edit profile
                </T>
              </Row>
            </Pressable>
          ) : (
            <T muted size={13}>
              Your kitchen, on this device.
            </T>
          )}
        </View>
      </Row>
      {p.showCountry === true ? (
        <View
          style={{
            padding: 16,
            borderRadius: 17,
            borderWidth: 1,
            borderColor: c.border,
          }}
        >
          <T size={14}>
            {countryFlag(p.country)} {countryName(p.country)}
          </T>
        </View>
      ) : null}
      <T muted size={13}>
        {completed} {completed === 1 ? "meal cooked" : "meals cooked"}
      </T>
      {!session ? (
        <Row>
          <View style={{ flex: 1 }}>
            <Button
              label="Create account"
              onPress={() =>
                router.push({ pathname: "/auth", params: { mode: "register" } })
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              secondary
              label="Sign in"
              onPress={() => router.push("/auth")}
            />
          </View>
        </Row>
      ) : null}
      <View style={{ gap: 12 }}>
        <SectionHeader title="Your recipes" />
        <T muted size={13}>
          {!session
            ? "Sign in to see recipes connected to your account."
            : loading
              ? "Loading your recipes…"
              : error ||
                (own.length
                  ? "Your drafts and published recipes."
                  : "No recipes created yet.")}
        </T>
        {own.map((r) => (
          <View
            key={r.id}
            style={{
              padding: 16,
              borderRadius: 16,
              backgroundColor: c.surface,
            }}
          >
            <T bold size={15}>
              {r.title}
            </T>
            <T muted size={12}>
              {r.minutes} min · {r.status}
            </T>
          </View>
        ))}
      </View>
      {p.showDiet === true || p.showAllergies === true ? (
        <View
          style={{
            gap: 12,
            borderRadius: 20,
            backgroundColor: c.surface,
            padding: 18,
          }}
        >
          {p.showDiet === true ? (
            <>
              <T bold size={15}>
                Food preferences
              </T>
              <T muted size={13}>
                {[p.diet, ...(p.foodPreferences ?? [])].join(" · ")}
              </T>
            </>
          ) : null}
          {p.showAllergies === true ? (
            <>
              <T bold size={15}>
                Allergies
              </T>
              <T muted size={13}>
                {[...p.allergies, ...(p.customAllergies ?? [])].join(" · ") ||
                  "No food allergies"}
              </T>
            </>
          ) : null}
        </View>
      ) : null}
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Community recipes"
          action="See all"
          onPress={() => router.push("/discover")}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        >
          {community.map((r) => (
            <Pressable
              key={r.id}
              accessibilityRole="button"
              accessibilityLabel={r.title}
              onPress={() =>
                router.push({ pathname: "/library/[id]", params: { id: r.id } })
              }
              style={{ width: 156, gap: 8 }}
            >
              <Image
                source={{ uri: r.image }}
                style={{ width: 156, height: 114, borderRadius: 17 }}
                contentFit="cover"
              />
              <T bold size={13} numberOfLines={2}>
                {r.title}
              </T>
            </Pressable>
          ))}
        </ScrollView>
        <T muted size={11}>
          {community.length
            ? "Recipes contributed to TheMealDB."
            : "Community recipes do not have verified allergen data, so none are shown for these preferences."}
        </T>
      </View>
      <PlusCard member={Boolean(session)} />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/shopping")}
        style={{ paddingVertical: 10 }}
      >
        <Row>
          <ShoppingBasket color={c.text} size={21} />
          <T style={{ flex: 1 }} size={14}>
            Shopping list
          </T>
          <ChevronRight color={c.muted} size={18} />
        </Row>
      </Pressable>
    </Screen>
  );
}
