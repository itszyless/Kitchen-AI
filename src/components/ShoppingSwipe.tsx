import { PropsWithChildren, useEffect, useRef } from "react";
import { Pressable } from "react-native";
import Swipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { useReducedMotion } from "react-native-reanimated";
import { T } from "./ui";
import { useCook } from "@/state/store";
export function ShoppingSwipe({
  children,
  onDelete,
  first,
}: { onDelete: () => void; first: boolean } & PropsWithChildren) {
  const ref = useRef<SwipeableMethods>(null);
  const seen = useCook((s) => s.shoppingHintSeen);
  const mark = useCook((s) => s.markShoppingHint);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!first || seen || reduced) return;
    const open = setTimeout(() => ref.current?.openRight(), 500);
    const close = setTimeout(() => {
      ref.current?.close();
      mark();
    }, 2100);
    return () => {
      clearTimeout(open);
      clearTimeout(close);
    };
  }, [first, seen, mark, reduced]);
  return (
    <Swipeable
      ref={ref}
      overshootRight={false}
      rightThreshold={40}
      renderRightActions={() => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete item"
          onPress={onDelete}
          style={{
            backgroundColor: "#D93438",
            width: 84,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <T bold style={{ color: "white" }}>
            Delete
          </T>
        </Pressable>
      )}
    >
      {children}
    </Swipeable>
  );
}
