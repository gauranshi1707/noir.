# Noir Backend Implementation

## Overview

Noir is a minimalist study companion app with a powerful backend architecture built on Next.js, Supabase, and PostgreSQL. The backend implements a complete gamification system with streaks, collectibles, themes, and analytics.

## Database Schema

### Core Tables

#### `profiles`
Stores user profile information created automatically on signup via trigger.
- `id` (UUID, PK) - Links to auth.users
- `display_name` (TEXT) - User's display name
- `email` (TEXT) - User's email
- `created_at`, `updated_at` (TIMESTAMP)

#### `timer_sessions`
Records every completed study session from the Hourglass timer.
- `id` (UUID, PK)
- `user_id` (UUID, FK) - Reference to user
- `duration_seconds` (INTEGER) - Session duration in seconds
- `completed_at` (TIMESTAMP) - When session was completed
- `created_at` (TIMESTAMP)

#### `study_streaks`
Tracks user's study streak (1 per user, auto-created on signup).
- `current_streak` (INTEGER) - Days in current streak
- `longest_streak` (INTEGER) - Longest streak ever achieved
- `last_session_date` (DATE) - Date of last study session
- **Streak Logic**: User gets +1 streak if they study ≥120 minutes in a day. Streak resets if they miss a day (gap > 1 day).

#### `tasks`
User-created tasks with priority and status tracking.
- `title` (TEXT) - Task title
- `description` (TEXT) - Optional description
- `status` (TEXT) - 'pending' | 'in_progress' | 'completed'
- `priority` (TEXT) - 'low' | 'medium' | 'high'
- `due_date` (DATE) - Optional due date

#### `notes`
User-created notes during study sessions.
- `title` (TEXT) - Note title
- `content` (TEXT) - Note content (up to 50KB)

#### `collectibles`
System table of available collectibles (crystals, gems, etc). Seeded manually.
- `name` (TEXT) - Collectible name
- `description` (TEXT) - Description
- `rarity` (TEXT) - 'common' | 'uncommon' | 'rare'
- `weight` (INTEGER) - Probability weight for random selection

#### `user_collectibles`
Junction table for user-owned collectibles.
- Prevents duplicates via UNIQUE constraint on (user_id, collectible_id)
- `acquired_at` (TIMESTAMP) - When user acquired the collectible

#### `themes`
System table of unlockable UI themes.
- `name` (TEXT) - Theme name (e.g., "Midnight", "Aurora", "Nebula")
- `unlock_type` (TEXT) - 'streak' | 'hours'
- `unlock_value` (INTEGER) - Threshold to unlock

#### `user_themes`
User's unlocked themes and active theme selection.
- `is_active` (BOOLEAN) - Currently selected theme

#### `room_decorations`
User's personalization settings for study room.
- `ambience` (TEXT) - 'minimal' | 'cozy' | 'cosmic' | 'forest' | 'urban'
- `light_mode` (TEXT) - 'dark' | 'light'
- `accent_color` (TEXT) - Hex color value

#### `ambience_preferences`
User's sound and visual preferences.
- `background_sound` (TEXT) - None | 'rain' | 'forest' | 'coffee_shop' | 'library'
- `particle_effects` (BOOLEAN) - Enable particle effects
- `ambient_light` (BOOLEAN) - Enable ambient lighting

#### `analytics`
Aggregated user statistics (1 per user, auto-created on signup).
- `total_study_minutes` (INTEGER) - Cumulative study minutes
- `total_sessions` (INTEGER) - Total number of sessions
- `best_streak_day` (INTEGER) - Longest single-day streak

## API Routes

### Timer Sessions
**`POST /api/timer-sessions`** - Record a completed study session
```json
{
  "duration_seconds": 1500
}
```
Response includes:
- New session record
- Updated streak info
- Random collectible if ≥120 minutes studied today
- Newly unlocked themes
- Updated analytics

**`GET /api/timer-sessions`** - Get user's last 50 sessions

### Streaks
**`GET /api/streaks`** - Get user's current and longest streak

### Collectibles
**`GET /api/collectibles`** - Get user's owned collectibles with metadata

### Analytics
**`GET /api/analytics`** - Get user's study statistics

### Tasks
**`GET /api/tasks?status=pending`** - Get tasks, optionally filtered by status
**`POST /api/tasks`** - Create a new task

