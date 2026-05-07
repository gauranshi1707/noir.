# Noir: End Session Functionality - Complete Implementation

All session lifecycle functionality has been successfully implemented. Sessions now follow an intentional, cinematic ritual pattern.

## Session Lifecycle Overview

### Five States

1. **Idle** - No active session
   - Timer/Memento showing default state
   - All controls ready
   - Can start new session

2. **Active (Running)** - Session in progress
   - Timer/stopwatch counting
   - "Pause" button visible
   - "End Session" button visible
   - Session data temporarily stored in localStorage

3. **Active (Paused)** - Session paused but not concluded
   - Timer/stopwatch frozen
   - "Resume" button visible
   - "End Session" button visible
   - Session state preserved in localStorage
   - Can resume without loss of data

4. **Confirmation** - User prompted to conclude
   - Modal displayed with elegant confirmation
   - "Continue" or "Conclude" options
   - Non-aggressive, atmospheric presentation

5. **Saving** - Session being persisted
   - Buttons disabled with "saving..." text
   - Gentle loading state
   - User cannot interrupt save process

6. **Complete** - Session saved to Dossier
   - Returns to Idle state
   - Session appears in Dossier
   - Streaks updated
   - Analytics refreshed
   - Collectibles evaluated

## Data Flow: Session Start to Completion

```
┌─ User clicks "begin" / "start"
│  └─ setIsSessionActive(true)
│  └─ setIsRunning(true)
│  └─ startSession() hook called
│  └─ Session state written to localStorage
│
├─ Timer/Memento counting
│  └─ Every second: recordElapsedTime(newElapsed)
│  └─ Persists to localStorage (temporary, NOT backend)
│  └─ No network calls during active session
│
├─ User clicks "pause"
│  └─ setIsRunning(false)
│  └─ pauseSession() hook called
│  └─ Session marked isPaused=true in localStorage
│  └─ "Resume" button appears
│
├─ User clicks "resume"
│  └─ setIsRunning(true)
│  └─ resumeSession() hook called
│  └─ Timer continues from stored elapsed time
│
├─ User clicks "end session"
│  └─ Modal confirmation displayed
│  └─ Message: "This study session will be recorded..."
│
├─ User clicks "conclude" in modal
│  └─ setShowEndConfirm(false)
│  └─ setIsSavingSession(true)
│  └─ endSession() hook called
│  └─ POST /api/timer-sessions { duration_seconds }
│  └─ Backend processes:
│     ├─ Creates timer_sessions record
│     ├─ Updates study_streaks
│     ├─ Evaluates collectible unlocks
│     ├─ Updates analytics
│     └─ Returns success
│
└─ Session saved successfully
   └─ localStorage cleared
   └─ setIsSessionActive(false)
   └─ Timer reset to initial value
   └─ UI returns to Idle state
   └─ Dossier auto-refreshes (10-second interval)
   └─ Newly created session appears in Dossier
   └─ Collectible update reflects in Rooms
```

## Implementation Details

### useTimerSession Hook (`hooks/use-timer-session.ts`)

**State Structure:**
```typescript
interface SessionData {
  startTime: number        // When session started or resumed
  elapsedSeconds: number   // Total elapsed time
  isRunning: boolean       // True if actively counting
  isPaused: boolean        // True if paused (not idle)
}
```

**Storage Key:** `noir_active_session` (in localStorage)

**Functions:**
- `startSession()` - Begin new session, mark as running
- `pauseSession()` - Pause without ending, mark as paused
- `resumeSession()` - Resume from paused state
- `recordElapsedTime(seconds)` - Update elapsed time (local only)
- `endSession()` - **ONLY** saves to backend when explicitly called
- `resetSession()` - Clear all session state

**Critical Behavior:**
- Sessions are NEVER auto-saved
- NO backend call until `endSession()` explicitly invoked
- localStorage used ONLY for temporary state preservation
- Refresh/tab switch restores session correctly

### Timer Component (`components/timer.tsx`)

**New State:**
- `isSessionActive` - Tracks if session is currently active
- `showEndConfirm` - Controls confirmation modal display
- `isSavingSession` - Disables buttons during save

**Button Logic:**
```
If NOT running AND NOT active:
  └─ Show "begin" button

If running:
  └─ Show "pause" button

If paused (active but not running):
  └─ Show "resume" button

If active (running or paused):
  └─ Show "end session" button
  └─ Muted gold styling (subtle, elegant)

Always:
  └─ Show "reset" button
```

**End Session Flow:**
1. User clicks "end session"
2. Confirmation modal appears (elegant, minimal)
3. User confirms or cancels
4. On confirm: `endSession()` called → backend save → clear UI
5. Timer resets to initial minutes

