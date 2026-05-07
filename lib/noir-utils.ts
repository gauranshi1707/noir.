import { createClient } from '@/lib/supabase/server'

// STREAK LOGIC
// Streak increases by 1 if user studies for 120+ minutes in a day
// Streak resets to 0 if they miss a day

export async function updateStreak(userId: string, studyMinutes: number) {
  const supabase = await createClient()
  
  // Get current streak record - use maybeSingle() to safely handle missing rows
  const { data: streakData, error: streakError } = await supabase
    .from('study_streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (streakError) throw streakError
  
  // If no streak record exists, create one
  if (!streakData) {
    const today = new Date().toISOString().split('T')[0]
    const initialStreak = studyMinutes >= 120 ? 1 : 0
    
    const { error: insertError } = await supabase
      .from('study_streaks')
      .insert({
        user_id: userId,
        current_streak: initialStreak,
        longest_streak: initialStreak,
        last_session_date: today,
      })
    
    if (insertError) throw insertError
    return { currentStreak: initialStreak, longestStreak: initialStreak }
  }

  const today = new Date().toISOString().split('T')[0]
  const lastSessionDate = streakData.last_session_date

  let newStreak = streakData.current_streak
  let longestStreak = streakData.longest_streak

  // Check if user missed a day (gap of more than 1 day)
  if (lastSessionDate) {
    const lastDate = new Date(lastSessionDate)
    const currentDate = new Date(today)
    const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    // If more than 1 day has passed, reset streak
    if (daysDiff > 1) {
      newStreak = 0
    }
  }

  // If studied 120+ minutes today, increment streak
  if (studyMinutes >= 120) {
    // Only count once per day
    if (lastSessionDate !== today) {
      newStreak += 1
    }
  }

  // Update longest streak if current streak is longer
  if (newStreak > longestStreak) {
    longestStreak = newStreak
  }

  // Update database
  const { error: updateError } = await supabase
    .from('study_streaks')
    .update({
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_session_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (updateError) throw updateError

  return { currentStreak: newStreak, longestStreak }
}

// COLLECTIBLE REWARDS
// Weighted random selection with duplicate prevention

// Starter collectible - given to all new users
export const STARTER_COLLECTIBLE_ID = 'rune_seal'

const collectibles = [
  // Starter collectible (not in random pool - awarded on signup)
  { id: 'rune_seal', name: 'The Rune Seal', rarity: 'starter', weight: 0 },
  // Room collectibles
  { id: 'candle', name: 'Antique Candle', rarity: 'common', weight: 10 },
  { id: 'bust', name: 'Marble Bust', rarity: 'common', weight: 10 },
  { id: 'key', name: 'Golden Key', rarity: 'uncommon', weight: 5 },
  { id: 'pen', name: 'Fountain Pen', rarity: 'uncommon', weight: 5 },
  { id: 'feather', name: 'Quill Feather', rarity: 'rare', weight: 2 },
  { id: 'telescope', name: 'Brass Telescope', rarity: 'rare', weight: 2 },
]

export async function getRandomCollectible(userId: string) {
  const supabase = await createClient()

  // Get user's existing collectibles
  const { data: userCollectibles, error: fetchError } = await supabase
    .from('user_collectibles')
    .select('collectible_id')
    .eq('user_id', userId)

  if (fetchError) throw fetchError

  const ownedIds = new Set(userCollectibles?.map(c => c.collectible_id) || [])

  // Filter out duplicates and starter collectible (weight > 0), weighted selection
  const availableCollectibles = collectibles.filter(c => !ownedIds.has(c.id) && c.weight > 0)

  if (availableCollectibles.length === 0) {
    // All collectibles owned, return random duplicate
    return collectibles[Math.floor(Math.random() * collectibles.length)]
  }

  // Weighted random selection
  const totalWeight = availableCollectibles.reduce((sum, c) => sum + c.weight, 0)
  let random = Math.random() * totalWeight
  let selected = availableCollectibles[0]

  for (const collectible of availableCollectibles) {
    random -= collectible.weight
    if (random <= 0) {
      selected = collectible
      break
    }
  }

  return selected
}

export async function awardCollectible(userId: string, collectibleId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_collectibles')
    .insert({
      user_id: userId,
      collectible_id: collectibleId,
    })
    .select()
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is unique violation - collectible already owned
    throw error
  }

  return data
}

// THEME UNLOCKS
// Unlocked by streak milestones or study hour thresholds

export async function checkAndUnlockThemes(userId: string, currentStreak: number, totalStudyMinutes: number) {
  const supabase = await createClient()

  const themeUnlocks = [
    { name: 'Midnight', unlock_type: 'streak', unlock_value: 7 },
    { name: 'Aurora', unlock_type: 'streak', unlock_value: 30 },
    { name: 'Nebula', unlock_type: 'hours', unlock_value: 100 },
    { name: 'Obsidian', unlock_type: 'hours', unlock_value: 500 },
  ]

  const unlockedThemes = []

  for (const theme of themeUnlocks) {
    let shouldUnlock = false

    if (theme.unlock_type === 'streak' && currentStreak >= theme.unlock_value) {
      shouldUnlock = true
    } else if (theme.unlock_type === 'hours' && totalStudyMinutes >= theme.unlock_value * 60) {
      shouldUnlock = true
    }

    if (shouldUnlock) {
      const { error } = await supabase
        .from('user_themes')
        .insert({
          user_id: userId,
          theme_id: theme.name,
        })
        .select()

      if (!error || error.code === 'PGRST116') {
        unlockedThemes.push(theme.name)
      }
    }
  }

  return unlockedThemes
}

// ANALYTICS UPDATE

export async function updateAnalytics(userId: string, sessionMinutes: number) {
  const supabase = await createClient()

  // Use maybeSingle() to safely handle missing rows
  const { data: currentAnalytics, error: fetchError } = await supabase
    .from('analytics')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (fetchError) throw fetchError

  const newTotalMinutes = (currentAnalytics?.total_study_minutes || 0) + sessionMinutes
  const newTotalSessions = (currentAnalytics?.total_sessions || 0) + 1
  const newAverageSession = Math.round(newTotalMinutes / newTotalSessions)

  // Calculate weekly and monthly focus minutes
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Get sessions for this week
  const { data: weekSessions } = await supabase
    .from('timer_sessions')
    .select('duration_seconds')
    .eq('user_id', userId)
    .gte('created_at', startOfWeek.toISOString())

  const weeklyMinutes = Math.floor(
    (weekSessions || []).reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60
  )

  // Get sessions for this month
  const { data: monthSessions } = await supabase
    .from('timer_sessions')
    .select('duration_seconds')
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())

  const monthlyMinutes = Math.floor(
    (monthSessions || []).reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60
  )

  // Get unlocked collectibles count
  const { count: collectiblesCount } = await supabase
    .from('user_collectibles')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get streak data
  const { data: streakData } = await supabase
    .from('study_streaks')
    .select('current_streak, longest_streak')
    .eq('user_id', userId)
    .maybeSingle()

  // If no analytics row exists, create one
  if (!currentAnalytics) {
    const { error: insertError } = await supabase
      .from('analytics')
      .insert({
        user_id: userId,
        total_study_minutes: newTotalMinutes,
        total_sessions: newTotalSessions,
        average_session_duration: newAverageSession,
        weekly_focus_minutes: weeklyMinutes,
        monthly_focus_minutes: monthlyMinutes,
        current_streak: streakData?.current_streak || 0,
        longest_streak: streakData?.longest_streak || 0,
        unlocked_collectibles: collectiblesCount || 0,
      })

    if (insertError) throw insertError
  } else {
    const { error: updateError } = await supabase
      .from('analytics')
      .update({
        total_study_minutes: newTotalMinutes,
        total_sessions: newTotalSessions,
        average_session_duration: newAverageSession,
        weekly_focus_minutes: weeklyMinutes,
        monthly_focus_minutes: monthlyMinutes,
        current_streak: streakData?.current_streak || currentAnalytics.current_streak || 0,
        longest_streak: streakData?.longest_streak || currentAnalytics.longest_streak || 0,
        unlocked_collectibles: collectiblesCount || currentAnalytics.unlocked_collectibles || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (updateError) throw updateError
  }

  return { totalMinutes: newTotalMinutes, totalSessions: newTotalSessions }
}
