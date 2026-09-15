import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform, View } from "react-native";
import { useState } from "react";
import { Button } from "./ui";
import { useTheme } from "@/theme/useTheme";
import { useLanguage } from "@/i18n";
import { birthDateString } from "@/domain/birth-date";
export function BirthDatePicker({ value, onChange }: { value?: string; onChange: (date: string) => void }) {
  const c = useTheme();
  const language = useLanguage(s => s.language);
  const [open, setOpen] = useState(false);
  const today = new Date();
  const date = value ? new Date(`${value}T12:00:00`) : new Date(today.getFullYear() - 18, 0, 1);
  return <View style={{ gap: 18 }}>
    {Platform.OS === "android" ? <Button secondary label={value ? date.toLocaleDateString(language) : "Choose date of birth"} onPress={() => setOpen(true)} /> : null}
    {Platform.OS === "ios" || open ? <DateTimePicker value={date} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} maximumDate={today} minimumDate={new Date(today.getFullYear() - 120, today.getMonth(), today.getDate())} themeVariant={c.dark ? "dark" : "light"} locale={language} onChange={(event, selected) => { setOpen(false); if (event.type === "set" && selected) onChange(birthDateString(selected)); }} /> : null}
    {Platform.OS === "ios" && !value ? <Button secondary label="Use this date" onPress={() => onChange(birthDateString(date))} /> : null}
  </View>;
}
