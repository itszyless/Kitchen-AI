import { useState } from "react";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { View } from "react-native";
import { Check, LockKeyhole } from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/theme/useTheme";
import { Brand } from "./Brand";
import { AppIcon } from "./app-icon";
import { Button, Row, T } from "./ui";
import { CookSheet } from "./CookSheet";
export function PlusCard({ member }: { member: boolean }) {
  const c = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <>
      <View
        style={{
          borderRadius: 26,
          borderWidth: 1,
          borderColor: c.border,
          padding: 20,
          gap: 20,
          overflow: "hidden",
        }}
      >
        <Svg
          pointerEvents="none"
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0 }}
        >
          <Defs>
            <LinearGradient id="plusGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={c.dark ? "#484950" : "#CFD1D6"} />
              <Stop offset="0.5" stopColor={c.dark ? "#24252A" : "#ECEDEF"} />
              <Stop offset="1" stopColor={c.dark ? "#191A1F" : "#FFFFFF"} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#plusGradient)" />
        </Svg>
        <Row style={{ gap: 7 }}>
          <Brand width={145} />
          <T bold size={28} muted>
            +
          </T>
        </Row>
        <T bold size={19}>
          {member ? "Your Plus preview" : "A little more kitchen magic."}
        </T>
        <T size={12} muted>
          {member
            ? "Included free with your beta account."
            : "Create an account to try Plus free during the beta."}
        </T>
        <Row>
          <T bold size={12} style={{ flex: 1 }}>
            What’s included
          </T>
          <T size={12} style={{ width: 40, textAlign: "center" }}>
            Guest
          </T>
          <T bold size={12} style={{ width: 40, textAlign: "center" }}>
            Plus
          </T>
        </Row>
        {[
          ["Recipes & pantry", true],
          ["AI ingredient scanning", false],
          ["Up to 5 substitution ideas", false],
        ].map(([label, free]) => (
          <Row key={String(label)}>
            <T size={13} style={{ flex: 1 }}>
              {String(label)}
            </T>
            <View style={{ width: 40, alignItems: "center" }}>
              {free ? (
                <Check size={17} color={c.text} />
              ) : (
                <LockKeyhole size={15} color={c.muted} />
              )}
            </View>
            <View style={{ width: 40, alignItems: "center" }}>
              <Check size={17} color={c.text} />
            </View>
          </Row>
        ))}
        {!member ? (
          <Button
            label="Try Plus free"
            onPress={() =>
              router.push({ pathname: "/auth", params: { mode: "register" } })
            }
          />
        ) : null}
        <Button
          secondary
          label="See all features"
          onPress={() => setOpen(true)}
        />
      </View>
      <CookSheet
        title="Kitchen AI Plus"
        visible={open}
        onClose={() => setOpen(false)}
      >
        <AppIcon name="plus" size={36} />
        <T bold size={23}>
          More help with dinner.
        </T>
        <T>
          Scan ingredients, request tailored recipe ideas, and explore up to
          five substitution suggestions. AI features need an internet connection
          and are subject to usage limits.
        </T>
        <T muted>
          Plus is free for accounts during this beta. Purchases are not
          available yet. Future three-day trials will apply only to the yearly
          plan.
        </T>
        {!member ? (
          <Button
            label="Create an account"
            onPress={() => {
              setOpen(false);
              router.push({ pathname: "/auth", params: { mode: "register" } });
            }}
          />
        ) : null}
      </CookSheet>
    </>
  );
}
