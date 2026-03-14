# Nocturne

A cyberpunk-themed gamified educational platform built with Next.js — where learning feels like leveling up.

## Demo

![Demo](public/demo.mp4)

---

## Features

### 🎮 Gamified Dashboard
- Personalized hero card displaying your **level, XP, and daily streak**
- XP progress bar to the next level with animated level-up modal
- **Weak subject detection** — surfaces the subjects you've attempted least or scored lowest in so you know exactly where to focus
- Recent **badge grid** to showcase earned achievements

### ⚔️ Quiz Arena
- Subject-filtered 5-question quizzes pulled from your question bank
- **Combo multiplier** — consecutive correct answers multiply your XP
- **Boss questions** every 5th round worth bonus XP
- Three one-time **power-ups** per session:
  - **50/50** — eliminates two wrong options
  - **Skip** — skip a question without penalty
  - **Double XP** — doubles XP earned on your next correct answer
- Visual juice: floating XP labels, particle bursts on correct answers, progress bar glow effects
- **Level-up modal** triggered automatically when you reach a new level
- Sound effects on correct and wrong answers

### 🤺 Avatar System
- Choose a hero avatar with unique **passive bonuses**:
  - **Armin** — unlocks a one-time hint per quiz
  - **Mikasa** — 10% chance to save your combo streak on a wrong answer
  - **Eren** — +5 bonus XP on Science questions

### ⚔️ Duel Mode
- Real-time head-to-head competitive quiz sessions
- Join or create a duel room and race against another player

### 📖 Story Mode
- Upload a **PDF or paste raw text** to generate an AI-powered learning session
- AI breaks your content into **topic cards** with illustrations and explanations
- After reading, tackle a **5-question quiz** on what you learned
- Combo XP system with floating score feedback
- **Saved stories** — re-attempt any previously generated story session anytime

### 🏆 Leaderboard
- Global ranking of all learners sorted by XP
- Animated **podium view** for top 3 players with gold/silver/bronze styling
- Full ranked list with level badges and XP scores

### 👤 Profile & Quiz History
- View your complete quiz attempt history
- Track scores, accuracy, and subjects across all sessions

### 🔐 Authentication
- JWT-based login and registration
- Secure token stored in `localStorage`, passed as `Authorization` header on all API calls

### 🎨 Design
- Dark cyberpunk aesthetic with **glassmorphism panels** and purple/pink neon glow
- Smooth entrance animations powered by **Framer Motion**
- Cyberpunk Orbitron font with glowing text effects
- Responsive layout across all screen sizes

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 with custom cyberpunk theme
- **Animations**: Framer Motion
- **Auth**: JWT (custom, backed by MongoDB users collection)
- **Database**: MongoDB via Mongoose
- **AI**: Story Mode content and image generation via backend API

