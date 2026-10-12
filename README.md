# ANVAYA — Cultural Committee Web Application
### Information Science and Engineering Department · Kalpataru Institute of Technology (KIT), Tiptur

[![Tests](https://img.shields.io/badge/tests-9%20passed-success)](tests/api.test.ts)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](tsconfig.json)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](package.json)
[![Node.js](https://img.shields.io/badge/Node.js-22.14-green)](server)
[![License](https://img.shields.io/badge/License-MIT-gold)](LICENSE)

Anvaya is the official full-stack web application designed for the Cultural Committee and student community of the Department of Information Science & Engineering at Kalpataru Institute of Technology, Tiptur.

---

## 1. Visual Identity & Brand System

- **Official Logo**: Uses the official Anvaya logo located at `public/images/anvaya-logo.png` with aspect ratio preservation and zero distortion. A reusable `AnvayaLogo` component provides standard size variants (`sm`, `md`, `lg`, `xl`, `certificate`).
- **Original Color Palette**:
  - Dark Surfaces: Deep Midnight Plum (`#0E0515`, `#190B24`, `#231331`)
  - Light Surfaces: Warm Ivory (`#FDFBF7`, `#F7F3EB`, `#ECE4D4`)
  - Accent / Emphasis: Restrained Saffron & Antique Gold (`#C9981B`, `#E26D28`, `#D4AF37`)
  - Secondary Accent: Peacock Teal (`#14B8A6`, `#0D9488`, `#0F766E`)
- **Theme Support**: Seamless Dark and Light modes with persistent `localStorage` preference and accessible contrast.
- **Micro-Interactions**: Reduced-motion compliance (`prefers-reduced-motion`), smooth transitions, and feedback toasts.

---

## 2. Key Modules & Features

### 1. Home (`/`)
- Hero section with official Anvaya logo, distinctive headline, and primary CTAs (`Join Anvaya`, `Explore Events`, `Verify Certificates`).
- Live database upcoming events preview.
- Mission, vision, and core purpose summary.
- Recent gallery visual highlights.
- Latest news and event announcements.
- Cultural bulletin newsletter subscription.

### 2. About Anvaya (`/about`)
- Purpose, history, and founding vision.
- Detailed breakdown of 6 cultural activity domains (Performing Arts, Vocals, Theatre & Mime, Fine Arts, Literary, Event Logistics).
- Member benefits and leadership overview.

### 3. Meet the Team Directory (`/team`)
- Responsive card grid displaying student leadership.
- Includes editable seed data:
  - **Ankush S** (President)
  - **Haritha G.S** (Vice President)
  - **Akash** (Secretary)
  - **Likhita H.R** (Speaker)
  - **Vinup N** (Treasurer)
  - **Deepak K B** (Treasurer)
  - **Prakruti N** (Treasurer)
  - **Chitra D** (Cultural)
- Automatic monogram/initials avatar fallback.
- Profile photograph uploads via `/api/upload`.
- Social profile links (LinkedIn, GitHub, Instagram, Email).
- Manageable through protected admin dashboard.

### 4. Events & Interactive Calendar (`/events`, `/events/:slug`)
- Interactive monthly calendar with today jump, month navigation, and dates with published events highlighted.
- Category filters (Dance, Music, Drama, Fine Arts, Literary, Festivals).
- Status filters (Upcoming, Ongoing, Completed, All).
- Individual event detail pages (`/events/:slug`) with cover images, venue, timing, rules, and organizers.
- Internal student event registration form with duplicate USN detection, capacity tracking, and instant feedback.
- Completed events archive displaying verified winners and accolades.

### 5. Join Anvaya — Membership Application (`/join`)
- Form capturing Full Name, USN, Academic Year, Branch, Email, Phone, Cultural Interests, Skills, Motivation, and Preferred Wing.
- Multi-select interest options (16 distinct categories).
- Server-side validation, duplicate prevention, and confetti confirmation.
- Protected admin review interface to approve/reject, add internal notes, and export applicant data to CSV.

### 6. Certificate Portal (`/certificate`)
- Prominent Anvaya logo on the **left side** of the landing hero.
- Participant verification workflow: validates Name and USN against authorized event records.
- Prevents arbitrary generation of unauthorized certificates.
- Pixel-perfect certificate rendering with ornate gold borders, VTU & KIT institutional headers, authorized signatures, unique certificate ID, and verification QR code.
- Genuine client-side **Download as PNG** and **Download as PDF** generation via `html2canvas` and `jsPDF`.
- Protected admin tools: create templates, configure up to 3 signatories, batch import `Name, USN` rows with preview and duplicate skipping, toggle revocation, and export JSON backups.

### 7. Projects Showcase (`/projects`)
- Highlights student-built software tools, stage hardware tech, and creative digital media.
- Filter by All, Ongoing, and Completed.
- Direct links to GitHub repositories and live demos.
- "Have an idea?" submission modal allowing students to propose project ideas for committee mentorship.

### 8. Photos & Videos Gallery (`/gallery`)
- Filterable by event album, year, and media format (Photos / Videos).
- Image lightbox with next/previous keyboard navigation (`←`/`→`/`ESC`).
- Dedicated video playback modal.
- Media upload and album management in admin dashboard.

### 9. News & Announcements (`/announcements`)
- Active bulletins and event announcements with links to related events.
- Newsletter subscription persisted to MongoDB / resilient store.

### 10. Contact (`/contact`)
- Contact form with validation and backend persistence.
- Official institutional details: Department of Information Science & Engineering, Kalpataru Institute of Technology, Tiptur.
- Configurable social channels and external Google Maps campus link.

### 11. Global Search
- Modal search dialog accessible with `Ctrl+K` or search button in navbar.
- Real-time debounced query across published events, projects, team members, announcements, and gallery albums.

### 12. Protected Administration Dashboard (`/admin`)
- Secure token-based authentication (JWT + bcrypt).
- Responsive administrative sidebar with management screens for:
  - Dashboard Overview (real database metric counters)
  - Events & Registrations
  - Team Members
  - Certificates & Participant Issuance
  - Membership Applications Review & CSV Export
  - Projects & Student Idea Moderation
  - Gallery Albums & Media Uploads
  - Announcements
  - Contact Submissions & Newsletter Subscribers
  - Public Settings & Social Links

---

## 3. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, canvas-confetti, html2canvas, jsPDF
- **Backend API**: Node.js, Express, TypeScript, Multer, JWT, BcryptJS
- **Database**: MongoDB Atlas with Mongoose (plus Standalone Resilient Mode fallback for offline development)
- **Testing**: Vitest, Supertest

---

## 4. Local Development & Setup

### Prerequisites
- Node.js v18 or higher (tested on Node v22.14)
- npm v9 or higher

### Installation

```bash
# 1. Clone repository and install dependencies
git clone <repo-url>
cd Anvaya
npm install

# 2. Configure environment variables
# Copy .env.example to .env
cp .env.example .env
```

### Running Locally

```bash
# Start both Backend API (:5000) and Frontend Vite (:5173) concurrently
npm run dev

# Or start individually:
npm run dev:server    # Starts Node.js API server on http://localhost:5000
npm run dev:client    # Starts Vite frontend on http://localhost:5173
```

Visit `http://localhost:5173` in your browser.

### Default Admin Credentials

To access the administrative dashboard at `/admin`:
- **Email**: `admin@anvaya.kit`
- **Password**: `AnvayaAdminKIT2026!`

*(Change these in production via `.env` variables `ADMIN_EMAIL` and `ADMIN_PASSWORD`)*

---

## 5. Automated Tests & Build

```bash
# Run Vitest API integration tests
npm test

# Build backend and frontend for production
npm run build

# Start production server
npm start
```

---

## 6. Environment Variables (`.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | API server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb://localhost:27017/anvaya` |
| `JWT_SECRET` | Secret key for JWT session tokens | Secure random string |
| `ADMIN_EMAIL` | Default master administrator email | `admin@anvaya.kit` |
| `ADMIN_PASSWORD` | Default master administrator password | `AnvayaAdminKIT2026!` |
| `CLIENT_ORIGIN` | Allowed CORS origin for frontend | `http://localhost:5173` |
| `VITE_API_BASE_URL` | API Base URL for frontend requests | `/api` (relative proxy in dev) |
| `VITE_BASE_PATH` | Base path for GitHub Pages deployment | `/` |
| `STORAGE_PROVIDER` | Media storage provider (`local` / `cloudinary`) | `local` |
| `EMAIL_PROVIDER` | Email delivery provider (`none` / `brevo` / `smtp`) | `none` |

---

## 7. Deployment Instructions

### Static Frontend Deployment on GitHub Pages

1. In `package.json` or environment variables, set `VITE_BASE_PATH` to `/<repo-name>/` (e.g., `/anvaya/`).
2. Build the client bundle:
   ```bash
   npm run build:client
   ```
3. The build output is generated in `dist/`. Deploy the `dist/` directory to GitHub Pages using the `gh-pages` branch or GitHub Actions.
4. `public/404.html` is included in the project to automatically preserve React Router SPA routes on page refreshes.
5. In production, configure `VITE_API_BASE_URL` to point to your live API (e.g., `https://anvaya-api.vercel.app/api`).

### Backend API Deployment (Vercel Functions / Node Server)

1. The backend in `server/` is modular and compatible with Vercel Serverless Functions (`api/` handler) or any containerized Node.js runtime.
2. In your deployment dashboard (e.g. Vercel), configure the environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection URI (`mongodb+srv://...`)
   - `JWT_SECRET`: A high-entropy random string
   - `CLIENT_ORIGIN`: Your GitHub Pages frontend URL (`https://<user>.github.io`)
3. Connect your MongoDB Atlas cluster by whitelisting IP addresses (`0.0.0.0/0` for serverless environments) and obtaining your connection string.

---

## 8. Institutional Identification

- **Committee**: Anvaya Cultural Committee
- **Department**: Department of Information Science & Engineering
- **Institution**: Kalpataru Institute of Technology, B.H. Road, Tiptur, Karnataka - 572201
- **Affiliation**: Visvesvaraya Technological University (VTU), Belagavi
