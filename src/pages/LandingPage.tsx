import { Link } from 'react-router-dom';
import { ArrowRight, Lock, Sparkles, Brain } from 'lucide-react';
import sentioLogo from '../assets/sentio-icon.png';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Navigation */}
            <nav className="border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
                    <div className="mr-4 flex">
                        <Link to="/" className="mr-6 flex items-center space-x-2">
                            <img src={sentioLogo} alt="Sentio Logo" className="h-6 w-6" />
                            <span className="font-bold text-xl inline-block text-primary">Sentio</span>
                        </Link>
                    </div>
                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <div className="w-full flex-1 md:w-auto md:flex-none">
                        </div>
                        <nav className="flex items-center space-x-4">
                            <Link to="/faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                                FAQ
                            </Link>
                            <Link to="/login" className="text-sm font-medium transition-colors hover:text-primary">
                                Login
                            </Link>
                            <Link to="/signup" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                                Get Started
                            </Link>
                        </nav>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1">
                <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
                    <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto px-4">
                        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
                            Your Safe Space for <span className="text-primary bg-clip-text">Mindful Reflection</span>
                        </h1>
                        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                            Sentio is an AI-powered therapy journal that helps you understand your emotions.
                            Private, encrypted, and insightful.
                        </p>
                        <div className="space-x-4">
                            <Link to="/signup" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                                Start Journaling
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                            <Link to="/about" className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground">
                                Learn more
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24 mx-auto px-4">
                    <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                        <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                                <Lock className="h-12 w-12 text-primary" />
                                <div className="space-y-2">
                                    <h3 className="font-bold">End-to-End Encrypted</h3>
                                    <p className="text-sm text-muted-foreground">Your thoughts are yours alone. We cannot read your entries.</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                                <Brain className="h-12 w-12 text-primary" />
                                <div className="space-y-2">
                                    <h3 className="font-bold">AI Emotion Analysis</h3>
                                    <p className="text-sm text-muted-foreground">Understand your patterns with privacy-preserving AI insights.</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                                <Sparkles className="h-12 w-12 text-primary" />
                                <div className="space-y-2">
                                    <h3 className="font-bold">Mood Tracking</h3>
                                    <p className="text-sm text-muted-foreground">Visualize your emotional journey over time with beautiful charts.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-6 md:px-8 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row mx-auto px-4">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built by Sentio Team. The source code is available on GitHub.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Link to="/terms" className="hover:underline">Terms</Link>
                        <Link to="/privacy" className="hover:underline">Privacy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
