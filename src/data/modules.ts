import { Module, Topic } from '@/types/module'
import { percabanganTopics } from './topics/percabangan'
import { perulanganTopics } from './topics/perulangan'
import { strukturDataTopics } from './topics/struktur-data'

export const modules: Module[] = [
  {
    id: 'percabangan',
    title: 'Percabangan',
    description: 'Belajar if, if-else, else-if, nested if, dan switch-case',
    icon: '🔀',
    topics: percabanganTopics,
  },
  {
    id: 'perulangan',
    title: 'Perulangan',
    description: 'Belajar for, while, do-while, nested loop, break & continue',
    icon: '🔄',
    topics: perulanganTopics,
  },
  {
    id: 'struktur-data',
    title: 'Struktur Data & Algoritma',
    description: 'Belajar Array, Stack, Queue, Linear Search, Bubble Sort',
    icon: '📊',
    topics: strukturDataTopics,
  },
]

// Helper function to get module by id
export function getModuleById(id: string): Module | undefined {
  return modules.find(m => m.id === id)
}

// Helper function to get topic by module id and topic id
export function getTopicById(moduleId: string, topicId: string): Topic | undefined {
  const module = getModuleById(moduleId)
  return module?.topics.find(t => t.id === topicId)
}