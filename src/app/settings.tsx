import { useState } from "react";
import { View, Switch } from "react-native";
import { router } from "expo-router";
import { Screen, Back, T, Row, Chip, SearchBar, Button } from "@/components/ui";
import { LanguagePicker } from "@/components/LanguagePicker";
import { CountryPicker } from "@/components/country-picker";
import { NotificationSwitch } from "@/components/notification-switch";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
import { useTranslate } from "@/i18n";
import { allergens } from "@/domain/types";
import { otherAllergies, allergySearchTerms } from "@/data/foodPreferences";
import { normalize } from "@/domain/matching";
import { useAuth } from "@/services/supabase/AuthProvider";
import { supabase } from "@/services/supabase/client";
export default function Settings() {
  const [allergyQuery, setAllergyQuery] = useState("");
  const [message, setMessage] = useState("");
  const t = useTranslate();
  const { session } = useAuth();
  const p = useCook((s) => s.preferences);
  const update = useCook((s) => s.updatePreferences);
  const theme = useCook((s) => s.theme);
  const setTheme = useCook((s) => s.setTheme);
  const c = useTheme();
  return (
    <Screen>
      <Back title="Settings" />
      <LanguagePicker />
      {session ? (
        <Button
          secondary
          label="Edit profile"
          onPress={() => router.push("/edit-profile")}
        />
      ) : (
        <Button
          label="Sign in or create an account"
          onPress={() => router.push("/auth")}
        />
      )}
      <NotificationSwitch />
      <Button
        secondary
        label="Notification options"
        onPress={() => router.push("/notifications")}
      />
      <T bold>Country & product region</T>
      <CountryPicker
        value={p.country}
        onChange={(country) => update({ country })}
      />
      <T bold>Profile visibility</T>
      {(
        [
          ["showCountry", "Show country"],
          ["showDiet", "Show food preferences"],
          ["showAllergies", "Show allergies"],
        ] as const
      ).map(([key, label]) => (
        <Row key={key} style={{ justifyContent: "space-between" }}>
          <T size={14} style={{ flex: 1 }}>
            {label}
          </T>
          <Switch
            accessibilityLabel={label}
            value={p[key] === true}
            onValueChange={(value) => update({ [key]: value })}
            trackColor={{ true: c.primary }}
          />
        </Row>
      ))}
      <T muted size={12}>
        These choices control your profile. Public profile sharing is not
        available in this beta.
      </T>
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
        Always verify labels and cross-contact risks. Kitchen AI is not a
        substitute for checking food safety yourself.
      </T>

      {session ? (
        <Button
          secondary
          label="Sign out"
          onPress={() => {
            void supabase?.auth
              .signOut()
              .then(({ error }) => {
                if (error) setMessage(error.message);
                else router.replace("/profile");
              })
              .catch(() => setMessage("Could not sign out. Try again."));
          }}
        />
      ) : null}
      {message ? <T accessibilityRole="alert">{message}</T> : null}
    </Screen>
  );
}
