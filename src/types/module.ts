// Type definitions for modules and topics

export interface Topic {
  id: string
  title: string
  description: string
  explanation: string        // HTML content or markdown
  starterCode: string        // Kode C++ untuk editor (template)
  solutionCode: string       // Kode C++ contoh lengkap
  learningObjectives: string[]
}

export interface Module {
  id: string
  title: string
  description: string
  icon: string
  topics: Topic[]
}