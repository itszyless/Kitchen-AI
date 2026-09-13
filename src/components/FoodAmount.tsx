import { useState } from "react";
import { Button, T, Field, Row, Chip } from "./ui";
import type { PantryItem, Unit } from "@/domain/types";
import { quantitySchema } from "@/features/pantry/validation";
export function FoodAmount({
  item,
  onAdd,
}: {
  item: PantryItem;
  onAdd: (item: PantryItem) => void;
}) {
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [unit, setUnit] = useState<Unit>(item.unit);
  const [error, setError] = useState(false);
  return (
    <>
      <T bold size={28}>
        {item.name}
      </T>
      <T muted>How much do you have?</T>
      <Field
        accessibilityLabel="Quantity"
        keyboardType="decimal-pad"
        value={quantity}
        onChangeText={setQuantity}
      />
      <Row>
        {(["g", "ml", "piece"] as const).map((u) => (
          <Chip
            key={u}
            label={u}
            selected={unit === u}
            onPress={() => setUnit(u)}
          />
        ))}
      </Row>
      {error ? (
        <T accessibilityRole="alert">Enter an amount greater than zero.</T>
      ) : null}
      <Button
        label="Add to pantry"
        onPress={() => {
          const q = quantitySchema.safeParse(quantity);
          if (!q.success) {
            setError(true);
            return;
          }
          onAdd({ ...item, quantity: q.data, unit, expires: undefined });
        }}
      />
    </>
  );
}
