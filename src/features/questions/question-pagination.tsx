import { motion } from 'motion/react'
import { Text } from 'react-aria-components'
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react'
import { Button } from '@/components/base/buttons/button'

export function paginationItems(page: number, pages: number): (number | 'start-gap' | 'end-gap')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
  if (page <= 4) return [1, 2, 3, 4, 5, 'end-gap', pages]
  if (page >= pages - 3) return [1, 'start-gap', pages - 4, pages - 3, pages - 2, pages - 1, pages]
  return [1, 'start-gap', page - 1, page, page + 1, 'end-gap', pages]
}

export function QuestionPagination({
  page,
  pages,
  onPageChange,
}: {
  page: number
  pages: number
  onPageChange: (page: number) => void
}) {
  return (
    <motion.footer className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
      <Text className="text-xs text-neutral-500">
        第 {page} / {pages} 页
      </Text>
      <nav aria-label="题目分页" className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="small"
          leadingIcon={RiArrowLeftSLine}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          上一页
        </Button>
        {paginationItems(page, pages).map((item) =>
          typeof item === 'number' ? (
            <Button
              key={item}
              variant={item === page ? 'secondary' : 'ghost'}
              size="small"
              className="min-w-8 tabular-nums"
              aria-label={`第 ${item} 页`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          ) : (
            <span key={item} aria-hidden="true" className="px-1 text-neutral-400">
              …
            </span>
          ),
        )}
        <Button
          variant="secondary"
          size="small"
          trailingIcon={RiArrowRightSLine}
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          下一页
        </Button>
      </nav>
    </motion.footer>
  )
}
