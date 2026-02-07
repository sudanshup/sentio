import { Link } from 'react-router-dom';

const FAQ = () => {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <Link to="/" className="text-primary hover:underline mb-8 block">&larr; Back to Home</Link>
            <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>

            <div className="space-y-6">
                <div className="border rounded-lg p-6">
                    <h3 className="font-bold text-xl mb-2">Is my data really private?</h3>
                    <p className="text-muted-foreground">Yes. We use End-to-End Encryption (E2EE) with AES-256. Your journal entries are encrypted with your password on your device before they ever reach our servers. We literally cannot read them.</p>
                </div>

                <div className="border rounded-lg p-6">
                    <h3 className="font-bold text-xl mb-2">What if I forget my password?</h3>
                    <p className="text-muted-foreground">Because we use your password to encrypt your data, we cannot reset it for you without losing access to your encrypted entries. We recommend exporting your data regularly or setting up a recovery key (coming soon).</p>
                </div>

                <div className="border rounded-lg p-6">
                    <h3 className="font-bold text-xl mb-2">Is Sentio free?</h3>
                    <p className="text-muted-foreground">Yes, Sentio is currently free to use.</p>
                </div>

                <div className="border rounded-lg p-6">
                    <h3 className="font-bold text-xl mb-2">Does the AI read my thoughts?</h3>
                    <p className="text-muted-foreground">The AI processes your text momentarily to identify emotions and patterns, but it does not "learn" from your personal data in a way that risks your privacy, and the training data is never retained.</p>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
