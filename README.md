# 🧠 Sentio - AI-Powered Secure Journal

> Privacy-first mental health companion with end-to-end encryption and
> AI-powered emotion analysis

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)

## 📖 Overview

Sentio is a production-grade AI journaling application that combines
cutting-edge security with intelligent emotion tracking. Built with privacy as
the foundation, it uses **client-side end-to-end encryption** to ensure your
thoughts remain yours alone.

### ✨ Key Features

- 🔒 **End-to-End Encryption (E2EE)** - AES-GCM encryption happens in your
  browser before data transmission
- 🤖 **AI Emotion Analysis** - Custom fine-tuned BERT model (84% accuracy, 0.85
  F1-score)
- 📝 **Rich Text Editor** - Powered by TipTap with real-time formatting
- 🎤 **Voice-to-Text** - Web Speech API integration for hands-free journaling
- 📊 **Analytics Dashboard** - Emotion trends, streaks, and "Year in Pixels"
  visualization
- 🎨 **Modern UI/UX** - Dark mode, glassmorphism, smooth animations
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- 🏆 **Gamification** - Streaks, badges, and achievement system
- 📤 **Export Options** - Download entries as PDF or DOCX

## 🛠️ Tech Stack

### Frontend

- **React 18** with **TypeScript** for type-safe development
- **Vite** for lightning-fast builds and HMR
- **Tailwind CSS** for modern, responsive styling
- **Framer Motion** for smooth animations
- **Recharts** for data visualization

### Backend & Services

- **Supabase** - PostgreSQL database with Row Level Security (RLS)
- **Supabase Auth** - Email/password authentication
- **Hugging Face API** - Custom BERT model for emotion detection

### Security

- **Web Crypto API** - Native browser encryption (PBKDF2, AES-GCM)
- **Row Level Security** - Database-level authorization
- **Security Headers** - CSP, X-Frame-Options, etc.

### DevOps

- **GitHub Actions** - Automated CI/CD pipeline
- **Vercel** - Zero-config deployment
- **ESLint** & **TypeScript** - Code quality enforcement

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier)
- Hugging Face account (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sentio.git
   cd sentio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   ```env
   VITE_SUPABASE_URL=your-project-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_HF_API_TOKEN=your-huggingface-token
   VITE_HF_ENDPOINT=https://your-space.hf.space
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/migrations/` in the SQL Editor
   - Enable Row Level Security policies

5. **Run development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:5173` to see the app!

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🔐 Security Architecture

Sentio implements a **zero-knowledge architecture**:

1. **Client-Side Encryption**: Journal entries are encrypted in the browser
   using AES-GCM before transmission
2. **Key Derivation**: Encryption keys are derived from user passwords using
   PBKDF2
3. **AI Privacy**: Emotion analysis happens on raw text before encryption; only
   metadata is stored
4. **Server-Side**: Database only stores encrypted blobs + anonymous metadata

**The server never sees your journal content in plain text.**

## 🎨 Features Deep Dive

### Dashboard

- Real-time emotion trends (last 7 days)
- Current streak tracking
- Recent entries with quick actions
- Daily statistics (entries, words, emotions)

### Editor

- Rich text formatting (bold, italic, headings, lists)
- Voice input with live transcription
- Auto-save with visual feedback
- AI-powered emotion tagging
- Keyword extraction

### Insights

- Year in Pixels visualization
- Emotion distribution charts
- Historical trends analysis
- Exportable reports

### Settings

- Theme customization
- Data export (PDF/DOCX)
- Account management
- Privacy controls

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

Your app will be live at `your-project.vercel.app`

### Environment Variables for Production

Ensure these are set in your Vercel project settings:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_HF_API_TOKEN`
- `VITE_HF_ENDPOINT`

## 📊 Performance

- **Bundle Size**: ~180KB initial (gzipped)
- **Lighthouse Score**: 95+ Performance
- **First Contentful Paint**: <1.5s (3G)
- **Code Splitting**: 4 optimized chunks

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [Hugging Face](https://huggingface.co) for AI model hosting
- [TipTap](https://tiptap.dev) for the rich text editor
- [Tailwind CSS](https://tailwindcss.com) for the styling framework

## 📞 Contact

Created by [Your Name] - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link:
[https://github.com/yourusername/sentio](https://github.com/yourusername/sentio)

---

⭐ If you found this project helpful, please give it a star!
