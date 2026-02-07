import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Brain } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DataService } from '../lib/data';
import { UserStats } from '../lib/gamification';
import { Badges } from '../components/Badges';


import { YearlyPixels } from '../components/YearlyPixels';


export default function Insights() {
    const [data, setData] = useState<any[]>([]);
    const [dataFull, setDataFull] = useState<any[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Fetch Real Data
                const [entries, userSettings] = await Promise.all([
                    DataService.getEntries(),
                    DataService.getUserSettings()
                ]);
                setDataFull(entries);

                // 2. Calculate Stats
                const totalEntries = entries.length;
                let currentStreak = userSettings?.streak_count || 0;
                const lastEntryDate = userSettings?.last_entry_date;

                // VALIDATION: Same logic as Dashboard
                if (entries.length === 0) {
                    currentStreak = 0;
                } else if (lastEntryDate) {
                    const today = new Date(); // Use local today for consistency in this view
                    
                    // Check if last entry wasn't today or yesterday.
                    const todayStr = today.toISOString().split('T')[0];
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];

                    if (lastEntryDate !== todayStr && lastEntryDate !== yesterdayStr) {
                         currentStreak = 0;
                    }
                }
                
                setStats({
                    totalEntries,
                    currentStreak,
                    lastEntryDate: userSettings?.last_entry_date || null,
                    achievements: [] 
                });

                // 3. Aggregate Data for Charts (Last 7 Days)
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d.toISOString().split('T')[0];
                });

                const chartData = last7Days.map(date => {
                    const dayEntries = entries.filter(e => e.created_at.startsWith(date));
                    
                    // Initialize sums
                    const acc: any = { date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }), joy: 0, sadness: 0, anxiety: 0, neutral: 0 };
                    
                    if (dayEntries.length > 0) {
                        dayEntries.forEach(entry => {
                            // Use stored scores if available, else fallback to primary emotion count
                            if (entry.emotion_scores) {
                                Object.entries(entry.emotion_scores).forEach(([emotion, score]) => {
                                    if (acc[emotion] !== undefined) acc[emotion] += (score as number) * 100;
                                });
                            } else if (entry.primary_emotion && acc[entry.primary_emotion] !== undefined) {
                                acc[entry.primary_emotion] += 100;
                            }
                        });

                        // Average intensity
                        ['joy', 'sadness', 'anxiety', 'neutral'].forEach(key => {
                            acc[key] = Math.round(acc[key] / dayEntries.length);
                        });
                    }
                    return acc;
                });

                setData(chartData);

            } catch (error) {
                console.error("Failed to load dashboard data", error);
            }
        };

        loadData();
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans p-8 overflow-y-auto">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Insights & Analytics
                    </h1>
                    <p className="text-muted-foreground mt-1">Deep dive into your emotional patterns.</p>
                </div>
            </header>

            <main className="space-y-8 pb-20">

                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Dominant Mood</span>
                        </div>
                        {/* Calculate Dominant Mood from Chart Data */}
                        {(() => {
                            let maxScore = 0;
                            let mood = "Neutral";
                            if (data.length > 0) {
                                const totals: any = { joy: 0, sadness: 0, anxiety: 0, neutral: 0 };
                                data.forEach(d => {
                                    totals.joy += d.joy;
                                    totals.sadness += d.sadness;
                                    totals.anxiety += d.anxiety;
                                    totals.neutral += d.neutral;
                                });
                                Object.entries(totals).forEach(([k, v]) => {
                                    if ((v as number) > maxScore) {
                                        maxScore = v as number;
                                        mood = k.charAt(0).toUpperCase() + k.slice(1);
                                    }
                                });
                            }
                            return (
                                <>
                                    <div className="text-2xl font-bold">{mood}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Based on recent entries</p>
                                </>
                            );
                        })()}
                    </div>

                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Streak</span>
                        </div>
                        <div className="text-2xl font-bold">{stats?.currentStreak || 0} Days</div>
                        <p className="text-xs text-muted-foreground mt-1">Keep it up!</p>
                    </div>

                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Entries Analyzed</span>
                        </div>
                        <div className="text-2xl font-bold">{stats?.totalEntries || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total encrypted sessions</p>
                    </div>
                </div>

                {/* Yearly Pixels (Year in Review) */}
                <YearlyPixels entries={dataFull} />

                {/* Badges Section */}
                <Badges stats={stats} />

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Main Trend Chart */}
                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm col-span-1 lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                Weekly Mood Trends
                            </h2>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorJoy" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorSadness" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="joy" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorJoy)" />
                                    <Area type="monotone" dataKey="sadness" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSadness)" />
                                    <Area type="monotone" dataKey="anxiety" stroke="#ef4444" strokeWidth={2} fillOpacity={0} fill="transparent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Stacked Breakdown */}
                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                        <h2 className="text-lg font-semibold mb-6">Emotion Distribution</h2>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                    <Legend />
                                    <Bar dataKey="joy" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="neutral" stackId="a" fill="#94a3b8" />
                                    <Bar dataKey="anxiety" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Insights */}
                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Recent Insights</h2>
                        <div className="space-y-4">
                            {stats && stats.totalEntries > 5 ? (
                                <div className="p-3 bg-muted/40 rounded-lg text-sm">
                                    <p className="font-medium">Developing Pattern</p>
                                    <p className="text-muted-foreground">You are consistently tracking your emotions. Keep journaling to unlock deeper AI insights!</p>
                                </div>
                            ) : (
                                <div className="p-3 bg-muted/40 rounded-lg text-sm">
                                    <p className="font-medium">Not Enough Data</p>
                                    <p className="text-muted-foreground">Write at least 5 entries to start seeing AI-detected patterns and triggers.</p>
                                </div>
                            )}
                        </div>
                    </div>



                </div>
            </main>
        </div>
    );
}
