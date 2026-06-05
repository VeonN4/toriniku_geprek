import { createClient } from "../supabase/client";
import type { Modifier } from "./types";

const supabase = createClient();

export async function fetchModifiers(): Promise<Modifier[]> {
  const { data, error } = await supabase.from("modifiers").select("*");

  if (error || !data) {
    console.error("Error fetching modifiers:", error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    menuItemId: row.menu_item_id,
    name: row.name,
    priceDelta: Number(row.price_delta),
  }));
}

export async function insertModifier(
  menuItemId: string,
  name: string,
  priceDelta: number
): Promise<Modifier> {
  const { data, error } = await supabase
    .from("modifiers")
    .insert({ menu_item_id: menuItemId, name, price_delta: priceDelta })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    menuItemId: data.menu_item_id,
    name: data.name,
    priceDelta: Number(data.price_delta),
  };
}

export async function updateModifier(
  modifierId: string,
  name: string,
  priceDelta: number
): Promise<void> {
  const { error } = await supabase
    .from("modifiers")
    .update({ name, price_delta: priceDelta })
    .eq("id", modifierId);

  if (error) throw new Error(error.message);
}

export async function deleteModifier(modifierId: string): Promise<void> {
  const { error } = await supabase.from("modifiers").delete().eq("id", modifierId);

  if (error) throw new Error(error.message);
}
