'use client'

import { Topic } from '@/types/module'
import PixelCard from '../ui/PixelCard'
import PixelBadge from '../ui/PixelBadge'

interface MaterialPanelProps {
  topic: Topic
  topicIndex: number
}

export default function MaterialPanel({ topic, topicIndex }: MaterialPanelProps) {
  return (
    <PixelCard glow>
      <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
        <h2 className="font-pixel text-neon-blue text-lg">
          {topic.title}
        </h2>
        <PixelBadge variant="blue">
          TOPIC_{String(topicIndex + 1).padStart(2, '0')}
        </PixelBadge>
      </div>
      
      <div 
        className="font-mono text-text-secondary space-y-4 prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: topic.explanation }}
      />
      
      <div className="mt-6 pt-4 border-t border-neon-green/30">
        <h3 className="font-pixel text-neon-green text-sm mb-3">
          🎯 Learning Objectives
        </h3>
        <ul className="list-disc list-inside text-text-secondary space-y-1">
          {topic.learningObjectives.map((obj, idx) => (
            <li key={idx}>{obj}</li>
          ))}
        </ul>
      </div>
    </PixelCard>
  )
}