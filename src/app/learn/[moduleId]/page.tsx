'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'  // Bukan @/layout/Footer
import PixelCard from '@/components/ui/PixelCard'
import PixelButton from '@/components/ui/PixelButton'
import PixelBadge from '@/components/ui/PixelBadge'
import ScanlineOverlay from '@/components/ui/ScanlineOverlay'
import TopicSidebar from '@/components/learn/TopicSidebar'
import MaterialPanel from '@/components/learn/MaterialPanel'
import CodeEditorPanel from '@/components/learn/CodeEditorPanel'
import { modules, getModuleById } from '@/data/modules'

export default function LearnPage() {
  const params = useParams()
  const moduleId = params.moduleId as string
  const module = getModuleById(moduleId)
  
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    module?.topics[0]?.id || ''
  )

  const selectedTopic = module?.topics.find(t => t.id === selectedTopicId)
  const selectedTopicIndex = module?.topics.findIndex(t => t.id === selectedTopicId) || 0

  if (!module) {
    return (
      <>
        <ScanlineOverlay />
        <Navbar />
        <main className="min-h-screen flex items-center justify-center px-4">
          <PixelCard glow>
            <h1 className="font-pixel text-neon-green text-xl mb-4">
              404 - MODULE_NOT_FOUND
            </h1>
            <p className="font-mono text-text-secondary mb-4">
              Module "{moduleId}" does not exist in the database.
            </p>
            <Link href="/dashboard">
              <PixelButton>← BACK TO DASHBOARD</PixelButton>
            </Link>
          </PixelCard>
        </main>
        <Footer />
      </>
    )
  }

  const handleNextTopic = () => {
    const currentIndex = module.topics.findIndex(t => t.id === selectedTopicId)
    if (currentIndex < module.topics.length - 1) {
      setSelectedTopicId(module.topics[currentIndex + 1].id)
    }
  }

  const handlePrevTopic = () => {
    const currentIndex = module.topics.findIndex(t => t.id === selectedTopicId)
    if (currentIndex > 0) {
      setSelectedTopicId(module.topics[currentIndex - 1].id)
    }
  }

  return (
    <>
      <ScanlineOverlay />
      <Navbar />
      <main className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <PixelBadge variant="green">LEARN.exe</PixelBadge>
              <span className="font-mono text-text-muted text-xs">▶</span>
              <span className="font-mono text-neon-green text-xs">{module.title}</span>
            </div>
            <h1 className="font-pixel text-2xl text-neon-green">
              {module.title}
            </h1>
            <p className="font-mono text-text-secondary text-sm mt-1">
              {module.description}
            </p>
          </div>

          {/* Split Layout: Sidebar + Content */}
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <TopicSidebar
                topics={module.topics}
                selectedTopicId={selectedTopicId}
                onSelectTopic={setSelectedTopicId}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Material Panel */}
              {selectedTopic && (
                <MaterialPanel
                  topic={selectedTopic}
                  topicIndex={selectedTopicIndex}
                />
              )}

              {/* Code Editor */}
              {selectedTopic && (
                <CodeEditorPanel
                  starterCode={selectedTopic.starterCode}
                  solutionCode={selectedTopic.solutionCode}
                />
              )}

              {/* Visualizer Placeholder (will be replaced in Step 4-5) */}
              <PixelCard glow>
                <h2 className="font-pixel text-neon-blue text-sm mb-4">
                  🎮 VISUALIZER
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-pixel-dark border border-neon-green/30 p-3">
                    <p className="font-mono text-text-muted text-xs mb-2">📊 VARIABLES</p>
                    <p className="font-mono text-text-muted text-xs text-center">Run code to see variables</p>
                  </div>
                  <div className="bg-pixel-dark border border-neon-green/30 p-3">
                    <p className="font-mono text-text-muted text-xs mb-2">💬 OUTPUT</p>
                    <p className="font-mono text-text-muted text-xs text-center">Run code to see output</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-center gap-2">
                  <PixelButton disabled className="text-[8px] py-1 px-2">⏮</PixelButton>
                  <PixelButton disabled className="text-[8px] py-1 px-2">◀</PixelButton>
                  <PixelButton disabled className="text-[8px] py-1 px-2">▶</PixelButton>
                  <PixelButton disabled className="text-[8px] py-1 px-2">⏭</PixelButton>
                </div>
                <p className="text-center font-mono text-text-muted text-xs mt-3">
                  Animation controls will be implemented in Step 5 & 6
                </p>
              </PixelCard>

              {/* Navigation between topics */}
              <div className="flex justify-between gap-4">
                <PixelButton 
                  variant="secondary"
                  onClick={handlePrevTopic}
                  disabled={selectedTopicIndex === 0}
                >
                  ← PREV
                </PixelButton>
                <PixelButton 
                  onClick={handleNextTopic}
                  disabled={selectedTopicIndex === module.topics.length - 1}
                >
                  NEXT →
                </PixelButton>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}