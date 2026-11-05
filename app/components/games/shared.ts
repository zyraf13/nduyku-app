"use client";
import { supabase } from "@/lib/supabase-browser";

export type Winner = "p1" | "p2" | "draw";

export async function record(game: string, winner: Winner) {
  const sb = supabase();
  await sb.from("game_results").insert({ game, winner });
  await sb.rpc("bump_stat", { winner });
}
