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

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [])

  useEffect(() => {
    if (topicId && userId) {
      startQuiz(topicId, moduleId, userId)
    }
  }, [topicId, userId, moduleId, startQuiz])

  useEffect(() => {
    async function loadNextTopic() {
      if (result?.passed) {
        const topics = await getTopicsByModule(moduleId)
        const currentIndex = topics.findIndex(t => t.id === topicId)
        const nextTopic = topics[currentIndex + 1]
        if (nextTopic) {
          setNextTopicTitle(nextTopic.title)
          setNextTopicId(nextTopic.id)
        }
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
      <div className="min-h-screen flex items-center justify-center bg-[#020203]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 rounded-full border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <span className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">System_Checking...</span>
        </div>
      </div>
    )
  }

  if (!hasQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020203]">
        <div className="text-center p-8 bg-white/[0.02] border border-white/10 rounded-2xl">
          <p className="mb-6 text-sm text-slate-400">Quiz data missing for this sector.</p>
          <button
            onClick={() => router.push(`/learn/${moduleId}/${topicId}`)}
            className="px-6 py-2 text-[10px] font-black tracking-widest text-white border border-white/10 rounded-lg hover:bg-white/5 transition-all"
          >
            RETURN_TO_BASE
          </button>
        </div>
      </div>
    )
  }

  if (isComplete && result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#020203] selection:bg-emerald-500/30">
        <div className="w-full max-w-xl bg-[#08080A] border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Result Banner */}
          <div className={`relative px-8 py-12 text-center overflow-hidden ${result.passed ? 'bg-emerald-500/[0.03]' : 'bg-red-500/[0.03]'}`}>
            <div className={`absolute top-0 left-0 w-full h-[2px] ${result.passed ? 'bg-emerald-500' : 'bg-red-500'} opacity-50`} />
            
            <div className={`text-7xl font-black mb-4 tracking-tighter ${result.passed ? 'text-emerald-500' : 'text-red-500'}`}>
              {result.score}<span className="text-2xl font-light opacity-50">%</span>
            </div>
            
            <h2 className="text-sm font-black tracking-[0.4em] uppercase text-white mb-2">
              {result.passed ? 'Mission_Accomplished' : 'System_Failure'}
            </h2>
            <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
              Verified: {result.correctAnswers} / {result.totalQuestions} Correct
            </p>
          </div>

          {/* Breakdown List */}
          <div className="p-6 space-y-3 bg-white/[0.01]">
            <div className="flex items-center gap-3 px-2 mb-4 opacity-50">
              <div className="h-[1px] flex-1 bg-white/10" />
              <span className="text-[9px] font-black tracking-widest uppercase">Analysis_Report</span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="max-h-[300px] overflow-y-auto px-2 space-y-2 custom-scrollbar">
              {result.answers.map((answer) => {
                const question = questions.find(q => q.id === answer.questionId)
                const correctOption = question?.options.find((opt: any) => opt.is_correct)
                return (
                  <div key={answer.questionId} className="group p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:border-white/10 transition-all">
                    <div className="flex items-start gap-4">
                       <div className={`mt-1 w-5 h-5 flex items-center justify-center rounded-lg text-[10px] font-bold ${answer.isCorrect ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                        {answer.isCorrect ? '✓' : '✕'}
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] leading-relaxed text-slate-300 font-medium">{question?.question_text}</p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono">
                          <span className={answer.isCorrect ? 'text-emerald-500/70' : 'text-red-500/70'}>
                            Your: {answer.selectedAnswer}
                          </span>
                          {!answer.isCorrect && (
                            <span className="text-emerald-500">Correct: {correctOption?.option_label}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col gap-3 p-8 pt-4">
            {result.passed ? (
              <button
                onClick={handleNextTopic}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)] hover:-translate-y-1"
              >
                {nextTopicTitle ? `Next: ${nextTopicTitle} →` : 'CONCLUDE_SESSION'}
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={retryQuiz}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase border border-white/10 transition-all"
                >
                  Retry_System
                </button>
                <button
                  onClick={() => router.push(`/learn/${moduleId}/${topicId}`)}
                  className="flex-1 py-4 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase border border-emerald-500/20 transition-all"
                >
                  Review_Material
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#020203] text-slate-300 selection:bg-emerald-500/30">
      {/* 🧭 Sticky Quiz Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#020203]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between w-full max-w-5xl px-8 py-4 mx-auto">
          <button
            onClick={() => router.push(`/learn/${moduleId}/${topicId}`)}
            className="flex items-center gap-2 transition-colors group text-slate-500 hover:text-white"
          >
            <div className="p-2 transition-colors rounded-lg bg-white/5 group-hover:bg-red-500/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase">Abort_Session</span>
          </button>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-black tracking-[0.3em] text-slate-500 uppercase">Quiz_Progress</span>
            <div className="flex items-center gap-3">
              <div className="w-40 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-emerald-500 transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-500">{progress.current}/{progress.total}</span>
            </div>
          </div>
          
          <div className="invisible w-32" /> {/* Spacer */}
        </div>
      </header>

      {/* ❓ Question Workspace */}
      <main className="flex items-center justify-center flex-1 p-6 pb-20">
        <div className="w-full max-w-3xl duration-700 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Question Card */}
          <div className="bg-[#08080A] border border-white/[0.05] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20" />
            
            <div className="mb-10">
              <span className="text-[10px] font-black tracking-[0.4em] text-emerald-500 uppercase mb-4 block italic">Question_Segment</span>
              <h2 className="text-xl font-bold leading-relaxed tracking-tight text-white whitespace-pre-line md:text-2xl">
                {currentQuestion?.question_text}
              </h2>
            </div>

            {/* Answer Grid */}
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion?.options.map((option: any) => {
                const isSelected = selectedAnswer === option.option_label;
                return (
                  <button
                    key={option.option_label}
                    onClick={() => currentQuestion && answerQuestion(currentQuestion.id, option.option_label)}
                    className={`group relative flex items-center gap-5 p-5 rounded-2xl border transition-all duration-300 ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-[0_0_30px_rgba(16,185,129,0.05)]'
                        : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className={`w-10 h-10 flex items-center justify-center text-xs font-black rounded-xl transition-all duration-500 ${
                      isSelected
                        ? 'bg-emerald-500 text-white rotate-[360deg]'
                        : 'bg-white/5 border border-white/10 group-hover:bg-white/10'
                    }`}>
                      {option.option_label}
                    </div>
                    
                    <span className={`flex-1 text-sm font-medium transition-colors ${isSelected ? 'text-white' : 'group-hover:text-slate-200'}`}>
                      {option.option_text}
                    </span>

                    {isSelected && (
                      <div className="absolute right-6 animate-pulse">
                        <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between px-4 mt-8">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 hover:text-white disabled:opacity-20 transition-all uppercase"
            >
              ← Prev_Node
            </button>

            <div className="flex items-center gap-2">
              {questions.map((_: any, idx: number) => {
                const isAnswered = answers.some(a => a.questionId === questions[idx].id)
                const isCurrent = idx === currentQuestionIndex
                return (
                  <div key={idx} className={`h-1 rounded-full transition-all duration-500 ${isCurrent ? 'bg-emerald-500 w-8' : isAnswered ? 'bg-emerald-500/40 w-2' : 'bg-white/10 w-2'}`} />
                )
              })}
            </div>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={submitQuiz}
                disabled={answers.length < questions.length}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)] disabled:opacity-30 active:scale-95"
              >
                Sync_Results
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={!selectedAnswer}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[10px] font-black tracking-widest uppercase transition-all disabled:opacity-20 active:scale-95"
              >
                Next_Node →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}