### Memento Component (`components/memento-section.tsx`)

**Identical to Timer:**
- Same session state management
- Same button logic
- Same confirmation modal
- Same "end session" flow
- Atmospheric stopwatch aesthetic

### Confirmation Modal

**Design:**
- Backdrop blur: `backdrop-blur-sm`
- Border: `border-amber-600/30` (gold tint)
- Title: "conclude session?" (lowercase, elegant)
- Message: Explains session will be recorded
- Buttons: "continue" or "conclude"
- Non-aggressive, non-gamified
- Soft gold highlights on confirm button

**Animations:**
- Entry: `scale: 0.95 → 1.0`, `opacity: 0 → 1`
- Duration: 400ms with easeOut
- Exit: Reverse animation
- Backdrop: 300ms fade

## Key Guarantees

✅ **Only Explicit Conclusion Saves**
- Sessions ONLY saved when user clicks "end session" → confirms
- NOT saved on tab switch, page refresh, or timer completion
- Accidental closes don't lose work (session restores on refresh)

✅ **Persistence During Session**
- localStorage stores active session state
- Refresh restores timer to exact position
- Can pause/resume indefinitely without data loss

✅ **No Auto-Saves**
- Timer counting doesn't trigger backend saves
- No background sync during active session
- Clean, intentional user control

✅ **Dossier as Single Archive**
- Only Dossier displays session history
- Each session appears with date/time/duration
- Newest sessions first
- Real-time updates after conclusion

✅ **Elegant Closure Ritual**
- Confirmation modal feels cinematic, not aggressive
- Gold accents maintain luxury aesthetic
- No bright colors or notifications
- Feels like concluding a study ritual

## UI/UX Details

### "End Session" Button Styling
- Border: `border-amber-600/40` (muted gold)
- Text: `text-amber-700/50` (subtle deep amber)
- Hover: Border `/70`, text `/70` (gentle intensification)
- Muted presence: Doesn't distract from active session

### Confirmation Modal
- Title uses lowercase: "conclude session?"
- Measured, respectful language
- No urgency or pressure
- Soft colors and smooth animations

### Save State
- "saving..." text on button
- Button disabled during save
- No aggressive spinner or animation
- Quiet, professional appearance

## Edge Cases Handled

1. **User refreshes during active session**
   - Session state restored from localStorage
   - Timer resumes from stored elapsed time
   - No data loss

2. **User closes tab mid-session**
   - Session data persists in localStorage
   - Reopening the site restores session
   - Can continue or reset

3. **User navigates between Hourglass and Memento**
   - Both share same useTimerSession hook
   - Session state synchronized
   - Both show consistent state

4. **Multiple browser tabs**
   - localStorage acts as shared state
   - Tabs can have different UI (one showing timer, one showing memento)
   - Session persists across all tabs

5. **Failed backend save**
   - Error logged to console
   - Button shows error feedback
   - Session remains in localStorage
   - User can retry

## Session → Dossier Integration

**When Session Ends Successfully:**
1. Backend creates timer_sessions record
2. Calculates duration from start/end timestamps
3. Updates study_streaks table
4. Evaluates collectible unlock conditions
5. Creates user_collectibles entries if earned
6. Updates analytics aggregations
7. Returns success response

**Dossier Refresh:**
- Fetches from `/api/analytics` (overview stats)
- Fetches from `/api/timer-sessions` (session records)
- Auto-refreshes every 10 seconds
- Newly ended session appears within 10 seconds

**Session Record Structure (in Dossier):**
```
Date: 2025-05-06
Time: 14:32 - 14:57
Duration: 25m
Session completed
```

## Testing Checklist

- [ ] Start timer → pause → resume → elapsed time preserved
- [ ] Start timer → refresh page → timer restores
- [ ] Active session survives tab switch
- [ ] Click "end session" → confirmation modal appears
- [ ] Confirm end session → session saved to Dossier
- [ ] New session appears in Dossier immediately (within 10s refresh)
- [ ] Session duration recorded accurately
- [ ] Can start new session after ending
- [ ] Reset clears all session state
- [ ] Memento and Timer stay synchronized
- [ ] Failed save shows error feedback
- [ ] Both components show same session state

## Architectural Benefits

1. **Intentionality** - Only completed rituals are recorded
2. **Safety** - Active sessions preserved across refreshes
3. **Clarity** - User controls exactly when sessions end
4. **Immersion** - No intrusive auto-save notifications
5. **Architecture** - Clean separation: localStorage (temp) vs backend (permanent)
6. **Flexibility** - Users can pause indefinitely without committing
7. **Ritual** - Session conclusion feels meaningful and deliberate

---

**Session lifecycle is now complete, elegant, and user-controlled.**
