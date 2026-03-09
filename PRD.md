# Product Requirements Document (PRD)
# Survey App — Public Survey Form Web Application

---

## 1. Product Overview

**Product Name:** Survey App
**Version:** 1.0
**Date:** March 2026
**Author:** Srinivas
**Tech Stack:** Next.js 16 (React), TypeScript, Tailwind CSS, MongoDB Atlas, JWT Authentication

### 1.1 Purpose
Survey App is a web application that enables users to design custom surveys, generate shareable public links, collect responses from respondents, store data securely in a cloud database, and visualize results through an analytics dashboard.

### 1.2 Target Users
- **Survey Creators (Admins):** Individuals or teams who need to create and distribute surveys for feedback collection, market research, product evaluation, or internal assessments.
- **Respondents (Public Users):** Anyone who receives a survey link and submits their responses.

### 1.3 Business Goals
- Provide a simple, intuitive survey creation and management platform
- Enable real-time response collection and analytics
- Offer a self-hosted, cost-effective alternative to commercial survey tools
- Support conditional logic for dynamic survey experiences

---

## 2. System Architecture

### 2.1 High-Level Architecture
```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Frontend   │────▶│   Next.js    │────▶│  MongoDB Atlas   │
│  (React/TS)  │◀────│  API Routes  │◀────│  (Cloud DB)      │
│  Tailwind CSS│     │  JWT Auth    │     │  Free Tier 512MB │
└──────────────┘     └──────────────┘     └──────────────────┘
```

### 2.2 Tech Stack Details
| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React 19, Next.js 16, TypeScript  |
| Styling     | Tailwind CSS 4                    |
| Backend     | Next.js API Routes (Node.js)      |
| Database    | MongoDB Atlas (Mongoose ODM)      |
| Auth        | JWT (jsonwebtoken), bcryptjs      |
| Hosting     | Local / Vercel / AWS (compatible) |

### 2.3 Data Models

**User**
| Field     | Type   | Description          |
|-----------|--------|----------------------|
| name      | String | Full name            |
| email     | String | Unique email         |
| password  | String | Hashed (bcrypt)      |
| createdAt | Date   | Registration date    |

**Survey**
| Field       | Type       | Description                     |
|-------------|------------|---------------------------------|
| title       | String     | Survey title                    |
| description | String     | Optional description            |
| userId      | ObjectId   | Owner reference                 |
| questions   | Array      | List of question objects        |
| publicId    | String     | Unique 8-char public identifier |
| isActive    | Boolean    | Active/paused status            |
| createdAt   | Date       | Creation date                   |

**Question (Embedded)**
| Field         | Type    | Description                        |
|---------------|---------|------------------------------------|
| id            | String  | UUID identifier                    |
| type          | Enum    | Question type (see Section 3.2)    |
| label         | String  | Question text                      |
| required      | Boolean | Mandatory flag                     |
| options       | Array   | Options for choice-based types     |
| hideNextOnYes | Boolean | Conditional logic for Yes/No type  |

**Response**
| Field       | Type     | Description                |
|-------------|----------|----------------------------|
| surveyId    | ObjectId | Reference to survey        |
| answers     | Mixed    | Key-value answer pairs     |
| submittedAt | Date     | Submission timestamp       |

---

## 3. Core Modules & Features

### 3.1 Module 1: User Management
**Description:** Authentication system for survey creators.

| Feature           | Details                                          |
|-------------------|--------------------------------------------------|
| Registration      | Name, email, password (min 6 chars)              |
| Login             | Email + password, JWT token in HTTP-only cookie   |
| Logout            | Clears JWT cookie                                |
| Session           | 7-day expiry, auto-redirect if authenticated     |
| Support Contact   | Email, phone, WhatsApp on login page             |

**API Endpoints:**
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| POST   | /api/auth/register    | Create new account  |
| POST   | /api/auth/login       | Authenticate user   |
| POST   | /api/auth/logout      | Clear session       |
| GET    | /api/auth/me          | Get current user    |

### 3.2 Module 2: Survey Builder
**Description:** Dynamic form builder supporting 9 question types with conditional logic.

**Supported Question Types:**

