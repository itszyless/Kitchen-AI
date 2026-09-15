import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { useLanguage } from "@/i18n";
import { T, Button } from "./ui";
function Wheel({ values, value, onChange, label }: { values: { value: number; label: string }[]; value: number; onChange: (value: number) => void; label: string }) {
  const c = useTheme();
  const interacted = useRef(false);
  const element = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => { const index = values.findIndex(v => v.value === value); if (element.current && index >= 0) element.current.scrollTop = index * 44; }, [value, values]);
  useEffect(() => () => clearTimeout(timer.current), []);
  return <div onWheel={() => { interacted.current = true; }} onPointerDown={() => { interacted.current = true; }} onKeyDown={() => { interacted.current = true; }} ref={element} role="listbox" aria-label={label} style={{ height: 220, overflowY: "auto", scrollSnapType: "y mandatory", scrollbarWidth: "none", flex: 1, paddingBlock: 88, boxSizing: "border-box" }} onScroll={() => {
    if (!interacted.current) return;
    clearTimeout(timer.current); timer.current = setTimeout(() => { const index = Math.round((element.current?.scrollTop ?? 0) / 44); if (values[index]) onChange(values[index].value); }, 120);
  }}>{values.map(item => <button type="button" role="option" aria-selected={item.value === value} key={item.value} onClick={() => onChange(item.value)} style={{ display: "block", height: 44, width: "100%", scrollSnapAlign: "center", border: 0, borderRadius: 8, background: item.value === value ? c.surface : "transparent", color: item.value === value ? c.text : c.muted, fontFamily: "SFRegular", fontSize: 20, cursor: "pointer" }}>{item.label}</button>)}</div>;
}
export function BirthDatePicker({ value, onChange }: { value?: string; onChange: (date: string) => void }) {
  const { language } = useLanguage();
  const now = new Date();
  const [parts, setParts] = useState(value ? value.split("-").map(Number) : [now.getFullYear() - 18, 1, 1]);
  const change = (index: number, nextValue: number) => { const next = [...parts]; next[index] = nextValue; next[2] = Math.min(next[2], new Date(next[0], next[1], 0).getDate()); setParts(next); onChange(next.map((n, i) => String(n).padStart(i === 0 ? 4 : 2, "0")).join("-")); };
  return <View style={{ gap: 12 }}><View style={{ flexDirection: "row", gap: 8 }}>
    <Wheel label="Month" value={parts[1]} onChange={n => change(1, n)} values={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(2000, i, 1).toLocaleString(language, { month: "short" }) }))} />
    <Wheel label="Day" value={parts[2]} onChange={n => change(2, n)} values={Array.from({ length: new Date(parts[0], parts[1], 0).getDate() }, (_, i) => ({ value: i + 1, label: String(i + 1) }))} />
    <Wheel label="Year" value={parts[0]} onChange={n => change(0, n)} values={Array.from({ length: 121 }, (_, i) => ({ value: now.getFullYear() - 120 + i, label: String(now.getFullYear() - 120 + i) }))} />
  </View>{!value ? <><T muted size={13}>Choose your date of birth.</T><Button secondary label="Use this date" onPress={() => change(0, parts[0])} /></> : null}</View>;
}
