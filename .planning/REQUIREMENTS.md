# Requirements: Deepak & Reshami Wedding Portfolio

## Overview
A single-page application (SPA) that acts as a wedding invitation and memory board, with an admin dashboard for content management.

## Technical Requirements
- **Framework:** None (Vanilla HTML/CSS/JS).
- **Backend:** None (localStorage for persistence).
- **Hosting:** Static hosting (GitHub Pages, Netlify, etc.).

## 0. Initial State
- [ ] System must initialize with default data for Deepak & Reshami.
- [ ] System must check `localStorage` for overrides on each load.

## 1. Public Page
### 1.1 Header Section
- [ ] Announcement title "Wedding of Deepak & Reshami".
- [ ] Wedding dates clearly displayed.

### 1.2 Music Player
- [ ] Auto-playing background music (with browser-compliant handling, e.g., click to start or initial mute).
- [ ] Mute/Unmute toggle.

### 1.3 Pre-Wedding Section
- [ ] Image gallery/carousel with smooth transitions.
- [ ] Embedded video player (YouTube or local path).

### 1.4 Event Schedule Section
- [ ] Timeline or card-based layout for events:
  - 23 April - Mandap
  - 24 April - Haldi/Mahandi
  - 25 April - Tilak
  - 26 April - Vidai

### 1.5 Couple Details Section
- [ ] Profile cards for Deepak (Groom) and Reshami (Bride).
- [ ] Grandparent, parent, and residence info displayed clearly.

### 1.6 Reviews/Wishes Section
- [ ] Carousel showing wedding wishes/reviews.
- [ ] Each slide showing photos + text.

### 1.7 Add to Calendar
- [ ] Button to add events to Google/Apple/Outlook.

### 1.8 Responsive Design
- [ ] Seamless transitions between mobile, tablet, and desktop.

## 2. Admin Dashboard
### 2.1 Access Control
- [ ] Locked behind a password prompt (e.g., "DeepakReshami2026").
- [ ] Login screen with basic validation.

### 2.2 Dashboard Features
- [ ] Edit primary text (names, titles).
- [ ] Manage gallery images (add/remove).
- [ ] Replace background music (local file upload to Base64 in localStorage).
- [ ] Manage Reviews/Wishes (CRUD and reorder).
- [ ] Manage Events (CRUD).

## 3. UI/UX Excellence
- [ ] Use modern CSS tokens for colors and spacing.
- [ ] Glassmorphism effects (backdrop-filter: blur).
- [ ] Google Fonts (Inter, Playfair Display for elegant feel).
- [ ] Smooth reveal animations on scroll.
