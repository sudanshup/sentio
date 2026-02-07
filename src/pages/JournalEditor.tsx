import { useState, useEffect, useRef } from 'react';
import { RichTextEditor } from '../components/RichTextEditor';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { EncryptionService } from '../lib/encryption';
import { AIService, EmotionResult } from '../lib/ai';
import { DataService } from '../lib/data';
import { LayoutTemplate, Loader2, ArrowRight, Lock, KeyRound, Save, TrendingUp, Hash, X, Sparkles, Trash2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

/* --- Setup Component (Same as before) --- */
const SetupScreen = ({ onSetupComplete }: { onSetupComplete: (key: string) => void }) => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSetup = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 4) {
            setError("Password must be at least 4 characters");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        }
        setIsLoading(true);

        setTimeout(() => {
            const mk = EncryptionService.generateMasterKey();
            EncryptionService.wrapAndStoreKey(mk, password);
            EncryptionService.setSessionKey(mk); // Persist
            onSetupComplete(mk);
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-xl shadow-lg border border-border">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Secure Your Journal</h2>
                    <p className="mt-2 text-muted-foreground text-sm">
                        Create a password to encrypt your entries.
                        <br /><strong className="text-destructive">Warning: If you forget this, your data is lost.</strong>
                    </p>
                </div>
                <form className="mt-6 space-y-4" onSubmit={handleSetup}>
                    <input
                        type="password"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Create Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Confirm Password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Set Password and Unlock'}
                    </button>
                </form>
            </div>
        </div>
    );
};

