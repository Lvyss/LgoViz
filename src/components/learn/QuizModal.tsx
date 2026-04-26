'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Question {
  id: string
  question_text: string
  options: { option_label: string; option_text: string; is_correct?: boolean }[]
}

interface QuizResult {
  score: number
  passed: boolean
  correctAnswers: number
  totalQuestions: number
  answers: { questionId: string; selectedAnswer: string; isCorrect: boolean }[]
}

interface QuizModalProps {
  isOpen: boolean
  questions: Question[]
  currentQuestionIndex: number
  answers: { questionId: string; selectedAnswer: string }[]
  totalProgress: { current: number; total: number; percentage: number }
  result: QuizResult | null
  isComplete: boolean
  isLoading: boolean
  onAnswer: (questionId: string, answerLabel: string) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
  onRetry: () => void
  onClose: () => void
  onNextTopic: () => void
  nextTopicTitle: string | null
}

export default function QuizModal({
  isOpen, questions, currentQuestionIndex, answers, totalProgress,
  result, isComplete, isLoading,
  onAnswer, onNext, onPrev, onSubmit, onRetry, onClose, onNextTopic,
  nextTopicTitle,
}: QuizModalProps) {
  const currentQuestion  = questions[currentQuestionIndex]
  const selectedAnswer   = currentQuestion
    ? answers.find(a => a.questionId === currentQuestion.id)?.selectedAnswer
    : undefined
  const answeredCount    = answers.length
  const allAnswered      = answeredCount >= totalProgress.total

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else        document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">

          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* modal */}
          <motion.div
            initial={{ scale: 0.97, opacity: 0, y: 12 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{   scale: 0.97, opacity: 0, y: 12  }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden
              bg-[#040406] border border-white/[0.07]
              shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
          >

            {/* ── HEADER ────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 border rounded-lg bg-blue-500/10 border-blue-500/20 shrink-0">
                  <span className="text-sm">🧠</span>
                </div>
                <div>
                  <h2 className="text-xs font-black tracking-[0.2em] text-white uppercase">Quiz</h2>
                  <p className="text-[9px] text-slate-600 mt-0.5">
                    Uji pemahaman materi yang sudah dipelajari
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* answered counter */}
                {!isComplete && !isLoading && totalProgress.total > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
                    bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[8px] font-mono font-black text-slate-500">
                      {answeredCount}/{totalProgress.total}
                    </span>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center
                    border border-white/[0.06] bg-white/[0.02]
                    text-slate-600 hover:text-white hover:bg-white/[0.05]
                    transition-all text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ── BODY ──────────────────────────────────────────────────── */}
            <div className="flex-1 px-5 py-5 overflow-y-auto custom-scrollbar">

              {/* Loading */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center gap-4 py-16">
                  <div className="relative w-8 h-8">
                    <div className="absolute inset-0 border-2 rounded-full border-orange-500/15 border-t-orange-500 animate-spin" />
                  </div>
                  <p className="text-[9px] font-black tracking-[0.4em] text-slate-700 uppercase">
                    Memuat Pertanyaan...
                  </p>
                </div>
              )}

              {/* Result view */}
              {!isLoading && isComplete && result && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* score banner */}
                  <div className={`text-center py-6 px-4 rounded-xl border ${
                    result.passed
                      ? 'bg-emerald-500/8 border-emerald-500/20'
                      : 'bg-red-500/8 border-red-500/15'
                  }`}>
                    <div className={`text-5xl font-black tracking-tighter mb-1 ${
                      result.passed ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {result.score}%
                    </div>
                    <p className="text-[9px] text-slate-600 uppercase tracking-[0.3em]">
                      {result.correctAnswers} dari {result.totalQuestions} benar
                    </p>
                    <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                      text-[9px] font-black tracking-widest uppercase border ${
                        result.passed
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                      {result.passed ? '✓ Lulus' : '✕ Belum Lulus'}
                    </div>
                  </div>

                  {/* answers breakdown */}
                  <div>
                    <p className="text-[8px] font-black tracking-[0.3em] text-slate-600 uppercase mb-2">
                      Rincian Jawaban
                    </p>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                      {result.answers.map((ans, idx) => {
                        const q           = questions.find(q => q.id === ans.questionId)
                        const correctOpt  = q?.options.find((o: any) => o.is_correct)
                        return (
                          <div key={ans.questionId}
                            className={`flex items-start gap-3 p-3 rounded-xl border ${
                              ans.isCorrect
                                ? 'bg-emerald-500/5 border-emerald-500/15'
                                : 'bg-red-500/5 border-red-500/10'
                            }`}>
                            {/* icon */}
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              ans.isCorrect
                                ? 'bg-emerald-500/15 border border-emerald-500/25'
                                : 'bg-red-500/15 border border-red-500/20'
                            }`}>
                              {ans.isCorrect
                                ? <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                                : <svg className="w-3 h-3 text-red-400"     fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}   d="M6 18L18 6M6 6l12 12"/></svg>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">
                                {q?.question_text}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-[8px] text-slate-700">
                                  Jawabanmu: <span className="font-bold text-slate-500">{ans.selectedAnswer}</span>
                                </span>
                                {!ans.isCorrect && correctOpt && (
                                  <span className="text-[8px] text-emerald-600">
                                    Benar: <span className="font-bold">{correctOpt.option_label}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Question view */}
              {!isLoading && !isComplete && currentQuestion && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{   opacity: 0, x: -10 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-4"
                  >
                    {/* progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black tracking-[0.3em] text-slate-600 uppercase">
                          Pertanyaan {currentQuestionIndex + 1} dari {totalProgress.total}
                        </span>
                        <span className="text-[8px] font-mono text-slate-700">
                          {Math.round(totalProgress.percentage)}%
                        </span>
                      </div>
                      <div className="h-[3px] w-full bg-white/[0.05] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${totalProgress.percentage}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    </div>

                    {/* question text */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <p className="text-sm leading-relaxed text-white/85">
                        {currentQuestion.question_text}
                      </p>
                    </div>

                    {/* options */}
                    <div className="space-y-2">
                      {currentQuestion.options.map(opt => {
                        const isSelected = selectedAnswer === opt.option_label
                        return (
                          <button
                            key={opt.option_label}
                            onClick={() => onAnswer(currentQuestion.id, opt.option_label)}
                            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border
                              text-left transition-all duration-150 group ${
                                isSelected
                                  ? 'bg-orange-500/8 border-orange-500/35 shadow-[0_0_12px_rgba(234,88,12,0.08)]'
                                  : 'bg-white/[0.01] border-white/[0.06] hover:border-white/15 hover:bg-white/[0.03]'
                              }`}
                          >
                            {/* label badge */}
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center
                              text-[10px] font-black shrink-0 transition-all ${
                                isSelected
                                  ? 'bg-orange-500 border-0 text-white'
                                  : 'bg-white/[0.04] border border-white/[0.08] text-slate-600 group-hover:border-white/15 group-hover:text-slate-400'
                              }`}>
                              {opt.option_label}
                            </div>
                            <span className={`text-[12px] leading-snug transition-colors ${
                              isSelected ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                            }`}>
                              {opt.option_text}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* ── FOOTER ────────────────────────────────────────────────── */}
            {!isLoading && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05] shrink-0 bg-[#030304]">

                {/* kiri: prev / close */}
                {!isComplete ? (
                  <button
                    onClick={onPrev}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black
                      tracking-widest uppercase text-slate-600 border border-white/[0.05]
                      hover:text-slate-400 hover:border-white/10 disabled:opacity-25
                      transition-all"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                    </svg>
                    Sebelumnya
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase
                      text-slate-600 border border-white/[0.05] hover:text-slate-400 hover:border-white/10
                      transition-all"
                  >
                    Tutup
                  </button>
                )}

                {/* kanan: next / submit / result actions */}
                <div className="flex items-center gap-2">
                  {!isComplete && currentQuestionIndex < totalProgress.total - 1 && (
                    <button
                      onClick={onNext}
                      disabled={!selectedAnswer}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg
                        text-[9px] font-black tracking-widest uppercase transition-all ${
                          selectedAnswer
                            ? 'bg-orange-600 hover:bg-orange-500 text-white border border-orange-500/50 active:scale-95 shadow-[0_0_12px_rgba(234,88,12,0.2)]'
                            : 'bg-white/[0.03] border border-white/[0.06] text-slate-700 cursor-not-allowed'
                        }`}
                    >
                      Lanjut
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  )}

                  {!isComplete && currentQuestionIndex === totalProgress.total - 1 && (
                    <button
                      onClick={onSubmit}
                      disabled={!allAnswered}
                      className={`flex items-center gap-1.5 px-5 py-1.5 rounded-lg
                        text-[9px] font-black tracking-widest uppercase transition-all ${
                          allAnswered
                            ? 'bg-orange-600 hover:bg-orange-500 text-white border border-orange-500/50 active:scale-95 shadow-[0_0_12px_rgba(234,88,12,0.2)]'
                            : 'bg-white/[0.03] border border-white/[0.06] text-slate-700 cursor-not-allowed'
                        }`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Kumpulkan
                    </button>
                  )}

                  {isComplete && result && !result.passed && (
                    <button
                      onClick={onRetry}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg
                        bg-white/[0.04] hover:bg-white/[0.07] text-white
                        text-[9px] font-black tracking-widest uppercase
                        border border-white/10 active:scale-95 transition-all"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      Coba Lagi
                    </button>
                  )}

                  {isComplete && result && result.passed && (
                    <button
                      onClick={onNextTopic}
                      className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg
                        bg-orange-600 hover:bg-orange-500 text-white
                        text-[9px] font-black tracking-widest uppercase
                        border border-orange-500/50 active:scale-95
                        shadow-[0_0_12px_rgba(234,88,12,0.2)] transition-all"
                    >
                      {nextTopicTitle
                        ? <><span className="max-w-[120px] truncate">{nextTopicTitle}</span>
                            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                            </svg>
                          </>
                        : <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                            </svg>
                            Selesai
                          </>
                      }
                    </button>
                  )}
                </div>
              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}