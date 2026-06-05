import { createClient } from "../supabase/client";
import type { Discount } from "./types";

const supabase = createClient();

export async function fetchDiscounts(): Promise<Discount[]> {
  const { data, error } = await supabase
    .from("discounts")
    .select("*")
    .order("expires_at", { ascending: true, nullsFirst: true });

  if (error || !data) {
    console.error("Error fetching discounts:", error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type as "percent" | "fixed",
    value: Number(row.value),
    isActive: row.is_active,
    expiresAt: row.expires_at ?? undefined,
  }));
}

export async function insertDiscount(
  item: Omit<Discount, "id">
): Promise<void> {
  const { error } = await supabase.from("discounts").insert({
    name: item.name,
    type: item.type,
    value: item.value,
    is_active: item.isActive,
    expires_at: item.expiresAt || null,
  });

  if (error) console.error("Error inserting discount:", error);
}

export async function updateDiscount(
  id: string,
  item: Omit<Discount, "id">
): Promise<void> {
  const { error } = await supabase
    .from("discounts")
    .update({
      name: item.name,
      type: item.type,
      value: item.value,
      is_active: item.isActive,
      expires_at: item.expiresAt || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function toggleDiscountActive(
  id: string,
  isActive: boolean
): Promise<void> {
  const { error } = await supabase
    .from("discounts")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) console.error("Error toggling discount:", error);
}

export async function deleteDiscount(id: string): Promise<void> {
  const { error } = await supabase.from("discounts").delete().eq("id", id);

  if (error) console.error("Error deleting discount:", error);
}
