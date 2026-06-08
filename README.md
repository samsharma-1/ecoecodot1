# EcoTrack AI: Carbon Footprint Assistant

**EcoTrack AI** is an interactive personal assistant designed to help users understand and reduce their carbon footprint. It tracks daily activities (transport, energy use, diet, waste) and converts them into CO₂-equivalent (CO₂e) emissions using standardized factors. By providing personalized insights, tips, and gamified goals, EcoTrack AI makes sustainability actionable.

## Problem Statement
Everyday actions emit greenhouse gases. Most people lack immediate feedback on how their lifestyle choices translate into carbon impact. EcoTrack AI addresses this by providing a dynamic, personalized carbon tracker and advisor that calculates footprint in real-time and suggests simple reduction actions.

## Key Features
- **Activity Logging & Emission Calculation:** Users input daily activities and the system calculates their CO₂e footprint using IPCC/EPA factors.
- **Personalized AI Chat:** An AI-powered chatbot interprets user input and responds with friendly, actionable feedback.
- **Dashboard & Progress Visualization:** A React-based visual dashboard displays charts of emissions by category over time.

## Architecture
The system follows a modular web architecture:
- **Frontend:** React + Vite + Tailwind CSS + Chart.js
- **Backend:** Node.js + Express + SQLite
- **AI/LLM:** Mocked NLP for MVP (Designed for OpenAI integration)

## Quick Start (Local Development)

### 1. Install Dependencies
**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Run the Application
Start the backend server (runs on `localhost:3001`):
```bash
cd backend
node server.js
```

Start the frontend development server (runs on `localhost:5173`):
```bash
cd frontend
npm run dev
```

## Security & Performance
- **Security:** Input validation is performed on the Express backend, and parameterized queries are used in SQLite to prevent SQL injection.
- **Performance:** Lightweight SQLite database and optimized React bundle using Vite ensure fast load times and minimal resource footprint.

## Testing & Accessibility
- The UI follows basic WCAG guidelines for high contrast and responsive layout.
- The project is structured cleanly, strictly following ESLint/Prettier code formatting styles.

*Built for PromptWars - Sustainability/Carbon Footprint Vertical.*
