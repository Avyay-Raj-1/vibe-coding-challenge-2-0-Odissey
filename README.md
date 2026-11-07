# 🏅 Academy Desk — Sports Academy Management & Player Performance Tracking System

> **Every Player. Every Practice. Every Performance.**  
> Transforming sports academy operations from manual notebooks to a modern, data-driven digital platform in Dumka, Jharkhand, India.

---

## 📌 Overview

**Academy Desk** is a centralized sports performance analytics and talent discovery platform built for local sports academies. It automates attendance tracking, performance recording, automatic trial readiness calculation, and scouting discovery.

---

## 🚀 Key Features & Modules

### 1. 🧑‍🏫 Coach / Admin Module
- **Player Management**: Register, edit, and manage athletes across sports (Football, Cricket, Athletics, Kabaddi, Badminton).
- **Practice Sessions**: Open daily practice sessions by date and sport.
- **Attendance Tracking**: Rapid 1-click Present/Absent marking.
- **Session Locking**: Closing a practice session permanently locks its attendance records via PostgreSQL triggers.
- **Match Records & Scoring**: Record match results and individual player scores against opponents (e.g. Dumka Tigers FC, Deoghar Warriors).
- **Strict Validation**: Backend triggers guarantee only players marked **PRESENT** in the closed session can participate in the match.

### 2. ⚡ Automatic Player Readiness Engine (Rule 7)
- Computes readiness status automatically based on live performance data:
  $$\text{Attendance Rate} = \left(\frac{\text{Present Closed Sessions}}{\text{Total Closed Sessions for Sport}}\right) \times 100$$
- **READY Criteria**:
  - Attendance Rate $\ge 75\%$
  - Recorded Matches Played $\ge 2$
- Completely dynamic and calculated on the database level via PostgreSQL views and functions — no manual tampering possible.

### 3. 🔍 Talent Scout Module
- **Security-Restricted Access**: Scouts can **ONLY** view athletes who meet the **READY** criteria (enforced directly on the database RPC level).
- **Filter & Search**: Search athletes by name, filter by sport, and adjust age ranges.
- Full performance profiles showcasing attendance rate, match count, average scores, and best performance.

### 4. 🏃 Player Personal Dashboard
- Athletes view their personal performance records, attendance history, match scores, and live readiness progress.
- Strictly isolated to the authenticated athlete's data.

### 5. 📈 Analytics & Reports
- Interactive charts: Players by sport, trial readiness donut chart, 6-month session trends, and attendance distribution.
- Leaderboard ranking top scorers across all academy matches.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Responsive CSS Architecture
- **Backend & Database**: Supabase, PostgreSQL
- **Security & Integrity**:
  - Row Level Security (RLS) policies
  - PostgreSQL trigger: `trg_prevent_attendance_edit_on_closed` (enforces session locking)
  - PostgreSQL trigger: `trg_validate_match_participant` (rejects absent players from match sheets)
  - PostgreSQL trigger: `trg_auto_confirm_user` (instant email confirmation for seamless onboarding)
  - PostgreSQL view & RPC: `get_scout_ready_players` (strict Ready-only filtering)

---

## ⚡ Quick Demo Logins

| Role | Email | Password | Access |
|---|---|---|---|
| **🧑‍🏫 Coach** | `coach@academydesk.in` | `Coach@1234` | Full academy management |
| **🔍 Scout** | `scout@academydesk.in` | `Scout@1234` | Verified READY athletes only |
| **🏃 Player** | `player@academydesk.in` | `Player@1234` | Personal athlete records (Rohit Soren) |

*(Or click the 1-Click Instant Demo buttons on the login screen!)*

---

## 💻 Local Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Avyay-Raj-1/vibe-coding-challenge-2-0-Odissey.git
   cd vibe-coding-challenge-2-0-Odissey/"academy desk"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file inside `academy desk`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🛡️ Database Verification & Test Scenarios

The test suite in `run_tests.js` verifies all six critical business scenarios:
1. **Attendance Marking**: Records individual PRESENT/ABSENT status per session.
2. **Session Locking**: Database trigger blocks any modification after session is closed.
3. **Match Validation**: Database trigger rejects absent players from match scorecards.
4. **Readiness Calculation**: Validates $75\%$ attendance + 2 matches criteria dynamically.
5. **Scout Access Security**: Database function strictly returns only READY athletes.
6. **Player Privacy**: Athletes only have access to their own records.

