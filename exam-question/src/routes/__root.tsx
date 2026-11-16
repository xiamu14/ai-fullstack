import { HeadContent, Scripts, Outlet, createRootRoute } from '@tanstack/react-router'
import { MotionConfig } from 'motion/react'
import { Heading, Text } from 'react-aria-components'
import { Button } from '@/components/base/buttons/button'
import styles from 'virtual:boardui.css?url'
import logo from '@/assets/logo.svg?url'
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: '面试题库' },
    ],
    links: [
      { rel: 'stylesheet', href: styles },
      { rel: 'icon', type: 'image/svg+xml', href: logo },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body className="m-0 bg-neutral-50 font-sans text-neutral-950 antialiased">
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
        <Scripts />
      </body>
    </html>
  ),
  component: Outlet,
  errorComponent: ({ error, reset }) => (
    <main className="mx-auto flex max-w-lg flex-col gap-4 px-6 py-24">
      <Heading className="text-xl font-semibold">加载失败</Heading>
      <Text>{error instanceof Error ? error.message : '加载失败，请重试'}</Text>
      <Button onClick={reset}>重试</Button>
    </main>
  ),
  notFoundComponent: () => <Heading className="p-12">页面不存在</Heading>,
})
