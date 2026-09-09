import appIcon from "../../../assets/images/app-icon.png";
import { router } from "expo-router";
import { View, Pressable } from "react-native";
import { Image } from "expo-image";
import {
  Refrigerator,
  Barcode,
  Search,
  Carrot,
  ChevronRight,
} from "lucide-react-native";
import { Screen, T, Row } from "@/components/ui";
import { useTheme } from "@/theme/useTheme";
export default function Scan() {
  const c = useTheme();
  return (
    <Screen style={{ gap: 24 }}>
      <T bold size={32}>
        Add to your kitchen
      </T>
      <T muted>Start with what you have.</T>
      <View style={{ alignItems: "center", paddingVertical: 8 }}>
        <Image
          source={appIcon}
          style={{ width: 136, height: 136, borderRadius: 32 }}
        />
      </View>
      <View>
        {[
          {
            icon: Refrigerator,
            title: "Scan fridge",
            body: "Review a sample fridge scan",
            route: "/review" as const,
          },
          {
            icon: Carrot,
            title: "Scan ingredients",
            body: "Try the ingredient review demo",
            route: "/review" as const,
          },
          {
            icon: Barcode,
            title: "Scan barcode",
            body: "Add a packaged product",
            route: "/barcode" as const,
          },
          {
            icon: Search,
            title: "Search manually",
            body: "Find an ingredient by name",
            route: "/add" as const,
          },
        ].map(({ icon: Icon, title, body, route }) => (
          <Pressable
            key={title}
            accessibilityRole="button"
            accessibilityLabel={title}
            onPress={() => router.push(route)}
            style={{
              paddingVertical: 18,
              borderBottomWidth: 1,
              borderColor: c.border,
            }}
          >
            <Row>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 15,
                  backgroundColor: c.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon color={c.text} size={24} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <T bold size={17}>
                  {title}
                </T>
                <T muted size={12}>
                  {body}
                </T>
              </View>
              <ChevronRight color={c.muted} size={20} />
            </Row>
          </Pressable>
        ))}
      </View>
      <T muted size={12}>
        Photo recognition is a demo for now. You review every item before it
        reaches your pantry; no photos are uploaded.
      </T>
    </Screen>
  );
}