| Type       | Input UI          | Description                              |
|------------|-------------------|------------------------------------------|
| text       | Text input        | Short text answer                        |
| textarea   | Textarea          | Long text answer                         |
| radio      | Radio buttons     | Single choice from options               |
| checkbox   | Checkboxes        | Multiple choice from options             |
| select     | Dropdown          | Single choice dropdown                   |
| number     | Number input      | Numeric answer                           |
| date       | Date picker       | Date selection                           |
| list       | Dropdown          | Select from predefined list items (e.g., product names) |
| yesno      | Yes/No buttons    | Binary choice with conditional logic     |

**Conditional Logic (Yes/No):**
- Default state: Next question is **hidden**
- User selects **"Yes"** → Next question remains **hidden**
- User selects **"No"** → Next question becomes **visible**
- Hidden question answers are excluded from submission

**Builder Features:**
- Add/remove questions dynamically
- Reorder questions (move up/down) in edit mode
- Set questions as required/optional
- Add/remove options for choice-based types
- Real-time preview of question type changes

**API Endpoints:**
| Method | Endpoint                    | Description             |
|--------|-----------------------------|-------------------------|
| GET    | /api/surveys                | List user's surveys     |
| POST   | /api/surveys                | Create new survey       |
| GET    | /api/surveys/[id]           | Get survey + responses  |
| PUT    | /api/surveys/[id]           | Update/edit survey      |
| DELETE | /api/surveys/[id]           | Delete survey + data    |
| PATCH  | /api/surveys/[id]/toggle    | Activate/deactivate     |

### 3.3 Module 3: Public Survey Access
**Description:** Public-facing survey form accessible via unique link without authentication.

| Feature                | Details                                            |
|------------------------|----------------------------------------------------|
| Public URL format      | `/s/{publicId}` (e.g., `/s/abc12345`)              |
| No login required      | Respondents access directly via link               |
| Active check           | Inactive surveys show "Survey Unavailable" message |
| Progress bar           | Live progress tracking as questions are answered   |
| Question numbering     | Numbered badges for visible questions              |
| Required validation    | Custom validation with scroll-to-field + shake animation + red highlight |
| Anonymous submission   | No respondent identity collected                   |
| Thank you screen       | Success confirmation after submission              |

**API Endpoints:**
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/public/[publicId]      | Fetch active survey      |
| POST   | /api/public/[publicId]      | Submit response          |

### 3.4 Module 4: Response Collection
**Description:** Secure storage and management of submitted survey data.

| Feature               | Details                                          |
|-----------------------|--------------------------------------------------|
| Data storage          | MongoDB Atlas cloud database                     |
| Answer format         | Key-value pairs (questionId → answer)            |
| Array support         | Checkbox answers stored as string arrays          |
| Timestamp             | Automatic `submittedAt` on each response          |
| Filtered submission   | Hidden (conditional) question answers excluded    |

### 3.5 Module 5: Analytics Dashboard
**Description:** Visual analytics and response breakdown for each survey.

| Feature               | Details                                           |
|-----------------------|---------------------------------------------------|
| Summary cards         | Total responses, questions, avg completion rate    |
| Copy survey link      | One-click share link copy                          |
| Bar charts            | Gradient colored bars for choice-based questions   |
| Donut chart           | Visual percentage breakdown with color legend      |
| Response rate ring    | Per-question circular progress indicator           |
| Most popular answer   | Highlighted card showing top answer + percentage   |
| Text responses        | Numbered list with timestamps, scrollable          |
| Individual responses  | Card view per respondent with color-coded answers  |
| Tab navigation        | Switch between Analytics and Individual Responses  |

### 3.6 Module 6: Storage Manager (Admin)
**Description:** Database storage monitoring and cleanup tools.

| Feature                   | Details                                        |
|---------------------------|------------------------------------------------|
| Storage gauge             | Circular visual showing used % (color-coded)   |
| Storage bar               | Linear progress bar with MB markers            |
| Free space display        | Prominent MB free with health warnings         |
| Quick stats               | Surveys, responses, free MB, users count       |
| Collection breakdown      | Per-collection size bars with doc counts        |
| Delete old responses      | By age: All time, 1, 7, 14, 30, 60, 90, 180 days |
| Delete all responses      | Wipe all responses, keep surveys               |
| Delete inactive surveys   | Remove paused surveys + their responses        |
| Per-survey cleanup        | Clear responses or delete specific surveys     |
| Confirmation modal        | All destructive actions require confirmation    |
| Result banner             | Success/error feedback after each action        |

