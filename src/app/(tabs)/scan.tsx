import { router } from "expo-router";
import { View, Pressable } from "react-native";
import {
  ScanLine,
  Camera,
  Barcode,
  Search,
  ArrowUpRight,
} from "lucide-react-native";
import { Screen, T, Row, Panel, Button } from "@/components/ui";
import { useTheme } from "@/theme/useTheme";
export default function Scan() {
  const c = useTheme();
  return (
    <Screen>
      <T size={36} bold>
        What’s in your kitchen?
      </T>
      <T muted>Add it here. Turn it into dinner.</T>
      <View
        style={{
          backgroundColor: c.primary,
          borderRadius: 30,
          padding: 28,
          gap: 20,
        }}
      >
        <ScanLine size={54} color={c.onPrimary} />
        <T size={29} bold style={{ color: c.onPrimary }}>
          A fridge full of possibilities.
        </T>
        <T style={{ color: c.onPrimary }}>
          Fridge recognition is in development. Try the sample review to see how
          you’ll check every ingredient before adding it.
        </T>
        <Button
          secondary
          label="Try sample fridge scan"
          onPress={() => router.push("/review")}
        />
      </View>
      {[
        {
          icon: Barcode,
          title: "Scan a barcode",
          body: "Look up a packaged product",
          route: "/barcode" as const,
        },
        {
          icon: Search,
          title: "Search ingredients",
          body: "A few taps, and it’s in your pantry",
          route: "/add" as const,
        },
      ].map(({ icon: Icon, title, body, route }) => (
        <Pressable
          key={title}
          accessibilityRole="button"
          onPress={() => router.push(route)}
          style={{
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderColor: c.border,
          }}
        >
          <Row>
            <Icon size={27} color={c.primary} />
            <View style={{ flex: 1, gap: 4 }}>
              <T bold size={19}>
                {title}
              </T>
              <T muted size={14}>
                {body}
              </T>
            </View>
            <ArrowUpRight color={c.primary} />
          </Row>
        </Pressable>
      ))}
      <Panel>
        <Row>
          <Camera color={c.primary} />
          <T bold>Photo recognition, thoughtfully built</T>
        </Row>
        <T size={14} muted>
          Single-product and multi-ingredient photo recognition will share this
          review flow. No photos are uploaded and no AI service is connected in
          this preview.
        </T>
      </Panel>
    </Screen>
  );
}
