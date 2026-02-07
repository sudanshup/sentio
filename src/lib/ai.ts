import { HfInference } from "@huggingface/inference";

export interface EmotionResult {
    label: string;
    score: number;
}

export class AIService {
    // We use the Inference API because it is more stable for auth than raw Space connections
    private static readonly HF_TOKEN = import.meta.env.VITE_HF_API_TOKEN;
    private static readonly HF_ENDPOINT = import.meta.env.VITE_HF_ENDPOINT;
    
    // Using a top-tier public emotion model directly via Inference API
    // This bypasses the need for a custom space to be running flawlessly
    private static readonly MODEL_ID = "j-hartmann/emotion-english-distilroberta-base";

    /**
     * Analyzes the emotion of the given text.
     */
    static async analyzeEmotion(text: string): Promise<EmotionResult[]> {
        if (!text || text.length < 5) return [];

        console.log("Analyzing emotion via HF Inference API:", text.length);

        if (!this.HF_TOKEN) {
             console.error("Missing VITE_HF_API_TOKEN in .env");
             return [{ label: "error (missing token)", score: 0 }];
        }

        try {
            // Configure for Private Space if Endpoint provided
            const hf = new HfInference(this.HF_TOKEN, {
                endpointUrl: this.HF_ENDPOINT
            });
            
            // Text Classification call
            const result = await hf.textClassification({
                model: this.HF_ENDPOINT ? undefined : this.MODEL_ID, // If endpoint is set, it usually implies the model
                inputs: text
            });

            console.log("Inference Result:", result);

            // Result is already sorted by score usually, but let's be safe
            // Format: [{ label: 'joy', score: 0.99 }, ...]
            return result
                .map(item => ({ label: item.label.toLowerCase(), score: item.score }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);

        } catch (error) {
            console.error("AI Service Error:", error);
            return [{ label: "neutral", score: 0.5 }];
        }
    }

    /**
     * Extracts top 3 keywords/topics from text, ignoring common stopwords.
     */
    static extractKeywords(text: string): string[] {
        if (!text) return [];

        const stopWords = new Set([
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there',
            'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
            'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
            'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work',
            'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'felt', 'feel', 'feeling',
            'was', 'were', 'had', 'has', 'been', 'am', 'is', 'are'
        ]);

        const words = text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2 && !stopWords.has(w));

        const frequency: Record<string, number> = {};
        words.forEach(w => {
            frequency[w] = (frequency[w] || 0) + 1;
        });

        return Object.entries(frequency)
            .sort((a, b) => b[1] - a[1]) // Sort by count desc
            .slice(0, 3) // Top 3
            .map(([word]) => word);
    }
}
