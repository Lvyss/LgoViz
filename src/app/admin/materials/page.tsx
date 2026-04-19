import { Suspense } from 'react'
import MaterialsContent from './MaterialsContent'

export const dynamic = 'force-dynamic'

export default function AdminMaterialsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Kelola Materi</h1>
        <p className="mt-1 text-sm text-gray-400">Edit konten pembelajaran untuk setiap topik</p>
      </div>
      
      <Suspense fallback={
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 rounded-full border-emerald-500 border-t-transparent animate-spin" />
        </div>
      }>
        <MaterialsContent />
      </Suspense>
    </div>
  )
}