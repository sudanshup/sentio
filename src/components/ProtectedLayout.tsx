import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { EncryptionService } from '../lib/encryption';
import { LayoutDashboard, PenLine, BarChart2, Settings, LogOut, Lock, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import sentioLogo from '../assets/sentio-icon.png';

export default function ProtectedLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [masterKey, setMasterKey] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Sidebar items
    const navItems = [
        { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
        { icon: PenLine, label: 'Journal', path: '/write' },
        { icon: BarChart2, label: 'Insights', path: '/insights' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    useEffect(() => {
        // 1. Check if key was passed in state (from Login)
        if (location.state && location.state.masterKey) {
            setMasterKey(location.state.masterKey);
            setIsLoading(false);
            return;
        }

        // 2. If not, try to recover from localStorage wrapper (if user refresh)
        // BUT, we can't unwrap without password. 
        // So we must redirect to unlock screen if key is missing.
        // For MVP, we'll check if we have a stored key.
        if (EncryptionService.hasStoredKey()) {
            // We have a locked key, but no password to unlock it automatically here (unless we cached it, which is unsafe)
            // So we must trigger the "Unlock" flow or specific component.
            // However, this Layout wraps pages. If we don't have the key, we can render a global "Unlock Overlay" 
            // instead of the outlet.
            setIsLoading(false);
        } else {
            // No key setup at all? Redirect to Setup or Login
            navigate('/login');
        }

    }, [location, navigate]);

    const handleUnlock = (key: string) => {
        setMasterKey(key);
    };

    const handleLogout = async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        navigate('/');
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;

    // If we have an encrypted key but no masterKey in memory, show Unlock Screen
    if (!masterKey && EncryptionService.hasStoredKey()) {
       return <UnlockOverlay onUnlock={handleUnlock} />;
    }

    return (
        <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 border-r border-border bg-card hidden md:flex flex-col p-4">
                <div className="px-4 py-6 flex items-center gap-3 mb-4">
                    <img src={sentioLogo} alt="Sentio" className="w-10 h-10 rounded-xl shadow-sm" />
                    <span className="text-xl font-bold tracking-tight">Sentio</span>
                </div>
                
                <div className="mb-6 px-2">
                    <Link to="/write">
                        <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                            <Plus className="w-5 h-5" />
                            New Entry
                        </button>
                    </Link>
                </div>

                <nav className="flex-1 space-y-1 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path}
                                state={{ masterKey }} 
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    isActive 
                                    ? 'bg-primary/10 text-primary font-semibold' 
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-border mt-auto">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Nav (Bottom) - simplified */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 flex justify-around p-2">
                 {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path}
                                state={{ masterKey }} 
                                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        )
                    })}
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative">
                <Outlet context={{ masterKey }} />
            </main>
        </div>
    );
}

// Temporary Inline Unlock Component for this Layout
const UnlockOverlay = ({ onUnlock }: { onUnlock: (k: string) => void }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const k = EncryptionService.unwrapKey(password);
            onUnlock(k);
        } catch(e) {
            setError("Incorrect password");
        }
    }

    return (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-card p-8 rounded-xl shadow-2xl border border-border">
                <div className="text-center mb-6">
                     <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">Unlock Session</h2>
                    <p className="text-sm text-muted-foreground mt-1">Please enter your password to continue.</p>
                </div>
                <form onSubmit={handleUnlock} className="space-y-4">
                    <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3"
                        placeholder="Password"
                        autoFocus
                    />
                    {error && <p className="text-xs text-destructive">{error}</p>}
                    <button className="w-full h-10 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90">
                        Unlock
                    </button>
                </form>
            </div>
        </div>
    )
}
