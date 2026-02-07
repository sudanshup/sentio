import { Link } from 'react-router-dom';

const TermsOfService = () => {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <Link to="/" className="text-primary hover:underline mb-8 block">&larr; Back to Home</Link>
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            <div className="prose dark:prose-invert">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <p>Welcome to Sentio. By using our website and services, you agree to these terms.</p>

                <h3>1. Acceptance of Terms</h3>
                <p>By accessing or using Sentio, you agree to be bound by these Terms of Service.</p>

                <h3>2. Privacy & Data Security</h3>
                <p>Your privacy is our priority. Sentio uses End-to-End Encryption (E2EE) for your journal entries. We cannot read your private entries. Please see our Privacy Policy for details.</p>

                <h3>3. User Responsibilities</h3>
                <p>You are responsible for maintaining the confidentiality of your account credentials. Because we use client-side encryption, if you lose your password, you may lose access to your data forever.</p>

                <h3>4. Usage</h3>
                <p>Sentio is a self-help tool and does not provide medical advice. If you are in crisis, please contact professional emergency services.</p>
            </div>
        </div>
    );
};

export default TermsOfService;
