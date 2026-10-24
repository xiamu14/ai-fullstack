import { RiCheckLine } from '@remixicon/react'
import { Select, SelectItem } from '@/components/base/select/select'
import { moduleLabel, modules } from '@/domain/question'

export function ModuleFilter({
  value,
  onChange,
}: {
  value: (typeof modules)[number][]
  onChange: (value: (typeof modules)[number][]) => void
}) {
  return (
    <Select
      aria-label="筛选模块"
      selectionMode="multiple"
      value={value}
      onChange={(keys) =>
        onChange(keys.includes('all') ? [] : modules.filter((module) => keys.includes(module)))
      }
      placeholder="全部模块"
      renderValue={
        value.length === 0
          ? '全部模块'
          : value.length === 1
            ? moduleLabel(value[0])
            : `已选 ${value.length} 项`
      }
    >
      <SelectItem id="all" textValue="全部模块" className="flex items-center justify-between gap-2">
        全部模块
        {value.length === 0 && <RiCheckLine aria-hidden className="size-4" />}
      </SelectItem>
      {modules.map((module) => (
        <SelectItem
          key={module}
          id={module}
          textValue={moduleLabel(module)}
          className="flex items-center justify-between gap-2"
        >
          {moduleLabel(module)}
          {value.includes(module) && <RiCheckLine aria-hidden className="size-4" />}
        </SelectItem>
      ))}
    </Select>
  )
}
