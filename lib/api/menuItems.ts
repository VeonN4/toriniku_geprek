import { createClient } from "../supabase/client";
import type { MenuItem } from "./types";

const supabase = createClient();

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_archived", false);

  if (error || !data) {
    console.error("Error fetching menu items:", error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    price: Number(row.price),
    category: row.category_id || "",
    status: row.is_available ? "Ready" : "Habis",
    note: row.description ?? undefined,
  }));
}

export async function insertMenuItem(
  item: Omit<MenuItem, "id">
): Promise<void> {
  const { error } = await supabase.from("menu_items").insert({
    name: item.name,
    price: item.price,
    category_id: item.category || null,
    is_available: item.status === "Ready",
  });

  if (error) console.error("Error inserting menu item:", error);
}

export async function insertMenuItemWithModifiers(
  item: Omit<MenuItem, "id">,
  modifiers: { name: string; priceDelta: number }[]
): Promise<{ menuItemId: string }> {
  const { data: itemData, error: itemError } = await supabase
    .from("menu_items")
    .insert({
      name: item.name,
      price: item.price,
      category_id: item.category || null,
      is_available: item.status === "Ready",
      description: item.note || null,
    })
    .select("id")
    .single();

  if (itemError || !itemData) {
    throw new Error(itemError?.message || "Gagal menyimpan menu");
  }

  if (modifiers.length > 0) {
    const modifiersPayload = modifiers.map((mod) => ({
      menu_item_id: itemData.id,
      name: mod.name,
      price_delta: mod.priceDelta,
    }));

    const { error: modError } = await supabase
      .from("modifiers")
      .insert(modifiersPayload);

    if (modError) {
      console.error("Error inserting modifiers:", modError);
      throw new Error(modError.message || "Gagal menyimpan modifier");
    }
  }

  return { menuItemId: itemData.id };
}

export async function updateMenuItem(
  id: string,
  fields: { name?: string; price?: number; category_id?: string | null; description?: string | null; is_available?: boolean }
): Promise<void> {
  const { error } = await supabase
    .from("menu_items")
    .update(fields)
    .eq("id", id);

  if (error) console.error("Error updating menu item:", error);
}

export async function updateMenuItemStatus(
  id: string,
  status: "Ready" | "Habis"
): Promise<void> {
  const { error } = await supabase
    .from("menu_items")
    .update({ is_available: status === "Ready" })
    .eq("id", id);

  if (error) console.error("Error updating menu item status:", error);
}

export async function archiveMenuItem(id: string): Promise<void> {
  const { error } = await supabase
    .from("menu_items")
    .update({ is_archived: true })
    .eq("id", id);

  if (error) console.error("Error archiving menu item:", error);
}
