import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Pencil, 
    Calendar, 
    Sparkles,
    Flame, 
    ArrowRight, 
    Quote, 
    Layout,
    Trash2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DataService } from '../lib/data';

interface DashboardStats {
    todaysEntries: number;
    todaysMood: string;
    totalWords: number;
    streak: number;
}

export default function Dashboard() {
    const [userName, setUserName] = useState("Friend");
    const [stats, setStats] = useState<DashboardStats>({
        todaysEntries: 0,
        todaysMood: "Neutral",
        totalWords: 0,
        streak: 0
    });
    const [recentEntries, setRecentEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // 1. User Profile
            if (!supabase) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata?.first_name) {
                setUserName(user.user_metadata.first_name);
            }

            // 2. Fetch Entries
            const entries = await DataService.getEntries();
            const userSettings = await DataService.getUserSettings();
            setAllEntries(entries);

            // 3. Calculate Stats
            const today = new Date().toISOString().split('T')[0];
            const todaysEntriesList = entries.filter(e => e.created_at.startsWith(today));
            
            // Mood (Most frequent today, or neutral)
            let mood = "Neutral";
            if (todaysEntriesList.length > 0) {
                // Simple logic: take the last one or calculate dominance
                mood = todaysEntriesList[0].primary_emotion || "Neutral";
                // Capitalize
                mood = mood.charAt(0).toUpperCase() + mood.slice(1);
            }

            // Word Count
            const totalWords = entries.reduce((acc, curr) => acc + (curr.word_count || 0), 0);

            // Streak Logic (Same as before)
            let currentStreak = userSettings?.streak_count || 0;
            const lastEntryDate = userSettings?.last_entry_date;

            // Validate Streak
            if (entries.length === 0) {
                currentStreak = 0;
            } else if (lastEntryDate) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                if (lastEntryDate !== today && lastEntryDate !== yesterdayStr) {
                    currentStreak = 0;
                }
            }

            setStats({
                todaysEntries: todaysEntriesList.length,
                todaysMood: mood,
                totalWords: totalWords,
                streak: currentStreak
            });

            // 4. Recent Entries
            setRecentEntries(entries.slice(0, 3));

        } catch (error) {
            console.error("Dashboard load failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this entry?")) return;
        try {
            await DataService.deleteEntry(id);
            setRecentEntries(prev => prev.filter(e => e.id !== id));
            // Reload stats to be accurate
            loadData();
        } catch (error) {
            alert("Failed to delete");
        }
    };

    // Mock Weekly Streak (Mon-Sun)
    const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    
    // Calculate which days of the current week (Mon-Sun) have entries
    // This is a simple approximation. Ideally we'd get the actual start of week date.
    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };
    
    // COLOR PALETTE (Matched with YearlyPixels)
    const emotionColors: Record<string, string> = {
        joy: 'bg-yellow-400',
        happiness: 'bg-yellow-400',
        sadness: 'bg-blue-400',
        sad: 'bg-blue-400',
        anxiety: 'bg-orange-400',
        fear: 'bg-purple-400', // Matched User Request
        anger: 'bg-red-500',
        disgust: 'bg-green-500',
        surprise: 'bg-pink-400',
        love: 'bg-rose-400',
        neutral: 'bg-slate-300',
    };
    
    // We need 'entries' in state to calculate streak visual correctly
    const [allEntries, setAllEntries] = useState<any[]>([]);

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
    
    // Calculate active indices on render from allEntries
    const activeIndices = new Set<number>();
    if (allEntries.length > 0) {
        const today = new Date();
        const day = today.getDay(); 
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); 
        const startOfWeek = new Date(today);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        
        allEntries.forEach(e => {
             const d = new Date(e.created_at);
             d.setHours(0,0,0,0);
             const dayDiff = Math.floor((d.getTime() - startOfWeek.getTime()) / (1000 * 3600 * 24));
             if (dayDiff >= 0 && dayDiff <= 6) activeIndices.add(dayDiff);
        });
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-8">
                
                {/* 1. Greeting */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {getTimeGreeting()}, <span className="text-primary">{userName}</span>
                        </h1>
                        <p className="text-muted-foreground mt-1">Ready to unpack your thoughts today?</p>
                    </div>
                </div>

                {/* 2. Stats Row (Moved to Top) */}
                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                    <div className="grid grid-cols-3 gap-6">
                        {/* Today's Mood (Replaces Longest Streak, Moved First) */}
                        <div className="text-center group cursor-default">
                            <div className="mx-auto w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-2xl font-bold tracking-tight">{stats.todaysMood}</p>
                             <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Today's Mood</p>
                        </div>

                        {/* Today's Entries (Moved Center) */}
                        <div className="text-center group cursor-default">
                            <div className="mx-auto w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold tracking-tight">{stats.todaysEntries}</p>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Today's Entries</p>
                        </div>

                        {/* Total Words (Moved Right) */}
                        <div className="text-center group cursor-default">
                            <div className="mx-auto w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <Pencil className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-2xl font-bold tracking-tight">{stats.totalWords}</p>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Words</p>
                        </div>
                    </div>
                </div>

                {/* 3. Streak Section */}
                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Flame className={`w-5 h-5 ${stats.streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-muted-foreground'}`} />
                        <span className="font-bold text-lg">{stats.streak} Day Streak</span>
                    </div>
                    
                    {/* Weekly Visual */}
                    <div className="flex justify-between max-w-lg mx-auto px-4">
                        {weekDays.map((day, i) => {
                            const isActive = activeIndices.has(i);
                            return (
                                <div key={i} className="flex flex-col items-center gap-3">
                                    <Flame className={`w-5 h-5 ${isActive ? 'text-orange-500 fill-orange-500' : 'text-muted/20'}`} />
                                    <span className={`text-xs font-bold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Quote Card */}
                <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl relative">
                     <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />
                     <p className="text-lg italic font-medium text-foreground/80 mb-2 pr-8">
                        "Feelings are something you have; not something you are."
                     </p>
                     <p className="text-sm text-primary font-bold">— Shannon L. Alder</p>
                </div>

                {/* 5. Write New Entry Banner (Moved Down) */}
                <Link to="/write" className="block group">
                    <div className="bg-gradient-to-r from-primary to-purple-600 p-8 rounded-2xl shadow-lg flex items-center justify-between transition-all transform hover:scale-[1.01] hover:shadow-xl">
                        <div>
                            <div className="flex items-center gap-2 text-primary-foreground mb-2">
                                <Pencil className="w-5 h-5" />
                                <h2 className="text-xl font-bold">Write New Entry</h2>
                            </div>
                            <p className="text-primary-foreground/90 max-w-md">Clear your mind. Our AI will help you understand your emotions in real-time.</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                            <ArrowRight className="w-6 h-6" />
                        </div>
                    </div>
                </Link>

                {/* 6. Recent Entries */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                         <h2 className="text-lg font-bold flex items-center gap-2">
                            <Layout className="w-5 h-5 text-muted-foreground" />
                            Recent Entries
                         </h2>
                         <Link to="/insights" className="text-sm text-primary font-medium hover:underline">View All &rarr;</Link>
                    </div>

                    {recentEntries.length === 0 ? (
                        <div className="border border-dashed border-border rounded-xl p-8 text-center bg-muted/30">
                            <p className="text-muted-foreground text-sm">No entries yet. Start your journey today!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentEntries.map(entry => (
                                <div key={entry.id} className="bg-card border border-border p-4 rounded-xl flex items-center justify-between hover:shadow-sm transition-all group hover:border-primary/20">
                                    <Link to={`/write?id=${entry.id}`} className="flex-1 flex items-center gap-4">
                                         {/* Emotion Color Stripe */}
                                         <div className={`w-1.5 h-12 rounded-full ${emotionColors[entry.primary_emotion?.toLowerCase()] || 'bg-slate-300'}`} />
                                         
                                         <div>
                                             {/* Title */}
                                             <h3 className="font-bold text-foreground text-base">
                                                 {entry.title || new Date(entry.created_at).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                             </h3>
                                             
                                             {/* Metadata: Emotion + Time */}
                                             <div className="flex items-center gap-3 mt-1.5">
                                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md capitalize ${emotionColors[entry.primary_emotion?.toLowerCase()]?.replace('bg-', 'bg-opacity-20 text-') || 'bg-muted text-muted-foreground'}`}>
                                                    {entry.primary_emotion || 'Unanalyzed'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(entry.created_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                                </span>
                                             </div>
                                         </div>
                                    </Link>

                                    <button 
                                        onClick={() => handleDelete(entry.id)}
                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
