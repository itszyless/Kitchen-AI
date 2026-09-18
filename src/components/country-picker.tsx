import { useState } from "react";
import { Pressable, View } from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import { countries, countryFlag, countryName } from "@/domain/countries";
import { useTheme } from "@/theme/useTheme";
import { CookSheet } from "./CookSheet";
import { Row, T, SearchBar } from "./ui";
export function CountryPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const c = useTheme();
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choose country and product region"
        onPress={() => setOpen(true)}
        style={{
          padding: 16,
          backgroundColor: c.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: c.border,
        }}
      >
        <Row>
          <T style={{ flex: 1 }}>
            {value
              ? countryFlag(value) + "  " + countryName(value)
              : "Choose your country"}
          </T>
          <ChevronDown size={19} color={c.text} />
        </Row>
      </Pressable>
      <CookSheet
        title="Country & product region"
        visible={open}
        onClose={() => setOpen(false)}
      >
        <SearchBar
          accessibilityLabel="Search countries"
          placeholder="Search country"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
        <View>
          {countries
            .filter((item) =>
              (item.name + " " + item.code)
                .toLowerCase()
                .includes(query.trim().toLowerCase()),
            )
            .map((item) => (
              <Pressable
                key={item.code}
                accessibilityRole="radio"
                accessibilityState={{ checked: value === item.code }}
                onPress={() => {
                  onChange(item.code);
                  setOpen(false);
                  setQuery("");
                }}
                style={{ paddingVertical: 14 }}
              >
                <Row>
                  <T style={{ flex: 1 }}>
                    {countryFlag(item.code)} {item.name}
                  </T>
                  {value === item.code ? (
                    <Check color={c.text} size={18} />
                  ) : null}
                </Row>
              </Pressable>
            ))}
        </View>
      </CookSheet>
    </>
  );
}
