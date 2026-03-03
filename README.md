# MyDent — Dental Aligner Treatment Platform

MyDent is a full-stack dental aligner treatment platform that supports patients through their orthodontic journey — from initial consultation and bite-type assessment to appointment booking, virtual monitoring, e-commerce for dental products, AI-powered smile preview, and video consultations.

The platform serves three user roles: **Patient**, **Doctor**, and **Admin**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | NestJS (TypeScript), Express |
| **Database** | MongoDB (Mongoose ODM) |
| **Frontend** | React Native (Expo SDK 54), TypeScript |
| **Navigation** | React Navigation (Drawer + Bottom Tabs + Native Stack) |
| **State Management** | React Context API (Auth, User, Cart, Favorites) |
| **Server State** | TanStack React Query v5 |
| **HTTP Client** | Axios |
| **Authentication** | JWT (Passport.js), OTP via email |
| **Payments** | Razorpay |
| **Email** | Nodemailer (SMTP) + Resend SDK |
| **Media Storage** | Cloudinary |
| **AI/ML** | Cloudinary Generative AI (smile enhancement) |
| **Video Playback** | expo-av, react-native-video |
| **Maps** | react-native-maps |
| **UI** | React Native Paper, Moti, Expo Linear Gradient, NativeBase |
| **Build/Deploy** | EAS Build (mobile), Docker (backend on Render) |

---

## Features

### 1. Authentication & Authorization

**Problem:** Secure, role-based access for patients, doctors, and admins with a smooth onboarding flow.

**Solution:**
- JWT-based authentication with separate login/signup flows for each role.
- OTP login — a 6-digit code sent via email, cached in-memory with a 5-minute TTL.
- Email verification on signup using OTP.
- Forgot/Reset password flow — OTP verification → temporary reset token → new password, with deep linking (`myapp://reset-password?token=...`).
- Guest mode for limited browsing without an account.
- Passwords hashed with bcryptjs.

### 2. Multi-Step Consultation Booking

**Problem:** Collecting detailed patient information for a personalized orthodontic consultation.

**Solution:**
- A guided, multi-step form flow: age group → teeth issue → problem details → medical history → gender → smoking status → availability → checkout.
- Each step is a dedicated screen, keeping the UX clean and focused.
- Data is aggregated and stored on the user's profile upon completion, enabling doctors to review the full patient context before a consultation.

### 3. Appointment Management

**Problem:** Coordinating appointments between patients and doctors with status and payment tracking.

**Solution:**
- Appointment schema linking doctor and user references, with status tracking (`pending` / `scanned` / `done`) and payment status (`pending` / `paid`).
- Doctors can view assigned users, upcoming and conducted appointments, revenue, and progress statistics (scanned / paid / pending).
- Admin can assign, reassign, or unassign doctors to patients and update treatment steps.

### 4. Doctor Management

**Problem:** Managing doctor profiles, specializations, and performance metrics.

**Solution:**
- Doctor profiles store specialization, DCI registration number, languages spoken, and pass-related info.
- Endpoints provide monthly statistics, revenue summaries, reviews, and appointment breakdowns.
- Admin has full CRUD control over doctor records, including the ability to update treatment info and manage assignments.

### 5. AI Smile Enhancement (Nano Banana)

**Problem:** Patients want to visualize how their smile will look after aligner treatment before committing.

**Solution:**
- Patients upload a photo through the app.
- The backend sends the image to Cloudinary's Generative AI (`e_gen_replace`) to produce an enhanced smile preview.
- Both the original and enhanced images are stored, along with processing time, giving patients a compelling before/after comparison.

### 6. E-Commerce (Shop)

**Problem:** Offering dental care products alongside clinical services.

**Solution:**
- Full product catalog with categories, pricing (original + discounted), tags, multi-image support via Cloudinary, and detailed product info (benefits, ingredients, how-to-use, caution).
- Flags for best-seller, combo, and recommended products.
- Per-user shopping cart with add, update quantity, remove, and clear operations.
- Per-user favorites/wishlist for quick access to preferred products.
- Integrated Razorpay payment gateway — server creates orders (INR → paise), client completes via `react-native-razorpay`, server verifies HMAC SHA256 signature.

### 7. In-App Currency (Coins)

**Problem:** Incentivizing user engagement and offering flexible payment/reward options.

**Solution:**
- A coins system tracking total, bonus, purchased, and consultation coins per user.
- Coins can be earned through activities and used towards services or products.

### 8. Video Consultations (Meet)

**Problem:** Enabling remote consultations between patients and doctors.

**Solution:**
- Meet module stores meeting links, date, time, and links to both the user and doctor.
- Endpoints allow both parties to retrieve their scheduled meetings.
- Video playback powered by expo-av and react-native-video.

### 9. Support Ticket System

**Problem:** Patients need a way to report issues and track resolution.

**Solution:**
- Users create tickets with a title, message, category, and optional file attachment (uploaded to Cloudinary).
- Ticket statuses progress through `open` → `in_progress` → `resolved` → `closed`.
- Provides a structured communication channel between patients and the support team.

### 10. Blog & Educational Content

**Problem:** Educating patients about dental health, aligners, and treatment options.

**Solution:**
- Blog posts with title, date, author, category, images, and rich content.
- Bite-type educational content — each bite type has a title and associated educational videos.
- Aligner product info with images, videos, and pricing.
- Before/after transformation showcases with images and descriptions.

### 11. Dental Center Discovery

**Problem:** Helping patients find nearby clinics with relevant details.