### Notes
**`GET /api/notes`** - Get user's notes
**`POST /api/notes`** - Create a new note

### Room Decorations
**`GET /api/room-decorations`** - Get user's room customization
**`PUT /api/room-decorations`** - Update room decoration settings

### Ambience Preferences
**`GET /api/ambience-preferences`** - Get user's ambience settings
**`PUT /api/ambience-preferences`** - Update ambience preferences

### Themes
**`GET /api/themes`** - Get user's unlocked themes and active theme
**`PUT /api/themes`** - Activate a theme

## Authentication

Uses Supabase Auth with email/password and optional Google OAuth. All routes require valid session.

- Auth callback: `/auth/callback`
- Middleware handles session refresh and cookie management
- RLS policies enforce user-scoped data access

## Key Features

### Streak System
- Increments by 1 when user studies ≥120 minutes in a calendar day
- Resets to 0 if user misses a day (gap > 1 day since last session)
- Tracks longest streak ever achieved

### Collectible Rewards
- Users earn random collectibles when they study ≥120 minutes in a day
- Weighted random selection based on rarity (common/uncommon/rare)
- Prevents duplicates until all collectibles are owned
- Returns duplicates once all collected

### Theme Unlocks
- **Streak Milestones**: "Midnight" @ 7-day streak, "Aurora" @ 30-day streak
- **Study Hours**: "Nebula" @ 100 hours, "Obsidian" @ 500 hours
- Themes auto-unlock when thresholds are met

### Data Validation
Uses Zod schemas for all inputs:
- `timerSessionSchema` - Validates positive duration
- `taskSchema` - Validates task properties
- `noteSchema` - Validates note title/content
- `roomDecorationSchema` - Validates ambience choices
- `ambiencePreferenceSchema` - Validates sound/effect preferences

## Row Level Security (RLS)

All user tables have RLS enabled. Policies restrict access to the authenticated user only:
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

Public tables (`collectibles`, `themes`) allow read-only access to all authenticated users.

## Utility Functions

Located in `lib/noir-utils.ts`:
- `updateStreak()` - Increment streak if ≥120 min studied today
- `getRandomCollectible()` - Get weighted random collectible, avoiding duplicates
- `awardCollectible()` - Add collectible to user's collection
- `checkAndUnlockThemes()` - Check and unlock themes based on thresholds
- `updateAnalytics()` - Increment study statistics

## Trigger: Auto-Profile Creation

When a user signs up, the `handle_new_user()` trigger automatically creates:
- User profile with email as display name
- Study streak record (0/0 streaks)
- Room decorations (default: minimal dark theme)
- Ambience preferences (default: no sound, no particles, ambient light on)
- Analytics record (0/0/0 stats)

This ensures all dependent tables have records before user's first API call.

## Error Handling

All API routes include:
- Authentication checks (401 Unauthorized)
- Input validation (400 Bad Request with error message)
- Automatic error logging to console with [Noir API] prefix
- Proper HTTP status codes

## Environment Variables

Required Supabase environment variables (auto-populated by integration):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` (for auth redirects in dev)

## Performance Optimizations

- Session queries limited to last 50 records
- Collectible UNIQUE constraint prevents duplicate inserts
- Analytics updated incrementally (not recalculated)
- Indexed foreign keys for efficient joins
- Minimal API responses with only required fields

## Seeding Collectibles

Manual seed to `collectibles` table (run once):
```sql
INSERT INTO public.collectibles (name, description, rarity, weight) VALUES
('Amethyst Crystal', 'Purple crystal', 'common', 10),
('Rose Quartz', 'Pink crystal', 'common', 10),
('Citrine', 'Yellow crystal', 'uncommon', 5),
('Moonstone', 'White crystal', 'uncommon', 5),
('Black Tourmaline', 'Black crystal', 'rare', 2),
('Emerald', 'Green crystal', 'rare', 2);
```

Seeding themes (run once):
```sql
INSERT INTO public.themes (name, description, unlock_type, unlock_value) VALUES
('Midnight', 'Deep blue and dark', 'streak', 7),
('Aurora', 'Northern lights inspired', 'streak', 30),
('Nebula', 'Cosmic purple', 'hours', 100),
('Obsidian', 'Pure black obsidian', 'hours', 500);
```

