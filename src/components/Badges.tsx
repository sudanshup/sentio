import { BADGES, UserStats } from '../lib/gamification';
import { Lock } from 'lucide-react';

interface BadgesProps {
    stats: UserStats | null;
}

export function Badges({ stats }: BadgesProps) {
    const unlockedIds = new Set(stats?.achievements || []);

    // Also consider inferred badges from stats locally if not yet synced
    // e.g. if we just hit 10 entries but DB async update hasn't reflected in achievement list yet
    // For simplicity, we trust the passed stats or derived inferred ones if we were passing full history.
    // Here we just render what we know.

    return (
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                Your Achievements
                <span className="text-xs font-normal text-muted-foreground ml-2">
                    ({unlockedIds.size} / {BADGES.length} Unlocked)
                </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {BADGES.map((badge) => {
                    // Check if unlocked locally based on current stats just in case
                    const isUnlocked = unlockedIds.has(badge.id) || (stats && badge.condition(stats));
                    const Icon = badge.icon;

                    return (
                        <div 
                            key={badge.id}
                            className={`
                                relative p-4 rounded-xl border flex flex-col items-center text-center transition-all duration-300
                                ${isUnlocked 
                                    ? 'bg-gradient-to-br from-background to-secondary/30 border-primary/20 shadow-sm scale-100' 
                                    : 'bg-muted/10 border-border/40 opacity-60 grayscale scale-95'
                                }
                            `}
                        >
                            <div className={`
                                p-3 rounded-full mb-3 
                                ${isUnlocked ? 'bg-background shadow-inner' : 'bg-muted'}
                            `}>
                                <Icon className={`w-6 h-6 ${isUnlocked ? badge.color : 'text-muted-foreground'}`} />
                            </div>
                            
                            <h3 className="font-semibold text-sm mb-1">{badge.name}</h3>
                            <p className="text-[10px] text-muted-foreground leading-tight px-1">
                                {badge.description}
                            </p>

                            {!isUnlocked && (
                                <div className="absolute top-2 right-2">
                                    <Lock className="w-3 h-3 text-muted-foreground/50" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
