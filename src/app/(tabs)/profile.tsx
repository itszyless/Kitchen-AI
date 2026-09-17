import { useState } from "react";
import { useTranslate } from "@/i18n";
import { otherAllergies, allergySearchTerms } from "@/data/foodPreferences";
import { normalize } from "@/domain/matching";
import { LanguagePicker } from "@/components/LanguagePicker";
import { router } from "expo-router";
import { View, Pressable } from "react-native";
import {
  UserRound,
  ShoppingBasket,
  Bookmark,
  ChevronRight,
} from "lucide-react-native";
import { Screen, T, SearchBar, Chip, Row } from "@/components/ui";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
import { allergens } from "@/domain/types";
import { useAuth } from "@/services/supabase/AuthProvider";
import { supabase } from "@/services/supabase/client";
import { membership } from "@/services/entitlements";
import { Button } from "@/components/ui";
export default function Profile() {
  const [allergyQuery, setAllergyQuery] = useState("");
  const t = useTranslate();
  const { session } = useAuth();
  const p = useCook((s) => s.preferences);
  const update = useCook((s) => s.updatePreferences);
  const theme = useCook((s) => s.theme);
  const setTheme = useCook((s) => s.setTheme);
  const completed = useCook((s) => s.completed);
  const c = useTheme();
  return (
    <Screen>
      <LanguagePicker />
      <Row>
        <T size={32} bold>
          Profile
        </T>
      </Row>
      <Row style={{ paddingVertical: 14 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: c.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UserRound size={30} color={c.text} />
        </View>
        <View style={{ gap: 5, flex: 1 }}>
          <T bold size={23}>
            {session?.user.user_metadata?.username || "Home cook"}
          </T>
          <T muted size={13}>
            {completed} {completed === 1 ? "meal" : "meals"} made
          </T>
        </View>
      </Row>
      <T bold size={14}>
        {session ? membership.label : "Guest"}
      </T>
      <T muted size={12}>
        {session ? "Included with your account." : "Your kitchen is saved on this device. Create an account to use AI features."}
      </T>
      {session?.user.email ? (
        <T muted size={13}>
          {session.user.email}
        </T>
      ) : null}
      {!session ? <>
        <Button label="Create account" onPress={() => router.push({ pathname: "/auth", params: { mode: "register" } })} />
        <Button secondary label="Sign in" onPress={() => router.push("/auth")} />
      </> : <Button
        label="Sign out"
        secondary
        onPress={() => {
          void supabase?.auth.signOut();
        }}
      />}
      <View>
        {[
          {
            title: "My shopping list",
            icon: ShoppingBasket,
            route: "/shopping" as const,
          },
          {
            title: "Browse recipes & saves",
            icon: Bookmark,
            route: "/discover" as const,
          },
        ].map(({ title, icon: Icon, route }) => (
          <Pressable
            key={title}
            accessibilityRole="button"
            onPress={() => router.push(route)}
            style={{
              paddingVertical: 18,
              borderBottomWidth: 1,
              borderColor: c.border,
            }}
          >
            <Row>
              <Icon size={22} color={c.text} />
              <T style={{ flex: 1 }}>{title}</T>
              <ChevronRight color={c.muted} size={19} />
            </Row>
          </Pressable>
        ))}
      </View>
      <T bold size={24}>
        Preferences
      </T>
      <Button secondary label="Timer notifications" onPress={() => router.push("/notifications")} />
      <T bold>Appearance</T>
      <Row>
        {(["system", "light", "dark"] as const).map((t) => (
          <Chip
            key={t}
            label={t[0].toUpperCase() + t.slice(1)}
            selected={t === theme}
            onPress={() => setTheme(t)}
          />
        ))}
      </Row>
      <T bold>Food preferences</T>
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
      <T bold>Excluded allergens</T>
      <SearchBar
        accessibilityLabel="Search allergies"
        placeholder="Search allergies"
        value={allergyQuery}
        onChangeText={setAllergyQuery}
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {allergens
          .filter((a) =>
            normalize(
              a + " " + t(a) + " " + (allergySearchTerms[a] ?? ""),
            ).includes(normalize(allergyQuery)),
          )
          .map((a) => (
            <Chip
              key={a}
              label={a}
              selected={p.allergies.includes(a)}
              onPress={() =>
                update({
                  allergies: p.allergies.includes(a)
                    ? p.allergies.filter((x) => x !== a)
                    : [...p.allergies, a],
                })
              }
            />
          ))}
      </View>
      <Row style={{ flexWrap: "wrap" }}>
        {[
          ...new Set([
            ...(allergyQuery.trim() ? otherAllergies : []),
            ...(p.customAllergies ?? []),
          ]),
        ]
          .filter((a) =>
            normalize(a + " " + t(a)).includes(normalize(allergyQuery)),
          )
          .map((a) => (
            <Chip
              key={a}
              label={a}
              selected={(p.customAllergies ?? []).includes(a)}
              onPress={() =>
                update({
                  customAllergies: (p.customAllergies ?? []).includes(a)
                    ? p.customAllergies?.filter((x) => x !== a)
                    : [...(p.customAllergies ?? []), a],
                })
              }
            />
          ))}
      </Row>
      {allergyQuery.trim().length >= 2 ? (
        <Button
          secondary
          label="Add custom allergy"
          onPress={() => {
            update({
              customAllergies: [
                ...new Set([...(p.customAllergies ?? []), allergyQuery.trim()]),
              ],
            });
            setAllergyQuery("");
          }}
        />
      ) : null}
      <T size={13} muted>
        Always verify labels and cross-contact risks. Kitchen AI is not a substitute
        for checking food safety yourself.
      </T>
      <T bold>Product region · {p.country}</T>
      <Row style={{ flexWrap: "wrap" }}>
        {["AT", "DE", "US", "GB", "FR", "IT"].map((country) => (
          <Chip
            key={country}
            label={country}
            selected={country === p.country}
            onPress={() => update({ country })}
          />
        ))}
      </Row>

      <T size={12} muted>
        Kitchen AI · Made for your everyday kitchen.
      </T>
    </Screen>
  );
}
