import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react';

interface YearlyPixelsProps {
    entries: any[];
    year?: number;
}

// Color Palette Mapping
const EMOTION_COLORS: Record<string, string> = {
    joy: 'bg-yellow-400 hover:bg-yellow-500',
    happiness: 'bg-yellow-400 hover:bg-yellow-500',
    sadness: 'bg-blue-400 hover:bg-blue-500',
    sad: 'bg-blue-400 hover:bg-blue-500',
    anxiety: 'bg-orange-400 hover:bg-orange-500',
    fear: 'bg-purple-400 hover:bg-purple-500',
    anger: 'bg-red-500 hover:bg-red-600',
    disgust: 'bg-green-500 hover:bg-green-600',
    surprise: 'bg-pink-400 hover:bg-pink-500',
    love: 'bg-rose-400 hover:bg-rose-500',
    neutral: 'bg-slate-300 hover:bg-slate-400',
};

const DEFAULT_COLOR = 'bg-muted/30'; // Empty cell

export function YearlyPixels({ entries, year = new Date().getFullYear() }: YearlyPixelsProps) {
    
    // Process Data: "YYYY-MM-DD" -> Emotion
    const dailyEmotions = useMemo(() => {
        const map = new Map<string, string>();
        
        entries.forEach(entry => {
            const date = entry.created_at.split('T')[0];
            // If multiple entries, priority? Or just take last/first?
            // Let's take the one with the highest intensity score if available, otherwise just the last one.
            // For simplicity in this v1, simply taking the last one for that day (most recent state).
            // A better approach might be "average" but that's hard to colorize.
            
            let dominantEmotion = 'neutral';
            
            if (entry.primary_emotion) {
                dominantEmotion = entry.primary_emotion;
            } else if (entry.emotion_scores) {
                // Find max
                const [maxEmo] = Object.entries(entry.emotion_scores).sort((a:any, b:any) => b[1] - a[1])[0] || ['neutral'];
                dominantEmotion = maxEmo;
            }
            
            if (!map.has(date)) {
                map.set(date, dominantEmotion.toLowerCase());
            }
        });
        return map;
    }, [entries]);

    const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    
    // 31 Days Max
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const checkDateValidity = (day: number, monthIndex: number) => {
        const d = new Date(year, monthIndex, day);
        return d.getMonth() === monthIndex && d.getDate() === day;
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button className="p-1 hover:bg-muted rounded-full text-muted-foreground"><ChevronLeft className="w-5 h-5" /></button>
                    <h2 className="text-2xl font-bold">{year}</h2>
                    <button className="p-1 hover:bg-muted rounded-full text-muted-foreground"><ChevronRight className="w-5 h-5" /></button>
                </div>
                <div className="flex items-center gap-2">
                     <button className="p-2 hover:bg-muted rounded-full text-muted-foreground">
                        <Share2 className="w-5 h-5" />
                     </button>
                </div>
            </div>

            <div className="flex flex-col items-center">
                <h3 className="text-xl font-medium text-muted-foreground mb-6">Year in Pixels</h3>

                {/* The Grid */}
                <div className="flex gap-1 sm:gap-2 overflow-x-auto max-w-full pb-4 px-2">
                    {/* Y-Axis Labels (Days) */}
                    <div className="flex flex-col gap-1 sm:gap-1.5 pt-8 pr-2">
                         {days.map(d => (
                             <span key={d} className="text-[10px] sm:text-xs text-muted-foreground h-4 sm:h-6 flex items-center justify-end w-4">
                                 {d}
                             </span>
                         ))}
                    </div>

                    {/* Months Columns */}
                    {months.map((m, monthIdx) => (
                        <div key={monthIdx} className="flex flex-col gap-1 sm:gap-1.5 min-w-[20px]">
                            {/* Month Label */}
                            <div className="h-6 flex items-center justify-center text-xs font-bold text-muted-foreground mb-2">
                                {m}
                            </div>

                            {/* Day Cells */}
                            {days.map(day => {
                                const isValidDate = checkDateValidity(day, monthIdx);
                                if (!isValidDate) {
                                    return <div key={day} className="w-6 h-4 sm:h-6 sm:w-8" />; // Placeholder for layout alignment
                                }

                                const dateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const emotion = dailyEmotions.get(dateStr);
                                const colorClass = emotion ? (EMOTION_COLORS[emotion] || EMOTION_COLORS.neutral) : DEFAULT_COLOR;

                                return (
                                    <div 
                                        key={day}
                                        title={`${dateStr}: ${emotion || 'No entry'}`}
                                        className={`
                                            w-6 h-4 sm:h-6 sm:w-8 rounded-sm sm:rounded-md transition-all duration-200
                                            ${colorClass}
                                            ${emotion ? 'shadow-sm scale-[0.95] hover:scale-110 z-10' : ''}
                                        `}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-8 flex flex-wrap justify-center gap-4 max-w-2xl">
                    {Object.entries(EMOTION_COLORS).map(([emo, color]) => {
                         // Filter duplicates if any
                         if (['sad', 'happiness'].includes(emo)) return null; 
                         
                         return (
                            <div key={emo} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${color.split(' ')[0]}`} />
                                <span className="text-xs text-muted-foreground capitalize">{emo}</span>
                            </div>
                         );
                    })}
                </div>
            </div>
        </div>
    );
}
