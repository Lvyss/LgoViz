'use client'

import { useState, useCallback } from 'react'
import { 
  getQuestionsByTopic, 
  saveQuizAttempt, 
  updateUserProgress, 
  unlockNextTopic 
} from '@/lib/supabase/queries'

interface QuizAnswer {
  questionId: string
  selectedAnswer: string
  isCorrect: boolean
}

interface QuizResult {
  score: number
  passed: boolean
  correctAnswers: number
  totalQuestions: number
  answers: QuizAnswer[]
}

export function useQuiz() {
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasQuiz, setHasQuiz] = useState(false)
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null)
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const startQuiz = useCallback(async (topicId: string, moduleId?: string, userId?: string) => {
    setIsLoading(true)
    setCurrentTopicId(topicId)
    if (moduleId) setCurrentModuleId(moduleId)
    if (userId) setUserId(userId)

    try {
      const quizQuestions = await getQuestionsByTopic(topicId)
      
      if (!quizQuestions || quizQuestions.length === 0) {
        setHasQuiz(false)
        setQuestions([])
      } else {
        setHasQuiz(true)
        setQuestions(quizQuestions)
        setAnswers([])
        setCurrentQuestionIndex(0)
        setIsComplete(false)
        setResult(null)
      }
    } catch (error) {
      console.error('Error starting quiz:', error)
      setHasQuiz(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const answerQuestion = useCallback((questionId: string, selectedAnswer: string) => {
    const question = questions.find(q => q.id === questionId)
    if (!question) return

    const correctOption = question.options.find((opt: any) => opt.is_correct)
    const isCorrect = correctOption?.option_label === selectedAnswer

    const existingIndex = answers.findIndex(a => a.questionId === questionId)
    
    if (existingIndex >= 0) {
      const newAnswers = [...answers]
      newAnswers[existingIndex] = { questionId, selectedAnswer, isCorrect }
      setAnswers(newAnswers)
    } else {
      setAnswers([...answers, { questionId, selectedAnswer, isCorrect }])
    }
  }, [questions, answers])

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }, [currentQuestionIndex, questions.length])

  const prevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }, [currentQuestionIndex])

const submitQuiz = useCallback(async () => {
  if (!currentTopicId || !userId) {
    console.error('Missing topicId or userId', { currentTopicId, userId })
    alert('Terjadi kesalahan: User tidak ditemukan')
    return
  }

  let correctCount = 0
  const answerDetails: QuizAnswer[] = []

  for (const question of questions) {
    const userAnswer = answers.find(a => a.questionId === question.id)
    const correctOption = question.options.find((opt: any) => opt.is_correct)
    const isCorrect = userAnswer?.selectedAnswer === correctOption?.option_label
    
    if (isCorrect) correctCount++
    
    answerDetails.push({
      questionId: question.id,
      selectedAnswer: userAnswer?.selectedAnswer || '',
      isCorrect
    })
  }

  const totalQuestions = questions.length
  const score = Math.round((correctCount / totalQuestions) * 100)
  const passed = score >= 70

  console.log(`Quiz result: ${score}%, Passed: ${passed}, UserId: ${userId}`)

  try {
    // Save to Supabase
    const result = await saveQuizAttempt(
      userId, 
      currentTopicId, 
      score, 
      totalQuestions, 
      correctCount, 
      passed
    )
    
    if (!result.success) {
      console.error('Failed to save quiz attempt:', result.error)
      alert('Gagal menyimpan hasil quiz: ' + result.error)
      return
    }
    
    // Update current topic progress
    await updateUserProgress(userId, currentTopicId, passed ? 'completed' : 'unlocked', score)
    
    // UNLOCK NEXT TOPIC IF PASSED
    if (passed && currentModuleId) {
      console.log(`Quiz passed! Unlocking next topic for module: ${currentModuleId}`)
      await unlockNextTopic(userId, currentTopicId, currentModuleId)
    } else if (!passed) {
      console.log(`Quiz failed (${score}% < 70%). Next topic remains locked.`)
    }

    setResult({
      score,
      passed,
      correctAnswers: correctCount,
      totalQuestions,
      answers: answerDetails
    })
    
    setIsComplete(true)
  } catch (err) {
    console.error('Error in submitQuiz:', err)
    alert('Terjadi kesalahan saat menyimpan quiz')
  }
}, [questions, answers, currentTopicId, currentModuleId, userId])

  const retryQuiz = useCallback(() => {
    setAnswers([])
    setCurrentQuestionIndex(0)
    setIsComplete(false)
    setResult(null)
  }, [])

  const getProgress = useCallback(() => {
    return {
      current: answers.length,
      total: questions.length,
      percentage: questions.length > 0 ? (answers.length / questions.length) * 100 : 0
    }
  }, [answers.length, questions.length])

  return {
    questions,
    currentQuestion: questions[currentQuestionIndex],
    currentQuestionIndex,
    answers,
    isComplete,
    result,
    isLoading,
    hasQuiz,
    startQuiz,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    submitQuiz,
    retryQuiz,
    getProgress,
  }
}