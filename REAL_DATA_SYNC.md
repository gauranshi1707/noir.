# Noir: Real Data Synchronization System

## Overview

Noir now features a fully persistent backend system that tracks study sessions, streaks, collectibles, and analytics in real-time. All data is synchronized across the application and persists permanently in PostgreSQL via Supabase.

## Data Flow Architecture

### Timer Session Completion

1. **Timer Running**: User starts a study session via the Timer component
   - Session duration tracked in real-time
   - State stored in localStorage for refresh persistence via `useTimerSession` hook

2. **Timer Complete**: When timer reaches 0:
   - Session data sent to `/api/timer-sessions` endpoint
   - Backend creates TimerSession record with duration_seconds
   - Streak calculations triggered automatically
   - Collectible rewards distributed (weighted random selection)
   - Theme unlocks evaluated (7-day streak + study hour thresholds)
   - Analytics updated (total_study_minutes, total_sessions, current_streak)

3. **Immersive Room Updates**: Collectibles and room display reflect unlocked artifacts
   - ImmersiveRoom component fetches `/api/collectibles` endpoint
   - Real user collectibles loaded on mount
   - Room environment displays locked (gold-outlined) vs unlocked (full visibility) items

4. **Dossier Statistics**: Real analytics displayed in Dossier section
   - Fetches `/api/analytics` endpoint on component mount
   - Displays: total sessions, total study hours, current streak, unlocked collectibles
   - Data refreshes automatically when sessions complete

## Core Components

### `hooks/use-timer-session.ts`
Manages client-side session persistence and server communication.

**Functions:**
- `startSession()` - Marks session as running
- `pauseSession()` - Pauses active session
- `resetSession()` - Clears all session data
- `recordElapsedTime(seconds)` - Updates elapsed time for resume capability
- `completeSession()` - POSTs session to backend, clears localStorage

**localStorage Key:** `noir_timer_session`
- Stores: startTime, elapsedSeconds, isRunning

### `components/timer.tsx`
UI for 25-minute (or custom) study sessions.

**Integration:**
- Uses `useTimerSession` hook for persistence
- Calls `completeSession()` when timer reaches 0
- Supports pause/resume without data loss
- localStorage persists timer state across page refreshes

### `components/immersive-room.tsx`
Room selector + immersive environment with real collectibles.

**Features:**
- Fetches `/api/collectibles` to load user's unlocked items
- Displays 3 rooms: Bibliothèque, Monastic, Victorian
- 2x3 centered grid layout (symmetrical, museum-like)
- Locked items shown as blurred silhouettes with gold outlines
- Unlocked items display full images with shimmer animations

### `components/room-environment.tsx`
Cinematic room display with positioned collectibles.

**Removed:**
- Statistics bar (analytics moved to Dossier)
- Dashboard-style UI elements
- Now purely atmospheric/cinematic

**Added:**
- CollectibleCard sub-component with elegant locked/unlocked states
- Soft gold glows on hover
- Shimmer animation on first unlock
- Centered 2x3 grid layout with staggered fade-in animations

### `components/dossier-section.tsx`
Real-time analytics dashboard.

**Displays (fetched from `/api/analytics`):**
- Total Sessions Completed
- Total Study Hours
- Current Streak (days)
- Collectibles Unlocked (X / 6)

**Data Source:** `/api/analytics` endpoint returns aggregated user statistics

## API Endpoints

All endpoints are secured via Supabase RLS (Row Level Security).

### `/api/timer-sessions` (POST)
**Purpose:** Record a completed study session

**Request:**
```json
{
  "duration_seconds": 1500
}
```

**Backend Logic:**
1. Creates timer_sessions record
2. Updates/creates study_streaks entry (streak logic: 120 min/day = +1)
3. Awards collectible if earned
4. Unlocks theme if threshold met
5. Updates analytics totals

**Response:**
```json
{
  "sessionId": "uuid",
  "durationSeconds": 1500,
  "streakUpdated": true,
  "collectibleUnlocked": null,
  "themeUnlocked": null
}
```

### `/api/analytics` (GET)
**Purpose:** Fetch user analytics

**Response:**
```json
{
  "total_study_minutes": 125,
  "total_sessions": 5,
  "current_streak": 2,
  "longest_streak": 3,
  "unlocked_collectibles": 2,
  "best_streak_day": 120
}
```

### `/api/collectibles` (GET)
**Purpose:** Fetch user's unlocked collectibles

**Response:**
```json
[
  {
    "id": "user-collectible-uuid",
    "collectible_id": "candle",
    "acquired_at": "2025-05-06T10:30:00Z"
  },
  ...
]
```

## Data Persistence Strategy

### Supabase PostgreSQL Schema

**timer_sessions** table:
- Tracks every completed study session
- Foreign key to auth.users(id)
- Indexed on user_id, completed_at for fast queries

**study_streaks** table:
- One record per user (unique constraint on user_id)
- current_streak, longest_streak, last_session_date
- Auto-managed by trigger on timer_sessions INSERT

**user_collectibles** table:
- Junction table: user_id + collectible_id (unique constraint)
- acquired_at timestamp for unlock animations
- Auto-populated by collectible reward logic in timer-sessions API

**analytics** table:
- Aggregated stats per user
- Updated after every timer session
- total_study_minutes, total_sessions, current_streak

### localStorage (Client-Side)

**Key:** `noir_timer_session`
**Use:** Session persistence during active timer
**Lifetime:** Cleared after successful session save
**Purpose:** Resume timer capability if user refreshes during active session

## Real-Time Data Flow Example

### Scenario: User completes 25-minute study session

1. **Timer Complete (Client)**
   ```
   Timer reaches 00:00:00
   → completeSession() called
   → POST /api/timer-sessions { duration_seconds: 1500 }
   ```

2. **Backend Processing (Server)**
   ```
   POST /api/timer-sessions received
   → Create timer_sessions record
   → Check streak: Did user study 120+ minutes today?
     → YES: increment study_streaks.current_streak
     → NO: reset to 0
   → Generate collectible reward (weighted random)
   → Check if collectible already owned → NO: unlock it
   → Insert into user_collectibles
   → Update analytics totals
   → Return success response
   ```

3. **Frontend Update (Client)**
   ```
   Response received
   → Clear localStorage
   → Show unlock modal (if collectible awarded)
   → Navigation available
   ```

4. **Data Reflection**
   ```
   Dossier Section:
   → Next view shows: sessions +1, hours +0.41, streak tracking
   
   Immersive Room:
   → Next visit shows newly unlocked collectible (no longer blurred)
   → Shimmer animation plays on newly revealed item
   ```

## Guarantees

✅ **Persistent Storage**: All data saved in PostgreSQL, survives app restarts
✅ **Session Resume**: Timer state persists; refresh during session resumes correctly
✅ **Real Stats**: Dossier shows actual aggregated data, not placeholders
✅ **Synchronized Unlocks**: Collectibles reflect real earned progress
✅ **Atomic Operations**: Session + streak + collectible + analytics updated together
✅ **RLS Protected**: Users can only access their own data

## Testing Checklist

- [ ] Start timer, pause, resume → continues from correct time
- [ ] Start timer, refresh page during countdown → timer resumes
- [ ] Complete session → collectible unlocks if earned
- [ ] Dossier shows real session count after completion
- [ ] Room displays newly unlocked collectible
- [ ] Refresh page → all data persists
- [ ] Multiple sessions in day → streak increments correctly
- [ ] Miss a day → streak resets on next check
