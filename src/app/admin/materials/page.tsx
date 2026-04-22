'use client'

import { Suspense } from 'react'
import MaterialsContent from './MaterialsContent'

export const dynamic = 'force-dynamic'

export default function AdminMaterialsPage() {
  return (
    /* Kita tambahkan min-w-0 dan overflow-hidden di sini sebagai pengaman lapis pertama */
    <div className="flex-1 min-w-0 overflow-hidden">
      <div className="pb-8 mb-8 border-b border-white/5">
        <h1 className="text-4xl italic font-black leading-none tracking-tighter text-white uppercase">
          Lesson<span className="text-orange-500">_Editor</span>
        </h1>
        <p className="text-[10px] font-mono text-gray-500 mt-2 tracking-widest uppercase italic">
          Curriculum_&_Course_Content_Management
        </p>
      </div>
      
      {/* Container Suspense juga harus fleksibel tapi terkendali */}
      <div className="relative w-full min-w-0">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="w-12 h-12 border-2 rounded-full border-orange-500 border-t-transparent animate-spin shadow-[0_0_15px_rgba(249,115,22,0.3)]" />
            <p className="text-[10px] font-mono tracking-[0.3em] text-orange-500 animate-pulse uppercase">
              Compiling_Educational_Assets...
            </p>
          </div>
        }>
          <MaterialsContent />
        </Suspense>
      </div>
    </div>
  )
}