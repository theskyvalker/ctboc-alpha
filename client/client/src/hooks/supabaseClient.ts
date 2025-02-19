import { createClient } from "@supabase/supabase-js";

const {
    VITE_PUBLIC_SUPABASE_URL,
    VITE_PUBLIC_SUPABASE_ANON_KEY,
} = import.meta.env;

const supabaseUrl = VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = VITE_PUBLIC_SUPABASE_ANON_KEY;

// Function to fetch all game names
export async function fetchGameNames() {
    const { data, error } = await supabase.from("game_mapping").select("*");
    if (error) {
        console.error("Error fetching game names:", error);
        return [];
    }
    console.log(data);
    return data;
}

// Function to update a game name
export async function updateGameName(gameId: number, gameName: string) {
    const { data, error } = await supabase
        .from("game_mapping")
        .upsert({ id: gameId, game_name: gameName }, { onConflict: "id" });
    if (error) {
        console.error("Error updating game name:", error);
        return null;
    }
    return data;
}

export async function fetchPinnedGames(): Promise<number[]> {
    const { data, error } = await supabase.from("pinned_games").select(
        "game_id",
    );
    if (error) {
        console.error("Error fetching pinned games:", error);
        return [];
    }
    return data.map(({ game_id }) => game_id);
}

export async function addPinnedGame(gameId: number) {
    const { data, error } = await supabase.from("pinned_games").insert([{
        game_id: gameId,
    }]);
    if (error) {
        console.error("Error adding pinned game:", error);
        return null;
    }
    return data;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
