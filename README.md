# 🌿 EcoTrack AI

EcoTrack AI is a premium, AI-powered Sustainability Intelligence Platform designed to help users track, understand, and reduce their carbon footprint. By combining sleek design with actionable data, EcoTrack AI acts as your personal carbon coach.

## ✨ Features

- **📊 Footprint Dashboard**: A comprehensive overview of your daily emissions, category breakdown, and progress towards your monthly carbon goals.
- **📝 Log Activity**: An intuitive interface to log transport, energy, diet, and waste activities, which are automatically converted to kg CO₂e.
- **🎛️ Savings Simulator**: Interactive sliders allowing you to experiment with reductions in transport, energy, and waste to see the immediate impact on your footprint.
- **🔮 EcoTwin**: An innovative split-view feature contrasting your "Current You" with a "Future Sustainable You." It generates an AI-powered roadmap for reduction and calculates your financial ROI for going green.
- **🏆 EcoScore Gamification**: Earn experience points (XP) for tracking and reducing emissions. Level up from "Beginner" to "Earth Guardian" and unlock milestone badges.
- **📰 Real EcoFeed**: Stay informed with curated, real-time climate news, local transit updates, and sustainable living tips.
- **💬 Eco AI Coach**: A built-in chat interface powered by an intelligent assistant to give you personalized reduction plans and answer any sustainability questions.
- **🌓 Adaptive Theme**: A premium glassmorphism design that features a seamless toggle between an elegant Dark Mode and a crisp Light Mode, utilizing smooth micro-animations.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (via Vite)
- **Styling**: Tailwind CSS v4, custom CSS with glassmorphism variables
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Chart.js / React-Chartjs-2
- **Network**: Axios

### Backend
- **Framework**: Node.js & Express
- **Database**: SQLite3 (serverless, disk-based DB)
- **AI Integration**: OpenAI (for the EcoTwin and Eco AI Chat endpoints)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Setup the Backend
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Start the backend server (runs on `http://localhost:3001` by default):
```bash
node server.js
```
*Note: Ensure you have your `.env` configured if using the OpenAI API.*

### 2. Setup the Frontend
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

### 3. View the App
Open `http://localhost:5173` in your browser. The frontend will automatically proxy/communicate with your local backend on port 3001.

## 🎨 Design Philosophy
The application was designed to move away from standard "boring data dashboards." By utilizing frosted glass panels (`backdrop-blur`), vibrant emerald/teal gradients, and `framer-motion` layout animations, EcoTrack AI offers a high-end, engaging user experience that makes tracking sustainability both beautiful and rewarding.

---
*Built as a final project for an advanced AI-assisted development workflow.*
