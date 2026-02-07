import { LucideIcon, Flame, Sprout, ShieldCheck, PenTool, Zap } from 'lucide-react';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string;
    condition: (stats: UserStats) => boolean;
}

export interface UserStats {
    totalEntries: number;
    currentStreak: number;
    lastEntryDate: string | null;
    achievements: string[]; // List of Badge IDs unlocked
}

export const BADGES: Badge[] = [
    {
        id: 'first_step',
        name: 'First Step',
        description: 'Created your first journal entry.',
        icon: Sprout,
        color: 'text-green-500',
        condition: (s) => s.totalEntries >= 1
    },
    {
        id: 'streak_3',
        name: 'Consistency',
        description: 'Wrote for 3 days in a row.',
        icon: Flame,
        color: 'text-orange-500',
        condition: (s) => s.currentStreak >= 3
    },
    {
        id: 'streak_7',
        name: 'Unstoppable',
        description: '7-day writing streak!',
        icon: Zap,
        color: 'text-yellow-500',
        condition: (s) => s.currentStreak >= 7
    },
    {
        id: 'pioneer',
        name: 'Pioneer',
        description: 'reached 10 total entries.',
        icon: PenTool,
        color: 'text-blue-500',
        condition: (s) => s.totalEntries >= 10
    },
    {
        id: 'secure',
        name: 'Vault Keeper',
        description: 'Setup encryption password.',
        icon: ShieldCheck,
        color: 'text-purple-500',
        condition: () => true // Logic handled elsewhere (always true if they can see badges)
    }
];

export class GamificationService {
    static checkNewBadges(stats: UserStats): Badge[] {
        const newBadges: Badge[] = [];
        const currentIds = new Set(stats.achievements);

        BADGES.forEach(badge => {
            if (!currentIds.has(badge.id) && badge.condition(stats)) {
                newBadges.push(badge);
            }
        });
        
        return newBadges;
    }
}