/* --- Unlock Component (Same as before) --- */
const UnlockScreen = ({ onUnlock, entryId }: { onUnlock: (key: string) => void, entryId?: string | null }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        setTimeout(() => {
            try {
                const mk = EncryptionService.unwrapKey(password);
                if (!mk) throw new Error("Decryption failed");
                EncryptionService.setSessionKey(mk); // Persist
                onUnlock(mk);
            } catch (err) {
                setError("Incorrect password");
            } finally {
                setIsLoading(false);
            }
        }, 500);
    };

    const handleDelete = async () => {
        if (!entryId) return;
        if (confirm("Delete this encrypted entry? This cannot be undone.")) {
            setIsDeleting(true);
            const res = await DataService.deleteEntry(entryId);
            if (res.success) {
                window.location.href = '/dashboard';
            } else {
                setError("Failed to delete entry");
                setIsDeleting(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-xl shadow-lg border border-border">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <KeyRound className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Welcome Back</h2>
                    <p className="mt-2 text-muted-foreground text-sm">Enter your password to unlock your journal.</p>
                </div>
                <form className="mt-6 space-y-4" onSubmit={handleUnlock}>
                    <input
                        type="password"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading || isDeleting}
                        className="w-full inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Unlock Journal'}
                    </button>
                    
                    {entryId && (
                        <div className="pt-4 border-t border-border mt-4">
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full inline-flex items-center justify-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
                            >
                                {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                Delete Entry Without Unlocking
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

/* --- Main Editor --- */
export default function JournalEditor() {
    const [masterKey, setMasterKey] = useState<string | null>(null);
    const [hasKey, setHasKey] = useState<boolean>(false);
    const [checking, setChecking] = useState(true);

    const [content, setContent] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [sessionStats, setSessionStats] = useState<{ emotions: EmotionResult[]; keywords: string[] } | null>(null);
    const [showModal, setShowModal] = useState(false);
    
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const entryId = params.get('id');

    // Format: "Sunday, February 1, 2026"
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    useEffect(() => {
        // Unified Auth: Check if key was passed from Login/Signup OR exists in Session
        if (location.state && location.state.masterKey) {
             const mk = location.state.masterKey;
             setMasterKey(mk);
             EncryptionService.setSessionKey(mk); // Persist
             setHasKey(true);
             setChecking(false);
        } else {
             // Check session storage first (survives reload)
             const sessionKey = EncryptionService.getSessionKey();
             if (sessionKey) {
                 setMasterKey(sessionKey);
                 setHasKey(true);
                 setChecking(false);
                 return;
             }

             // Otherwise check if we have a stored wrapped key
             const exists = EncryptionService.hasStoredKey();
             setHasKey(exists);
             setChecking(false);
        }
    }, [location]);

    const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
    const [lastSavedContent, setLastSavedContent] = useState('');
    
    // Refs for concurrency control to prevent duplicates
    const isSavingRef = useRef(false);
    const entryIdRef = useRef<string | null>(null);
    const pendingSaveRef = useRef(false); // Tracks if a save request came in while saving

    // Load Entry if ID is present
    useEffect(() => {
        const loadEntry = async () => {
             // entryId is now derived from outer scope params
             if (entryId && masterKey) {
                 try {
                     const entries = await DataService.getEntries();
                     const entry = entries.find(e => e.id === entryId);
                     if (entry) {
                         setCurrentEntryId(entry.id);
                         entryIdRef.current = entry.id; // Sync ref
                         
                         // Decrypt
                         const encryptedData = {
                             encrypted: entry.encrypted_content,
                             iv: entry.iv,
                             salt: entry.salt,
                             algorithm: 'AES-256-CBC'
                         };
                         const decrypted = await EncryptionService.decrypt(encryptedData, masterKey);
                         setContent(decrypted);
                         setLastSavedContent(decrypted);
                         // Set stats if available
                         if (entry.emotion_scores) {
                             // Reconstruct stats object roughly
                             const emotions = Object.entries(entry.emotion_scores).map(([label, score]) => ({ label, score: score as number }));
                             setSessionStats({ emotions: emotions, keywords: [] }); // Keywords might not be saved? Check schema.
                         }
                         setSaveStatus('saved');
                     }
                 } catch (e) {
                     console.error("Failed to load entry", e);
                 }
             }
        };
        loadEntry();
    }, [entryId, masterKey]); // Updated dependency

    // Manual Save / Auto Save Logic
    const handleSave = async (isAuto = true) => {
        if (!content || !masterKey) return;

        // If manual save and no changes, show modal immediately
        if (!isAuto && content === lastSavedContent && saveStatus === 'saved') {
            setShowModal(true);
            return;
        }

        // Concurrency Control
        if (isSavingRef.current) {
            // If already saving, mark as pending to save again after
            pendingSaveRef.current = true;
            return;
        }

        isSavingRef.current = true;
        if (!isAuto) setSaveStatus('saving');

        try {
            // 1. Encrypt
            const encryptedData = EncryptionService.encrypt(content, masterKey);

            // 2. AI Analysis (Strip HTML)
            let metadata: any = { wordCount: content.split(/\s+/).filter(w => w.length > 0).length };
            const plainText = content.replace(/<[^>]+>/g, ' ');

            // Extract Title
            // 1. Look for explicit headers
            const titleMatch = content.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
            let rawTitle = titleMatch ? titleMatch[1] : '';

            // 2. Fallback: First text block (p, div, etc)
            if (!rawTitle) {
                const firstBlockEndIndex = content.indexOf('</');
                if (firstBlockEndIndex !== -1) {
                    const firstBlock = content.slice(0, firstBlockEndIndex);
                    rawTitle = firstBlock.replace(/<[^>]+>/g, '').trim();
                } else {
                    rawTitle = content.slice(0, 50);
                }
            }
            metadata.title = rawTitle.replace(/<[^>]+>/g, '').trim().slice(0, 50) || 'Untitled';

            if (plainText.length > 5) {
                try {
                    // Parallelize analysis (Non-blocking)
                    const [emotions, keywords] = await Promise.all([
                        AIService.analyzeEmotion(plainText).catch(err => {
                            console.warn("AI Analysis Failed (Skipping):", err);
                            return []; // Return empty on failure
                        }),
                        Promise.resolve(AIService.extractKeywords(plainText)) 
                    ]);

                    if (emotions.length > 0) {
                        setSessionStats({ emotions: emotions.slice(0, 3), keywords });
                        metadata.emotion = emotions[0].label;
                        metadata.scores = emotions.reduce((acc: any, curr: any) => ({ ...acc, [curr.label]: curr.score }), {});
                    }
                } catch (aiError) {
                    console.warn("AI Service completely failed, saving without metadata:", aiError);
                    // Swallow error so save continues
                }
            }

            // 3. Save to DB (Update if exists)
            // CRITICAL: Always use the REF for the ID to ensure we see the latest ID even if state hasn't updated
            const idToUse = entryIdRef.current || undefined;
            const result = await DataService.saveEntry(encryptedData, metadata, idToUse);
            
            if (!result.success) {
                console.error("Save failed:", result.error);
                if (!isAuto) setSaveStatus('error');
                isSavingRef.current = false;
                return; 
            }

            // Update ID if new - Sync both State and Ref
            if (result.id) {
                setCurrentEntryId(result.id);
                entryIdRef.current = result.id; 
            }
            setLastSavedContent(content);

            // Success Handling
            if (!isAuto) {
                // Manual Save: Show visuals
                await new Promise(r => setTimeout(r, 500));
                setSaveStatus('saved');
                setShowModal(true);
                setTimeout(() => setSaveStatus('idle'), 2000);
            } else {
                // Auto Save: Silent
                setSaveStatus('saved');
            }

        } catch (e) {
            console.error("Critical Save Error:", e);
            if (!isAuto) setSaveStatus('error');
        } finally {
            isSavingRef.current = false;
            
            // If a save was requested while we were busy, trigger it now
            if (pendingSaveRef.current) {
                pendingSaveRef.current = false;
                // Use a small timeout to let the event loop breathe and avoid infinite recursion depth issues (though async handles it well)
                setTimeout(() => handleSave(true), 100); 
            }
        }
    };

    // Auto-save & Analyze Effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (content && masterKey) {
                handleSave(true);
            }
        }, 2500);

        return () => clearTimeout(timeoutId);
    }, [content, masterKey]);

    if (checking) return null;

    if (!masterKey) {
        if (hasKey) {
            return <UnlockScreen onUnlock={setMasterKey} entryId={entryId} />;
        } else {
            const handleSetup = (key: string) => {
                setHasKey(true);
                setMasterKey(key);
            }
            return <SetupScreen onSetupComplete={handleSetup} />;
        }
    }

    const handleVoiceTranscript = (text: string) => {
        const newContent = content ? content + ` <p>${text}</p>` : `<p>${text}</p>`;
        setContent(newContent);
    };

    const handleTemplate = () => {
        const template = `
      <h3>Daily Reflection</h3>
      <p><strong>What went well today?</strong></p>
      <p></p>
      <p><strong>What challenged me?</strong></p>
      <p></p>
    `;
        setContent((prev: string) => prev + template);
    };

    // Derived state for UI
    const topMood = sessionStats?.emotions[0];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">

            {/* Top Navbar */}
            <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowRight className="w-5 h-5 rotate-180" />
                    </Link>
                </div>

                {/* Date Display */}
                <div className="flex flex-col items-center">
                    <h1 className="text-sm font-semibold text-foreground/80 tracking-wide">
                        {formattedDate}
                    </h1>
                    {topMood && (
                        <span className="text-xs text-primary animate-in fade-in slide-in-from-top-1">
                            Mood: {topMood.label} ({(topMood.score * 100).toFixed(0)}%)
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                     {currentEntryId && (
                        <button
                            onClick={async () => {
                                if (confirm("Are you sure you want to delete this entry? This cannot be undone.")) {
                                    const res = await DataService.deleteEntry(currentEntryId);
                                    if (res.success) {
                                        window.location.href = '/dashboard'; // formatting quirk, using simple redirect or nav
                                    } else {
                                        alert("Failed to delete entry");
                                    }
                                }
                            }}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-destructive/10"
                            title="Delete Entry"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                     )}
                     <button
                        onClick={() => handleSave(false)}
                        disabled={saveStatus === 'saving' || !content}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                            ${saveStatus === 'saved' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'}
                        `}
                    >
                        {saveStatus === 'saving' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        {saveStatus === 'saved' ? 'Saved' : 'Save'}
                    </button>
                </div>
            </header>

            {/* Editor Area */}
            <main className="flex-1 container mx-auto max-w-3xl px-6 flex flex-col justify-center relative py-12">
                <div className="min-h-[60vh] flex flex-col">
                    <RichTextEditor
                        content={content}
                        onChange={setContent}
                    />
                </div>

                {/* Insights Modal */}
                {showModal && sessionStats && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                            
                            <button 
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>

                            <div className="text-center mb-8">
                                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold">Entry Saved!</h2>
                                <p className="text-muted-foreground mt-2">Here's a snapshot of your emotional footprint.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {/* Top Emotions */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <TrendingUp className="w-4 h-4" />
                                        Dominant Emotions
                                    </div>
                                    <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                                        {sessionStats.emotions.slice(0, 3).map((e, i) => (
                                            <div key={i} className="flex items-center justify-between text-sm">
                                                <span className="capitalize font-medium">{e.label}</span>
                                                <div className="flex items-center gap-3 w-2/3">
                                                    <div className="h-2 flex-1 bg-background rounded-full overflow-hidden border border-border/50">
                                                        <div 
                                                            className="h-full bg-primary/80 rounded-full" 
                                                            style={{ width: `${e.score * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground w-8 text-right font-mono">
                                                        {(e.score * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {sessionStats.emotions.length === 0 && <p className="text-sm text-muted-foreground italic">No strong emotions detected.</p>}
                                    </div>
                                </div>

                                {/* Top Keywords */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Hash className="w-4 h-4" />
                                        Key Topics
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {sessionStats.keywords.map((word, i) => (
                                            <span 
                                                key={i} 
                                                className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium border border-blue-500/20"
                                            >
                                                #{word}
                                            </span>
                                        ))}
                                        {sessionStats.keywords.length === 0 && <span className="text-sm text-muted-foreground italic">Keep writing to discover topics...</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
                                <Link 
                                    to="/dashboard"
                                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                                >
                                    Go Home
                                </Link>
                                <Link 
                                    to="/insights"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
                                >
                                    View full insights <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Toolbar */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-center px-4 z-50 pointer-events-none">
                {/* Floating Pill Menu - Light Mode Style */}
                <div className="flex items-center gap-2 bg-background/95 backdrop-blur-xl border border-border/60 p-1.5 rounded-full shadow-lg shadow-black/5 pointer-events-auto ring-1 ring-black/5">

                    {/* Voice Button */}
                    <div className="rounded-full transition-colors">
                        <VoiceRecorder onTranscript={handleVoiceTranscript} />
                    </div>

                    <div className="w-px h-5 bg-border"></div>

                    {/* Templates Button */}
                    <button
                        onClick={handleTemplate}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all"
                    >
                        <LayoutTemplate className="w-4 h-4" />
                        <span>Templates</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
