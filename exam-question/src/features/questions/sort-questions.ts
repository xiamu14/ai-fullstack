import type { loadCatalog } from '@/server/functions'

export type QuestionRow = Awaited<ReturnType<typeof loadCatalog>>['questions'][number]
export type QuestionSort = 'difficulty' | 'publishedAt'
export type SortDirection = 'ascending' | 'descending'

export function sortQuestions(
  questions: QuestionRow[],
  column: QuestionSort | undefined,
  direction: SortDirection,
) {
  if (!column) return questions
  return [...questions].sort((a, b) => {
    let comparison: number
    if (column === 'publishedAt') {
      if (a.publishedAt === null || b.publishedAt === null) {
        if (a.publishedAt !== b.publishedAt) return a.publishedAt === null ? 1 : -1
        return a.id.localeCompare(b.id)
      }
      comparison = Date.parse(a.publishedAt) - Date.parse(b.publishedAt)
    } else {
      comparison = a.difficulty.localeCompare(b.difficulty)
    }
    return (direction === 'descending' ? -comparison : comparison) || a.id.localeCompare(b.id)
  })
}