**Color-coded storage health:**
| Usage     | Color  | Message                        |
|-----------|--------|--------------------------------|
| < 50%     | Green  | Healthy                        |
| 50% - 80% | Amber  | "Consider cleaning up old data" |
| > 80%     | Red    | "Storage critically low!"      |

**API Endpoints:**
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | /api/admin/stats      | Storage stats + breakdown|
| POST   | /api/admin/cleanup    | Execute cleanup actions  |

---

## 4. User Interface & Pages

| Route                       | Page                  | Access     | Description                      |
|-----------------------------|-----------------------|------------|----------------------------------|
| /                           | Landing Page          | Public     | Login/Register CTA               |
| /login                      | Login                 | Public     | Split layout with support info   |
| /register                   | Register              | Public     | Account creation form            |
| /dashboard                  | Dashboard             | Auth       | Survey list with stats + actions |
| /dashboard/create           | Create Survey         | Auth       | Survey builder form              |
| /dashboard/edit/[id]        | Edit Survey           | Auth       | Modify existing survey           |
| /dashboard/survey/[id]      | Survey Analytics      | Auth       | Response analytics + data        |
| /dashboard/admin            | Storage Manager       | Auth       | Storage monitoring + cleanup     |
| /s/[publicId]               | Public Survey Form    | Public     | Respondent-facing form           |

---

## 5. UI/UX Design Specifications

### 5.1 Design System
- **Primary Color:** Indigo-600 (#4F46E5) with purple gradients
- **Background:** Gradient from slate-50 to indigo-50
- **Cards:** White, rounded-2xl, shadow-sm, border-gray-100
- **Buttons:** Gradient backgrounds with shadow, hover transitions
- **Typography:** System font stack (Arial, Helvetica, sans-serif)
- **Icons:** SVG inline icons throughout

### 5.2 Responsive Design
- **Desktop:** Split layouts, multi-column grids, full sidebar panels
- **Mobile:** Single column, stacked layouts, collapsible sections
- **Login page:** Left branding panel hidden on mobile, support section moves below form

### 5.3 Animations & Interactions
- Loading spinners (border-t animation)
- Shake animation on validation errors
- Scale transitions on Yes/No button selection
- Smooth scroll-to-field on validation
- Hover shadow transitions on cards
- Bounce animation on success checkmark

---

## 6. Security Considerations

| Area             | Implementation                                    |
|------------------|---------------------------------------------------|
| Passwords        | Bcrypt hashing (10 salt rounds)                   |
| Authentication   | JWT stored in HTTP-only cookies                   |
| Session expiry   | 7-day token expiration                            |
| Authorization    | Survey ownership verified on all CRUD operations  |
| Input validation | Server-side validation on all API endpoints       |
| Anonymous access | Public survey responses don't collect identity    |

---

## 7. Environment Configuration

| Variable          | Description                    | Example                              |
|-------------------|--------------------------------|--------------------------------------|
| MONGODB_URI       | MongoDB connection string      | mongodb+srv://user:pass@cluster/db   |
| JWT_SECRET        | JWT signing secret             | your-secret-key                      |
| NEXT_PUBLIC_APP_URL| Application base URL          | http://localhost:3000                |

---

## 8. Deployment Guide

### Local Development
```bash
cd survey-app
npm install
npm run dev
# Open http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

### Network Access
Other devices on the same network can access via:
```
http://<your-ip>:3000
```

---

## 9. Future Enhancements (Roadmap)

| Priority | Feature                          | Description                              |
|----------|----------------------------------|------------------------------------------|
| High     | Export responses                  | CSV/Excel download of survey data        |
| High     | Email notifications              | Alert on new responses                   |
| Medium   | Survey templates                 | Pre-built survey templates               |
| Medium   | File upload question type        | Allow respondents to upload files         |
| Medium   | Survey duplication               | Clone existing surveys                   |
| Medium   | Response time analytics          | Track time spent on survey               |
| Low      | Multi-language support           | Internationalization (i18n)              |
| Low      | Custom branding                  | Logo, colors per survey                  |
| Low      | Collaboration                    | Multiple users managing same survey      |
| Low      | Webhook integrations             | Send responses to external services      |

---

## 10. Support & Contact

| Channel   | Details                         |
|-----------|---------------------------------|
| Email     | srinivas.maddy@spoors.in        |
| Phone     | +91 7569541542                  |
| WhatsApp  | +91 7569541542                  |

---

*Document Version: 1.0 | Last Updated: March 2026*