**Solution:**
- Centers organized by city, each with multiple clinics listing name, image, address, operating hours, phone number, and directions link.
- Services offered at each city are listed.
- Google Maps integration via react-native-maps for clinic locations.

### 12. Patient Reports

**Problem:** Storing and sharing dental scan/X-ray images for patient records.

**Solution:**
- Report module links uploaded image URLs (via Cloudinary) to user profiles.
- Doctors and patients can access reports for treatment monitoring.

### 13. Doctor Reviews

**Problem:** Collecting patient feedback for doctors to maintain quality.

**Solution:**
- Rating (1–5) and comment system linked to a doctor, user, and optional appointment.
- Reviews are accessible on doctor profiles for transparency.

### 14. Carousel / Banners

**Problem:** Dynamic promotional content across different sections of the app.

**Solution:**
- Banner images with typed placement: `top`, `bottom`, `mydent`, `shop-top`, `shop-middle`, `shop-bottom`, `bite-type`.
- Each banner links to a specific screen for targeted navigation.

### 15. Admin Dashboard

**Problem:** Centralized management of users, doctors, and treatment workflows.

**Solution:**
- Full control over user and doctor records (CRUD).
- Assign, reassign, or unassign doctors to patients.
- Update treatment steps and doctor pass info.
- Delete users or doctors as needed.

### 16. Email Notifications (Mailer)

**Problem:** Reliable transactional email delivery for OTPs and account actions.

**Solution:**
- Nodemailer-based SMTP service sending branded HTML email templates.
- Handles OTP delivery for login, signup verification, and password reset flows.

---

## Architecture

```
┌─────────────────────────────────────────┐
│          React Native (Expo)            │
│  ┌─────────────┐  ┌──────────────────┐  │
│  │ Auth Context │  │ TanStack Query   │  │
│  │ User Context │  │ (server state)   │  │
│  │ Cart Context │  └────────┬─────────┘  │
│  │ Fav Context  │           │            │
│  └──────┬──────┘           │            │
│         └───────┬──────────┘            │
│                 │ Axios                  │
│                 ▼                        │
└─────────────────┬───────────────────────┘
                  │ HTTPS (JWT Bearer)
                  ▼
┌─────────────────────────────────────────┐
│          NestJS API Server              │
│  ┌──────────────────────────────────┐   │
│  │ 23+ Modules (Auth, User, Doctor, │   │
│  │ Admin, Product, Cart, Payment,   │   │
│  │ Meet, Ticket, Coins, Blogs, ...) │   │
│  └──────────┬───────────────────────┘   │
│             │                           │
│  ┌──────────▼──────────┐                │
│  │   Mongoose ODM      │                │
│  └──────────┬──────────┘                │
│             │                           │
└─────────────┼───────────────────────────┘
              │
     ┌────────▼────────┐
     │     MongoDB      │
     └─────────────────┘

External Services:
  • Razorpay (payments)
  • Cloudinary (media storage + AI smile enhancement)
  • SMTP (email / OTP delivery)
```

---

## Project Structure

```
Mydent/
├── doctor-appointment-app/     # NestJS Backend
│   ├── src/
│   │   ├── admin/              # Admin management
│   │   ├── aligners/           # Aligner product info
│   │   ├── appointments/       # Appointment scheduling
│   │   ├── auth/               # Authentication & OTP
│   │   ├── bite-type/          # Bite type education
│   │   ├── blogs/              # Blog content
│   │   ├── carousel/           # Banner management
│   │   ├── cart/               # Shopping cart
│   │   ├── centers/            # Dental center discovery
│   │   ├── coins/              # In-app currency
│   │   ├── contacts/           # Contact info
│   │   ├── doctor/             # Doctor profiles & stats
│   │   ├── doctors-team/       # Team display profiles
│   │   ├── experts/            # Expert profiles
│   │   ├── favorite/           # Product wishlist
│   │   ├── mailer/             # Email service
│   │   ├── meet/               # Video consultations
│   │   ├── nano-banana/        # AI smile enhancement
│   │   ├── payment/            # Razorpay integration
│   │   ├── product/            # E-commerce products
│   │   ├── report/             # Patient reports
│   │   ├── review/             # Doctor reviews
│   │   ├── ticket/             # Support tickets
│   │   ├── transformation/     # Before/after showcases
│   │   ├── user/               # User profiles
│   │   └── utils/              # Shared utilities
│   └── public/                 # Static HTML pages
│
└── view/                       # React Native (Expo) Frontend
    ├── src/
    │   ├── api/                # Axios API layer
    │   ├── components/         # Reusable UI components
    │   ├── constants/          # App constants
    │   ├── contexts/           # React Context providers
    │   ├── hooks/              # Custom React hooks
    │   ├── navigation/         # Navigation configuration
    │   ├── screens/            # App screens (48+)
    │   └── utils/              # Utility functions
    ├── assets/                 # Fonts, images, static assets
    └── android/                # Native Android project
```

---

## Getting Started

### Backend

```bash
cd doctor-appointment-app
npm install
npm run start:dev
```

The server runs on port 3000 by default. Requires environment variables for MongoDB URI, JWT secret, Razorpay keys, Cloudinary credentials, and SMTP configuration.

### Frontend

```bash
cd view
npm install
npx expo start
```

Use the Expo Go app or build locally with EAS:

```bash
eas build --profile development --platform android
eas build --profile preview --platform android    # APK
eas build --profile production --platform android  # AAB
```

---

## Deployment

- **Backend**: Dockerized and deployed on [Render](https://render.com) at `mydent-api.onrender.com`
- **Mobile App**: Built and distributed via Expo Application Services (EAS)

---

## License

This project is proprietary. All rights reserved.
