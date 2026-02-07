import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { EncryptionService } from '../lib/encryption';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, Mail, Lock, ArrowRight, AlertCircle, User } from 'lucide-react';

export default function Auth() {
    const location = useLocation();
    const isSignupInitial = location.pathname === '/signup';
    
    const [isSignup, setIsSignup] = useState(isSignupInitial);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!supabase) {
            setError("Supabase client is not configured.");
            setLoading(false);
            return;
        }

        try {
            if (isSignup) {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match.");
                }
                
                if (fullName.trim().length === 0) {
                    throw new Error("Full Name is required.");
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            first_name: fullName
                        }
                    }
                });
                if (error) throw error;
                
                // Unified Auth: Setup Encryption for new user
                // Overwrite any existing key since this is a new account setup
                const newMasterKey = EncryptionService.generateMasterKey();
                EncryptionService.wrapAndStoreKey(newMasterKey, password);
                
                // Check if we need to auto-login (depends on email confirmation)
                 const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                
                if (signInError) {
                    setError("Account created! Please check your email to confirm if required.");
                } else {
                    // Pass the unlocked key to avoid "Welcome Back" screen
                    navigate('/dashboard', { state: { masterKey: newMasterKey } });
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                // Unified Auth: Try to unlock encryption with login password
                let masterKey = null;
                try {
                    if (EncryptionService.hasStoredKey()) {
                        masterKey = EncryptionService.unwrapKey(password);
                    }
                } catch (encErr) {
                    console.warn("Encryption password differs from login password", encErr);
                    // Do nothing, let user unlock manually on next screen
                }

                navigate('/dashboard', { state: { masterKey } });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl shadow-lg border border-border animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {isSignup ? 'Create an account' : 'Welcome back'}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {isSignup ? 'Start your mindful journey today' : 'Enter your details to sign in'}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleAuth}>
                    <div className="space-y-4">
                        {isSignup && (
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background pl-10 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="Full Name"
                                />
                            </div>
                        )}
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Email address"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Password"
                            />
                        </div>
                        {isSignup && (
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background pl-10 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="Confirm Password"
                                />
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                            <AlertCircle className="h-4 w-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isSignup ? 'Sign Up' : 'Sign In')}
                        {!loading && <ArrowRight className="h-4 w-4" />}
                    </button>
                </form>

                <div className="text-center text-sm">
                    <button
                        type="button"
                        onClick={() => setIsSignup(!isSignup)}
                        className="text-primary hover:underline hover:text-primary/80 transition-colors"
                    >
                        {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </button>
                    <div className="mt-4">
                        <Link to="/" className="text-muted-foreground hover:text-foreground text-xs">
                             &larr; Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
