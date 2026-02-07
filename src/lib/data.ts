import { supabase, isSupabaseConfigured } from './supabase';
import { EncryptedData } from './encryption';

export interface JournalEntry {
    id: string;
    encrypted_content: string;
    iv: string;
    salt: string;
    created_at: string;
    // Metadata (Unencrypted for Analytics)
    title?: string;
    primary_emotion?: string;
    emotion_scores?: Record<string, number>;
    word_count?: number;
    tags?: string[];
}

export class DataService {

    /**
     * Saves an encrypted entry to the database.
     * STRICT MODE: Requires Supabase. No LocalStorage fallback.
     */
    static async saveEntry(
        data: EncryptedData,
        metadata: {
            title?: string;
            emotion?: string;
            scores?: any;
            wordCount?: number
        } = {},
        entryId?: string
    ): Promise<{ success: boolean; id?: string; error?: string }> {

        const entry: any = {
            encrypted_content: data.encrypted,
            iv: data.iv,
            salt: data.salt,
            title: metadata.title || '', // Save Title
            primary_emotion: metadata.emotion,
            emotion_scores: metadata.scores || {},
            word_count: metadata.wordCount || 0,
            updated_at: new Date().toISOString(),
        };

        if (entryId) {
            entry.id = entryId;
        } else {
             entry.created_at = new Date().toISOString();
        }

        // 1. Check Config
        if (!isSupabaseConfigured() || !supabase) {
            console.error("Supabase not configured.");
            return { success: false, error: "Database not connected. Please check .env configuration." };
        }

        // 2. Insert/Update into Supabase
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return { success: false, error: "User not logged in" };
            }

            const { data: inserted, error } = await supabase
                .from('entries')
                .upsert([
                    {
                        ...entry,
                        user_id: user.id
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            console.log("Saved to Supabase:", inserted.id);

            // --- GAMIFICATION: Update Streak ---
            try {
                // 1. Get current stats
                const { data: settings } = await supabase
                    .from('user_settings')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                let streak = settings?.streak_count || 0;
                const lastDate = settings?.last_entry_date;

                if (lastDate !== today) {
                    // It's a new day
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];

                    if (lastDate === yesterdayStr) {
                        // Consecutive day
                        streak += 1;
                    } else {
                        // Streaming broken or first entry
                        streak = 1;
                    }

                    // Update DB
                    await supabase.from('user_settings').upsert({
                        user_id: user.id,
                        streak_count: streak,
                        last_entry_date: today,
                        updated_at: new Date().toISOString()
                    });
                }
            } catch (gErr) {
                console.error("Gamification update failed (non-critical):", gErr);
            }
            // -----------------------------------

            return { success: true, id: inserted.id };

        } catch (err: any) {
            console.error("Save Failed:", err);
            return { success: false, error: err.message || "Unknown database error" };
        }
    }

    /**
     * Deletes an entry by ID.
     */
    static async deleteEntry(id: string): Promise<{ success: boolean; error?: string }> {
        if (!isSupabaseConfigured() || !supabase) {
            return { success: false, error: "Database not connected" };
        }

        try {
            const { error } = await supabase
                .from('entries')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (err: any) {
            console.error("Delete Failed:", err);
            return { success: false, error: err.message };
        }
    }

    /**
     * Retrieves entries from Supabase.
     */
    static async getEntries(): Promise<JournalEntry[]> {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('entries')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) return data as JournalEntry[];
        }

        return [];
    }

    /**
     * Gets user settings/stats (Streaks, Preferences)
     */
    static async getUserSettings() {
        if (!isSupabaseConfigured() || !supabase) return null;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) return null;
        return data;
    }
}
