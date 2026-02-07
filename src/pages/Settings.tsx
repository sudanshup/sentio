import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, KeyRound, Database } from 'lucide-react';
import { ExportData } from '../components/ExportData';

export default function Settings() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
             if (!supabase) return;
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    const handleChangePassword = () => {
        // This is tricky because changing password breaks encryption key wrapping
        // For MVP, we warn the user or just link to Supabase password reset
        alert("Changing password currently requires resetting your journal encryption. This feature is coming soon.");
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Settings
                </h1>
                <p className="text-muted-foreground mt-2">Manage your account and preferences.</p>
            </div>

            <div className="grid gap-6">
                {/* Account Section */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-primary" />
                        Account & Security
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <p className="text-base">{user?.email}</p>
                        </div>
                        <div className="pt-4">
                            <button 
                                onClick={handleChangePassword}
                                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                            >
                                Change Password
                            </button>
                            <p className="text-xs text-muted-foreground mt-2">
                                Note: Your journal encryption is tied to your password.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Data Management */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
                     <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Database className="w-5 h-5 text-primary" />
                        Data Management
                    </h2>
                    <div className="space-y-4">
                        <div>
                             <label className="text-sm font-medium text-muted-foreground block mb-2">Export Data</label>
                             <ExportData />
                        </div>
                    </div>
                </div>

                {/* Data Zone */}
                <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-destructive flex items-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        Danger Zone
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Irreversible actions related to your data.
                    </p>
                    <button 
                        className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors"
                        onClick={() => alert("Deletion is permanent. Are you sure?")}
                    >
                        Delete All Entries
                    </button>
                </div>
            </div>
        </div>
    );
}
