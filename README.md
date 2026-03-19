# Zyph Nex Era - Advanced Trading Simulation

A premium, high-fidelity crypto trading simulation platform designed to help users practice and compete in market prediction games. Built with a modern tech stack and focusing on a "Stratosphere" aesthetic.

## 🚀 Features Implemented

### 1. Authentication & User Management

- **Dual Authentication**: Supports both traditional Email/Password (for Admins) and Web3 Wallet connection (RainbowKit/Wagmi).
- **Role-Based Access Control**: Secure Admin dashboard and standard User roles.
- **Onboarding Flow**: Guided experience for new users.

### 2. Match Management System

- **Match Lifecycle**: Fully automated flow from `Created` -> `Open` -> `Live` -> `Completed`.
- **Backend Scheduler**: `node-cron` jobs manage status transitions and scoring updates.
- **Admin Dashboard**: comprehensive interface to Create, Edit, and Monitor matches.

### 3. Live Match Experience

- **Lobby**: Browse active and upcoming matches with dynamic cards.
- **Asset Selection**: Choose assets based on real market data (Volatility, Volume indicators).
- **Allocation**: Intuitive UI to allocate portfolio weights (pie charts, 100-unit blocks).
- **Live Simulation**: Real-time ticker updates, PnL tracking, and varying user ranks.
- **Leaderboard**: Dynamic ranking system showing top performers.

### 4. Practice Mode (New Feature)

- **Risk-Free Environment**: Dedicated "Practice Arena" to simulate trading without real stakes.
- **Scenario Selection**: Choose between "Crypto Basics" and "High Volatility" scenarios.
- **Guided Flow**: Step-by-step process: Select Assets -> Confirm Entry (Virtual Currency) -> 2-Minute Simulation -> Results.
- **Instant Feedback**: Immediate scoring and ranking against simulated opponents.

## 🛠️ Tech Stack

### Frontend (AppUi)

- **React** (Vite): Core UI framework.
- **Tailwind CSS**: Utility-first styling with custom "Stratosphere" theme (Glassmorphism, Neon Accents).
- **Framer Motion**: Advanced animations and transitions.
- **RainbowKit + Wagmi**: Web3 wallet integration.
- **React Router**: Navigation management.

### Backend

- **Node.js + Express**: RESTful API server.
- **MongoDB**: NoSQL database for users, matches, and portfolios.
- **Mongoose**: ODM for data modeling.
- **JSON Web Tokens (JWT)**: Secure authentication.

### Admin Dashboard

- **React**: Separate admin interface for platform management.
- **Recharts**: Data visualization for match statistics.

## 📦 Project Structure

```
Zyph-Nex-era/
├── AppUi/              # Main User Interface (React + Vite)
│   ├── src/pages/      # Route components (LiveMatch, PracticeMatch, etc.)
│   ├── src/components/ # Reusable UI components
│   └── src/services/   # API integration
├── backend/            # API Server (Node.js)
│   ├── models/         # Mongoose Schemas
│   ├── routes/         # API Endpoints
│   └── jobs/           # Scheduled tasks
└── admindashboard/      # Admin Panel (React)
```

## 🏁 Getting Started

1.  **Clone the repository**
2.  **Install Dependencies**:
    ```bash
    cd AppUi && npm install
    cd ../backend && npm install
    cd ../admindashboard && npm install
    ```
3.  **Environment Variables**: Ensure `.env` files are set up in each directory (MongoDB URI, JWT Secret, Port).
4.  **Run Development Servers**:
    - Backend: `cd backend && npm run dev`
    - App: `cd AppUi && npm run dev`
    - Admin: `cd admindashboard && npm run dev`
