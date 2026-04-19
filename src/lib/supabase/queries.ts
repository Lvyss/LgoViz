import { createClient } from './client'

export type Module = {
  id: string
  title: string
  description: string
  order_index: number
}

export type Topic = {
  id: string
  module_id: string
  title: string
  description: string
  order_index: number
  starter_code: string | null
}

export type Question = {
  id: string
  topic_id: string
  question_text: string
  order_index: number
  options: QuestionOption[]
}

export type QuestionOption = {
  id: string
  option_label: 'A' | 'B' | 'C' | 'D'
  option_text: string
  is_correct: boolean
}

export type Material = {
  id: string
  topic_id: string
  content: string
  solution_code: string | null
}

export type UserProgress = {
  id: string
  user_id: string
  topic_id: string
  status: 'locked' | 'unlocked' | 'completed'
  best_score: number
  completed_at: string | null
}

export type QuizAttempt = {
  id: string
  user_id: string
  topic_id: string
  score: number
  total_questions: number
  correct_answers: number
  passed: boolean
  attempted_at: string
}

// ============================================
// MODULES & TOPICS
// ============================================

export async function getAllModules(): Promise<Module[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching modules:', error)
    return []
  }

  return data || []
}

export async function getTopicsByModule(moduleId: string): Promise<Topic[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('module_id', moduleId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching topics:', error)
    return []
  }

  return data || []
}

export async function getTopicById(topicId: string): Promise<Topic | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('id', topicId)
    .single()

  if (error) {
    console.error('Error fetching topic:', error)
    return null
  }

  return data
}

// ============================================
// MATERIALS
// ============================================

export async function getMaterialByTopic(topicId: string): Promise<Material | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('topic_id', topicId)
    .maybeSingle() // Pakai maybeSingle biar gak error kalo kosong

  if (error) {
    console.error('Error fetching material:', error)
    return null
  }

  return data
}

// ============================================
// QUIZ QUESTIONS
// ============================================

export async function getQuestionsByTopic(topicId: string): Promise<Question[]> {
  const supabase = createClient()
  
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('topic_id', topicId)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  if (questionsError || !questions) {
    console.error('Error fetching questions:', questionsError)
    return []
  }

  const questionsWithOptions: Question[] = []
  
  for (const question of questions) {
    const { data: options, error: optionsError } = await supabase
      .from('question_options')
      .select('*')
      .eq('question_id', question.id)
      .order('option_label', { ascending: true })

    if (optionsError) {
      console.error('Error fetching options:', optionsError)
      continue
    }

    questionsWithOptions.push({
      id: question.id,
      topic_id: question.topic_id,
      question_text: question.question_text,
      order_index: question.order_index,
      options: options.map(opt => ({
        id: opt.id,
        option_label: opt.option_label as 'A' | 'B' | 'C' | 'D',
        option_text: opt.option_text,
        is_correct: opt.is_correct
      }))
    })
  }

  return questionsWithOptions
}

// ============================================
// USER PROGRESS
// ============================================

export async function getUserProgress(userId: string): Promise<UserProgress[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching user progress:', error)
    return []
  }

  return data || []
}

export async function getUserProgressForTopic(userId: string, topicId: string): Promise<UserProgress | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .maybeSingle() // Pakai maybeSingle

  if (error) {
    console.error('Error fetching user progress for topic:', error)
    return null
  }

  return data
}

export async function updateUserProgress(
  userId: string, 
  topicId: string, 
  status: 'locked' | 'unlocked' | 'completed',
  bestScore?: number
): Promise<void> {
  const supabase = createClient()
  
  const updateData: any = {
    user_id: userId,
    topic_id: topicId,
    status,
    updated_at: new Date().toISOString()
  }
  
  if (bestScore !== undefined) {
    updateData.best_score = bestScore
  }
  
  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  }
  
  const { error } = await supabase
    .from('user_progress')
    .upsert(updateData, {
      onConflict: 'user_id,topic_id'
    })

  if (error) {
    console.error('Error updating user progress:', error)
  }
}

// ============================================
// UNLOCK SYSTEM - CORE FUNCTION
// ============================================

export async function unlockNextTopic(userId: string, currentTopicId: string, moduleId: string): Promise<void> {
  // Get all topics in the same module
  const topics = await getTopicsByModule(moduleId)
  
  // Find current topic index
  const currentIndex = topics.findIndex(t => t.id === currentTopicId)
  if (currentIndex === -1) {
    console.log('Current topic not found:', currentTopicId)
    return
  }
  
  // Get next topic
  const nextTopic = topics[currentIndex + 1]
  if (!nextTopic) {
    console.log('No next topic found for:', currentTopicId)
    return
  }
  
  console.log(`Unlocking next topic: ${nextTopic.id} for user ${userId}`)
  
  // Unlock next topic
  await updateUserProgress(userId, nextTopic.id, 'unlocked')
}

export async function initializeUserProgress(userId: string): Promise<void> {
  const supabase = createClient()
  const { data: topics, error } = await supabase
    .from('topics')
    .select('id, module_id, order_index')

  if (error || !topics) {
    console.error('Error fetching topics for initialization:', error)
    return
  }

  // Group topics by module and find first topic of each module
  const modulesMap = new Map<string, { firstTopicId: string; allTopicIds: string[] }>()
  
  for (const topic of topics) {
    if (!modulesMap.has(topic.module_id)) {
      modulesMap.set(topic.module_id, { firstTopicId: topic.id, allTopicIds: [] })
    }
    modulesMap.get(topic.module_id)!.allTopicIds.push(topic.id)
  }

  // For each module, unlock the first topic
  for (const [moduleId, { firstTopicId, allTopicIds }] of modulesMap) {
    // Unlock first topic
    await updateUserProgress(userId, firstTopicId, 'unlocked')
    
    // Lock all other topics in this module
    for (const topicId of allTopicIds) {
      if (topicId !== firstTopicId) {
        const existingProgress = await getUserProgressForTopic(userId, topicId)
        if (!existingProgress) {
          await updateUserProgress(userId, topicId, 'locked')
        }
      }
    }
  }
}

// ============================================
// QUIZ ATTEMPTS
// ============================================

export async function saveQuizAttempt(
  userId: string,
  topicId: string,
  score: number,
  totalQuestions: number,
  correctAnswers: number,
  passed: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  // Validasi userId
  if (!userId) {
    console.error('saveQuizAttempt: userId is required')
    return { success: false, error: 'userId is required' }
  }
  
  if (!topicId) {
    console.error('saveQuizAttempt: topicId is required')
    return { success: false, error: 'topicId is required' }
  }
  
  console.log('Saving quiz attempt:', { userId, topicId, score, totalQuestions, correctAnswers, passed })
  
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: userId,
      topic_id: topicId,
      score: score,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      passed: passed,
      attempted_at: new Date().toISOString()
    })
    .select()
  
  if (error) {
    console.error('Supabase error saving quiz attempt:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    return { success: false, error: error.message }
  }
  
  console.log('Quiz attempt saved successfully:', data)
  return { success: true }
}

export async function getQuizAttempts(userId: string, topicId: string): Promise<QuizAttempt[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .order('attempted_at', { ascending: false })

  if (error) {
    console.error('Error fetching quiz attempts:', error)
    return []
  }

  return data || []
}