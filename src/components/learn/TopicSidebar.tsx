'use client'

import { Topic } from '@/types/module'
import PixelCard from '../ui/PixelCard'

interface TopicSidebarProps {
  topics: Topic[]
  selectedTopicId: string
  onSelectTopic: (topicId: string) => void
}

export default function TopicSidebar({
  topics,
  selectedTopicId,
  onSelectTopic,
}: TopicSidebarProps) {
  return (
    <PixelCard glow className="sticky top-24">
      <h2 className="font-pixel text-neon-blue text-sm mb-4">
        📚 TOPICS
      </h2>
      <div className="space-y-2">
        {topics.map((topic, index) => (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic.id)}
            className={`
              w-full text-left font-mono text-sm py-2 px-3
              border-l-2 transition-all
              ${selectedTopicId === topic.id 
                ? 'border-neon-green bg-neon-green/10 text-neon-green' 
                : 'border-neon-green/30 text-text-secondary hover:border-neon-green/60 hover:text-text-primary'
              }
            `}
          >
            <span className="text-text-muted text-xs mr-2">
              {String(index + 1).padStart(2, '0')}
            </span>
            {topic.title}
          </button>
        ))}
      </div>
    </PixelCard>
  )
}