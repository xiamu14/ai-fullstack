import { useEffect, useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { AnimatePresence, motion } from 'motion/react'
import { Heading, Text } from 'react-aria-components'
import { RiSearchLine } from '@remixicon/react'
import logo from '@/assets/logo.svg?url'
import { loadCatalog, loadDetail } from '@/server/functions'
import { Input } from '@/components/base/input/input'
import { Select, SelectItem } from '@/components/base/select/select'
import { Badge } from '@/components/base/badges/badge'
import { Chip } from '@/components/base/badges/chip'
import { modules } from '@/domain/question'
import { ModuleFilter } from '@/features/questions/module-filter'
import { QuestionTable } from '@/features/questions/question-table'
import { Pagination } from '@/components/base/pagination/pagination'
import { QuestionDrawer } from '@/features/questions/question-drawer'
import { sortQuestions } from '@/features/questions/sort-questions'
const searchSchema = z.object({
  library: z.string().default('ai-agents'),
  q: z.string().default(''),
  module: z
    .union([
      z.literal('all').transform((): (typeof modules)[number][] => []),
      z.enum(modules).transform((value) => [value]),
      z.array(z.enum(modules)),
    ])
    .default([]),
  difficulty: z.enum(['all', 'L1', 'L2', 'L3', 'L4']).default('all'),
  page: z.coerce.number().int().positive().default(1),
  question: z.string().optional(),
  sort: z.enum(['difficulty', 'publishedAt']).optional(),
  order: z.enum(['ascending', 'descending']).default('ascending'),
})
export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ library: search.library, question: search.question }),
  loader: async ({ deps }) => ({
    catalog: await loadCatalog(),
    detail: deps.question
      ? await loadDetail({ data: { libraryId: deps.library, questionId: deps.question } })
      : null,
  }),
  component: LibraryPage,
})
function LibraryPage() {
  const { catalog, detail } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const router = useRouter()
  const [query, setQuery] = useState(search.q)
  useEffect(() => setQuery(search.q), [search.q])
  useEffect(() => {
    if (query === search.q) return
    const timer = setTimeout(() => {
      void navigate({ search: (prev) => ({ ...prev, q: query, page: 1 }), replace: true })
    }, 250)
    return () => clearTimeout(timer)
  }, [query, search.q, navigate])
  function filter(patch: Partial<z.infer<typeof searchSchema>>) {
    void navigate({ search: (prev) => ({ ...prev, ...patch, page: 1, question: undefined }) })
  }
  const questions = sortQuestions(
    catalog.questions.filter(
      (q) =>
        q.libraryId === search.library &&
        (search.module.length === 0 || search.module.includes(q.module)) &&
        (search.difficulty === 'all' || q.difficulty === search.difficulty) &&
        q.title.toLocaleLowerCase().includes(search.q.trim().toLocaleLowerCase()),
    ),
    search.sort,
    search.order,
  )
  const pages = Math.max(1, Math.ceil(questions.length / 10))
  const page = Math.min(search.page, pages)
  const rows = questions.slice((page - 1) * 10, page * 10)
  const refresh = async () => {
    await router.invalidate()
  }
  return (
    <>
      <motion.main
        className="mx-auto flex min-h-dvh w-full max-w-[1600px] flex-col gap-7 px-6 py-8 sm:px-10 lg:px-14"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.header className="flex flex-wrap items-center justify-between gap-4">
          <motion.div className="flex items-center gap-3">
            <motion.img src={logo} alt="" className="size-6 shrink-0 object-contain" />
            <Heading className="text-xl font-semibold tracking-tight">面试题库</Heading>
            <Badge>{catalog.questions.filter((q) => q.libraryId === search.library).length}</Badge>
          </motion.div>
          {catalog.libraries.length === 1 ? (
            <Chip variant="bold" color="lime">
              {catalog.libraries[0].name}
            </Chip>
          ) : (
            <Select
              aria-label="选择题库"
              placement="bottom end"
              selectedKey={search.library}
              onSelectionChange={(key) => filter({ library: String(key) })}
              className="min-w-40"
            >
              {catalog.libraries.map((library) => (
                <SelectItem key={library.id} id={library.id} textValue={library.name}>
                  {library.name}
                </SelectItem>
              ))}
            </Select>
          )}
        </motion.header>
        <motion.section className="overflow-hidden rounded-2xl bg-white shadow-xs">
          <motion.div className="flex flex-wrap items-center gap-3 px-4 py-4">
            <Input
              aria-label="搜索题目"
              placeholder="搜索题目"
              value={query}
              onChange={setQuery}
              leadingIcon={RiSearchLine}
              className="w-full sm:max-w-72"
            />
            <ModuleFilter value={search.module} onChange={(module) => filter({ module })} />
            <Select
              aria-label="筛选难度"
              selectedKey={search.difficulty}
              onSelectionChange={(key) =>
                filter({ difficulty: key as z.infer<typeof searchSchema>['difficulty'] })
              }
            >
              <SelectItem id="all">全部难度</SelectItem>
              <SelectItem id="L1">L1 概念理解</SelectItem>
              <SelectItem id="L2">L2 场景应用</SelectItem>
              <SelectItem id="L3">L3 故障诊断</SelectItem>
              <SelectItem id="L4">L4 系统设计</SelectItem>
            </Select>
            <Text className="ml-auto text-xs text-neutral-500">共 {questions.length} 题</Text>
          </motion.div>
          <QuestionTable
            rows={rows}
            sort={search.sort}
            direction={search.order}
            onSort={(sort, order) => {
              void navigate({ search: (prev) => ({ ...prev, sort, order, page: 1 }) })
            }}
            open={(question) => {
              void navigate({ search: (prev) => ({ ...prev, question }) })
            }}
          />
          <motion.footer className="px-4 py-4">
            <Pagination
              page={page}
              totalPages={pages}
              previousLabel="上一页"
              nextLabel="下一页"
              aria-label="题目分页"
              onChange={(page) => {
                void navigate({ search: (prev) => ({ ...prev, page }) })
              }}
            />
          </motion.footer>
        </motion.section>
      </motion.main>
      <AnimatePresence>
        {detail && (
          <QuestionDrawer
            key={`${detail.question.libraryId}:${detail.question.id}`}
            detail={detail}
            close={() => {
              void navigate({ search: (prev) => ({ ...prev, question: undefined }) })
            }}
            refresh={refresh}
          />
        )}
      </AnimatePresence>
    </>
  )
}
