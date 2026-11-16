import { ModuleChip } from './module-chip'
import { motion } from 'motion/react'
import { Text } from 'react-aria-components'
import { RiArrowUpLine } from '@remixicon/react'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/base/table/table'
import { Button } from '@/components/base/buttons/button'
import { Badge } from '@/components/base/badges/badge'
import type { QuestionRow, QuestionSort, SortDirection } from './sort-questions'
export function QuestionTable({
  rows,
  open,
  sort,
  direction,
  onSort,
}: {
  rows: QuestionRow[]
  open: (id: string) => void
  sort: QuestionSort | undefined
  direction: SortDirection
  onSort: (column: QuestionSort, direction: SortDirection) => void
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <Table
        aria-label="面试题库"
        size="sm"
        sortDescriptor={sort ? { column: sort, direction } : undefined}
        onSortChange={({ column, direction }) => {
          if (column === 'difficulty' || column === 'publishedAt') onSort(column, direction)
        }}
        className="w-full border-collapse [&_th]:whitespace-nowrap [&_th]:bg-neutral-100/80 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-medium [&_th]:text-neutral-500 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-sm [&_tr]:outline-none [&_tbody_tr]:border-b [&_tbody_tr]:border-neutral-100 [&_tbody_tr:hover]:bg-neutral-50 [&_tr[data-focus-visible]]:ring-2 [&_tr[data-focus-visible]]:ring-inset [&_tr[data-focus-visible]]:ring-blue-500"
      >
        <TableHeader>
          <TableColumn isRowHeader className="w-full">
            面试题目
          </TableColumn>
          <TableColumn>模块</TableColumn>
          <TableColumn id="difficulty" allowsSorting className="cursor-pointer">
            {({ sortDirection }) => <SortHeading direction={sortDirection}>难度</SortHeading>}
          </TableColumn>
          <TableColumn id="publishedAt" allowsSorting className="cursor-pointer">
            {({ sortDirection }) => <SortHeading direction={sortDirection}>原帖时间</SortHeading>}
          </TableColumn>
          <TableColumn>操作</TableColumn>
        </TableHeader>
        <TableBody
          items={rows}
          renderEmptyState={() => (
            <Text className="block px-4 py-16 text-center text-sm text-neutral-500">暂无题目</Text>
          )}
        >
          {(row) => (
            <TableRow id={row.id}>
              <TableCell>
                <span className="font-semibold">{row.title}</span>
                {row.archived && <Badge className="ml-2">已归档</Badge>}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <ModuleChip module={row.module} />
              </TableCell>
              <TableCell className="whitespace-nowrap">{row.difficulty}</TableCell>
              <TableCell className="whitespace-nowrap tabular-nums">{row.publishedOn}</TableCell>
              <TableCell>
                <Button
                  variant="secondary"
                  size="small"
                  aria-label={`查看详情：${row.title}`}
                  onClick={() => open(row.id)}
                >
                  详情
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </motion.div>
  )
}

function SortHeading({ children, direction }: { children: string; direction?: SortDirection }) {
  return (
    <motion.span className="inline-flex items-center gap-1">
      {children}
      <motion.span
        aria-hidden
        animate={{ rotate: direction === 'descending' ? 180 : 0, opacity: direction ? 1 : 0.35 }}
        transition={{ duration: 0.15 }}
      >
        <RiArrowUpLine className="size-3.5" />
      </motion.span>
    </motion.span>
  )
}
