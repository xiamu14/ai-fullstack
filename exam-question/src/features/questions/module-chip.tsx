import { Chip, type ChipProps } from '@/components/base/badges/chip'
import { moduleLabel, type Question } from '@/domain/question'

const colors = {
  模型交互: 'purple',
  检索增强: 'cyan',
  决策编排: 'blue',
  工具执行: 'orange',
  上下文记忆: 'rose',
  工程质量: 'lime',
  系统设计: 'yellow',
} satisfies Record<Question['module'], ChipProps['color']>

export function ModuleChip({ module }: { module: Question['module'] }) {
  return (
    <Chip variant="bold" color={colors[module]}>
      {moduleLabel(module)}
    </Chip>
  )
}
