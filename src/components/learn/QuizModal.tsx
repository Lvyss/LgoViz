// src/components/learn/QuizModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Question {
  id: string
  question_text: string
  options: { option_label: string; option_text: string }[]
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
  isOpen,
  questions,
  currentQuestionIndex,
  answers,
  totalProgress,
  result,
  isComplete,
  isLoading,
  onAnswer,
  onNext,
  onPrev,
  onSubmit,
  onRetry,
  onClose,
  onNextTopic,
  nextTopicTitle,
}: QuizModalProps) {
  const currentQuestion = questions[currentQuestionIndex]
  const selectedAnswer = currentQuestion
    ? answers.find(a => a.questionId === currentQuestion.id)?.selectedAnswer
    : undefined

  // Reset scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider text-white uppercase">System_Quiz</h2>
              <p className="text-[10px] text-gray-500">Uji pemahamanmu setelah belajar</p>
            </div>
          </div>
          <button onClick={onClose} className="text-xl text-gray-500 transition-colors hover:text-white">✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <div className="w-10 h-10 border-2 rounded-full border-emerald-500/20 border-t-emerald-500 animate-spin" />
              <span className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">Loading_Questions...</span>
            </div>
          ) : isComplete && result ? (
            // Result View
            <div className="space-y-6">
              {/* Score Banner */}
              <div className={`text-center p-6 rounded-2xl ${result.passed ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                <div className={`text-5xl font-black mb-2 ${result.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.score}%
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                  {result.correctAnswers} / {result.totalQuestions} Correct
                </p>
              </div>

              {/* Answers Breakdown */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {result.answers.map((answer, idx) => {
                  const question = questions.find(q => q.id === answer.questionId)
                  const correctOption = question?.options.find((opt: any) => opt.is_correct)
                  return (
                    <div key={answer.questionId} className="p-3 border rounded-xl bg-white/5 border-white/10">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 flex items-center justify-center rounded-lg text-[10px] font-bold ${answer.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {answer.isCorrect ? '✓' : '✕'}
                        </div>
                        <div>
                          <p className="text-xs text-gray-300">{question?.question_text}</p>
                          <p className="text-[9px] text-gray-500 mt-1">
                            Jawaban: {answer.selectedAnswer}
                            {!answer.isCorrect && <span className="ml-2 text-emerald-400">✓ {correctOption?.option_label}</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            // Question View
            <div className="space-y-6">
              {/* Progress */}
              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span className="tracking-widest uppercase">Question {currentQuestionIndex + 1}/{totalProgress.total}</span>
                <div className="w-32 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${totalProgress.percentage}%` }} />
                </div>
              </div>

              {/* Question Text */}
              <div className="p-4 border rounded-xl bg-purple-500/5 border-purple-500/20">
                <p className="text-base leading-relaxed text-white">{currentQuestion?.question_text}</p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentQuestion?.options.map((option: any) => {
                  const isSelected = selectedAnswer === option.option_label
                  return (
                    <button
                      key={option.option_label}
                      onClick={() => onAnswer(currentQuestion.id, option.option_label)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/40'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        isSelected ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400'
                      }`}>
                        {option.option_label}
                      </div>
                      <span className={`text-sm ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                        {option.option_text}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 p-5 border-t border-white/10 bg-black/30">
          {!isComplete && (
            <button
              onClick={onPrev}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-xs text-gray-400 transition-colors rounded-lg hover:text-white disabled:opacity-30"
            >
              ← Sebelumnya
            </button>
          )}
          
          <div className="flex-1" />
          
          {!isComplete && currentQuestionIndex === totalProgress.total - 1 ? (
            <button
              onClick={onSubmit}
              disabled={answers.length < totalProgress.total}
              className="px-6 py-2 text-xs font-bold text-white transition-all bg-emerald-600 rounded-xl hover:bg-emerald-500 disabled:opacity-50"
            >
              Submit Quiz
            </button>
          ) : !isComplete && (
            <button
              onClick={onNext}
              disabled={!selectedAnswer}
              className="px-6 py-2 text-xs font-bold text-white transition-all bg-emerald-600 rounded-xl hover:bg-emerald-500 disabled:opacity-50"
            >
              Selanjutnya →
            </button>
          )}

          {isComplete && result && (
            <div className="flex gap-3">
              {!result.passed && (
                <button
                  onClick={onRetry}
                  className="px-6 py-2 text-xs font-bold text-white transition-all bg-purple-600 rounded-xl hover:bg-purple-500"
                >
                  Coba Lagi
                </button>
              )}
              {result.passed && (
                <button
                  onClick={onNextTopic}
                  className="px-6 py-2 text-xs font-bold text-white transition-all bg-emerald-600 rounded-xl hover:bg-emerald-500"
                >
                  {nextTopicTitle ? `Lanjut: ${nextTopicTitle} →` : 'Selesai'}
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}