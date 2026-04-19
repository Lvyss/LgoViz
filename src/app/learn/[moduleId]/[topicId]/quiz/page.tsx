'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuiz } from '@/hooks/useQuiz'
import { createClient } from '@/lib/supabase/client'
import { getTopicsByModule } from '@/lib/supabase/queries'

interface QuizPageProps {
  params: Promise<{
    moduleId: string
    topicId: string
  }>
}

export default function QuizPage({ params }: QuizPageProps) {
  const router = useRouter()
  const unwrappedParams = use(params)
  const topicId = unwrappedParams.topicId
  const moduleId = unwrappedParams.moduleId

  const [userId, setUserId] = useState<string | null>(null)
  const [nextTopicTitle, setNextTopicTitle] = useState<string | null>(null)
  const [nextTopicId, setNextTopicId] = useState<string | null>(null)

  const {
    questions,
    currentQuestion,
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
  } = useQuiz()

  // Get current user
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
      }
    })
  }, [])

  // Start quiz with user ID
  useEffect(() => {
    if (topicId && userId) {
      startQuiz(topicId, moduleId, userId)
    }
  }, [topicId, userId, moduleId, startQuiz])

  // Load next topic title for display
  useEffect(() => {
    async function loadNextTopic() {
      if (result?.passed) {
        const topics = await getTopicsByModule(moduleId)
        const currentIndex = topics.findIndex(t => t.id === topicId)
        const nextTopic = topics[currentIndex + 1]
        if (nextTopic) {
          setNextTopicTitle(nextTopic.title)
          setNextTopicId(nextTopic.id)
        } else {
          setNextTopicTitle(null)
          setNextTopicId(null)
        }
      } else {
        setNextTopicTitle(null)
        setNextTopicId(null)
      }
    }
    loadNextTopic()
  }, [result?.passed, moduleId, topicId])

  const progress = getProgress()
  const selectedAnswer = currentQuestion
    ? answers.find(a => a.questionId === currentQuestion.id)?.selectedAnswer
    : undefined

  const handleNextTopic = () => {
    router.push(`/learn/${moduleId}/${nextTopicId ?? topicId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 rounded-full border-emerald-500/30 border-t-emerald-500 animate-spin" />
          <p className="text-gray-400">Memuat quiz...</p>
        </div>
      </div>
    )
  }

  if (!hasQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <p className="mb-4 text-gray-400">Quiz tidak ditemukan untuk topik ini</p>
          <button
            onClick={() => router.push(`/learn/${moduleId}/${topicId}`)}
            className="px-4 py-2 text-sm transition-colors border rounded-lg border-white/10 hover:bg-white/5"
          >
            Kembali ke Materi
          </button>
        </div>
      </div>
    )
  }

  if (isComplete && result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0f]">
        <div className="w-full max-w-lg bg-[#121218] border border-white/10 rounded-xl overflow-hidden">
          {/* Result Header */}
          <div className={`px-6 py-8 text-center ${result.passed ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            <div className={`text-6xl font-bold mb-2 ${result.passed ? 'text-emerald-400' : 'text-red-400'}`}>
              {result.score}%
            </div>
            <p className={`text-lg font-medium ${result.passed ? 'text-emerald-400' : 'text-red-400'}`}>
              {result.passed ? 'Selamat! Anda Lulus' : 'Belum Lulus'}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {result.correctAnswers} dari {result.totalQuestions} soal benar
            </p>
          </div>

          {/* Answer Breakdown */}
          <div className="p-6 overflow-y-auto max-h-80">
            <h3 className="mb-4 text-sm font-medium text-gray-400">Detail Jawaban</h3>
            <div className="space-y-3">
              {result.answers.map((answer) => {
                const question = questions.find(q => q.id === answer.questionId)
                const correctOption = question?.options.find((opt: any) => opt.is_correct)
                return (
                  <div key={answer.questionId} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                    <span className={`w-6 h-6 flex items-center justify-center text-xs rounded-full shrink-0 ${answer.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {answer.isCorrect ? '✓' : '✗'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 line-clamp-2">{question?.question_text}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Jawaban Anda: <span className={answer.isCorrect ? 'text-emerald-400' : 'text-red-400'}>{answer.selectedAnswer}</span>
                        {!answer.isCorrect && (
                          <span className="ml-2 text-emerald-400">
                            (Jawaban benar: {correctOption?.option_label})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 px-6 py-4 border-t border-white/10">
            {!result.passed && (
              <button
                onClick={retryQuiz}
                className="flex-1 px-4 py-3 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-500"
              >
                Coba Lagi
              </button>
            )}
            {result.passed ? (
              <button
                onClick={handleNextTopic}
                className="flex-1 px-4 py-3 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-500"
              >
                {nextTopicTitle ? `Lanjut: ${nextTopicTitle} →` : 'Kembali ke Daftar Topik'}
              </button>
            ) : (
              <button
                onClick={() => router.push(`/learn/${moduleId}/${topicId}`)}
                className="flex-1 px-4 py-3 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-500"
              >
                Kembali ke Materi
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0f]/90 backdrop-blur-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push(`/learn/${moduleId}/${topicId}`)}
            className="p-2 text-gray-400 transition-colors hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Quiz</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{progress.current} / {progress.total}</span>
              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300 bg-emerald-500"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Question Content */}
      <main className="flex items-center justify-center flex-1 p-6">
        <div className="w-full max-w-2xl">
          {/* Question Card */}
          <div className="bg-[#121218] border border-white/10 rounded-xl overflow-hidden">
            {/* Question Text */}
            <div className="p-6 border-b border-white/10">
              <p className="text-lg leading-relaxed text-white whitespace-pre-line">
                {currentQuestion?.question_text}
              </p>
            </div>

            {/* Answer Options */}
            <div className="p-6 space-y-3">
              {currentQuestion?.options.map((option: any) => (
                <button
                  key={option.option_label}
                  onClick={() => currentQuestion && answerQuestion(currentQuestion.id, option.option_label)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedAnswer === option.option_label
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-full ${
                      selectedAnswer === option.option_label
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/10'
                    }`}>
                      {option.option_label}
                    </span>
                    <span className="flex-1">{option.option_text}</span>
                    {selectedAnswer === option.option_label && (
                      <span className="text-emerald-400">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Sebelumnya
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={submitQuiz}
                disabled={answers.length < questions.length}
                className="px-6 py-3 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={!selectedAnswer}
                className="px-6 py-3 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya →
              </button>
            )}
          </div>

          {/* Question Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {questions.map((_: any, idx: number) => {
              const isAnswered = answers.some(a => a.questionId === questions[idx].id)
              const isCurrent = idx === currentQuestionIndex
              return (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-emerald-500 w-4'
                      : isAnswered
                        ? 'bg-emerald-500/50 w-2'
                        : 'bg-white/20 w-2'
                  }`}
                />
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}