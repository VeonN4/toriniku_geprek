import { createClient } from "../supabase/client";
import type { Category } from "./types";

const supabase = createClient();

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
  }));
}
