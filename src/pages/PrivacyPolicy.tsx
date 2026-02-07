import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <Link to="/" className="text-primary hover:underline mb-8 block">&larr; Back to Home</Link>
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <div className="prose dark:prose-invert">
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <h3>1. Data We Collect</h3>
                <p>
                    <strong>Account Info:</strong> Email address for authentication.<br />
                    <strong>Journal Metadata:</strong> Timestamps, mood scores, and word counts for analytics.<br />
                    <strong>Journal Content:</strong> Your actual journal entries are **encrypted on your device** before being sent to our servers. We store the encrypted blob but cannot decrypt it.
                </p>

                <h3>2. AI Processing</h3>
                <p>When you use our AI features, the text is processed in memory to extract insights (emotions) and then immediately discarded. The raw text is never stored in plain text.</p>

                <h3>3. Data Deletion</h3>
                <p>You can request full deletion of your account and data at any time from the settings menu.</p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
