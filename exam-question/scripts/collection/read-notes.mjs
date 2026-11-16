import { readdir, readFile, writeFile, mkdir, access } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { db } from '../../src/server/db.ts'

const target = process.argv[2]
assert.match(target || '', /^[A-F0-9]+$/)
const sql = db()
let storedSources
try {
  storedSources = new Set(
    (await sql`SELECT id FROM sources WHERE library_id='ai-agents'`).map((row) => row.id),
  )
} finally {
  await sql.end()
}
const root = new URL('../../sources/', import.meta.url)
const details = new URL('notes/', root)
await mkdir(details, { recursive: true })
const start = Date.parse('2026-01-01T00:00:00+08:00')
const end = Date.parse('2026-10-23T00:00:00+08:00')
assert.ok(start < end)
const relevant =
  /agent|智能体|harness|rag|mcp|langchain|langgraph|大模型|意图识别|上下文|多轮|面试|简历.*项目|项目.*简历|function.?call|tool.?call|sse|memory|eval|记忆.*ai|ai.*记忆|skill|claude.?code|codex|ai.*开发|开发.*ai|长期记忆|工具.*规划|ReAct|Just in time Context|AI.*代理|AI.*同事|静态评测|推理.*缓存|LLM.*成本|Token.*监控|Strands Decider|OpenSquilla|DeerFlow|CoPaw|AI.*原生研发|模型.*拒答|AI.*安全边界|深入理解AI Agen|AI.*自己学新|LangWatch/i
async function call(path, body) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(
      `http://localhost:3456/${path}`,
      body === undefined ? {} : { method: 'POST', body },
    )
    const result = await response.json()
    if (response.ok && !result.error) return result
    if (!String(result.error).includes('超时') || attempt === 2)
      throw new Error(JSON.stringify(result))
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }
}
let idle = 0
while (idle < 4) {
  const files = (await readdir(root)).filter((x) => /^index-.*jsonl$/.test(x)).sort()
  const cards = (await Promise.all(files.map((x) => readFile(new URL(x, root), 'utf8')))).flatMap(
    (x) => x.trim().split('\n').filter(Boolean).map(JSON.parse),
  )
  let added = 0
  for (const card of cards.filter((x) => relevant.test(x.title))) {
    if (storedSources.has(card.id)) continue
    const file = new URL(`${card.id}.json`, details)
    try {
      await access(file)
      continue
    } catch {}
    await call(`navigate?target=${target}`, card.url)
    const result = await call(
      `eval?target=${target}`,
      `JSON.stringify((()=>{const n=window.__INITIAL_STATE__?.note?.noteDetailMap?.[${JSON.stringify(card.id)}]?.note; if(!n?.time)return {status:'unavailable',message:document.querySelector('.note-detail-mask')?.innerText?.slice(0,300)||document.title}; const base={published:n.time,updated:n.lastUpdateTime,dateText:document.querySelector('.note-detail-mask .date')?.innerText}; if(n.time<${start}||n.time>=${end})return {...base,status:'outside-date'};return {...base,status:'read',title:n.title,description:n.desc,type:n.type,images:n.imageList?.map(x=>({url:x.urlDefault||x.urlPre||x.url,info:x.infoList})),tags:n.tagList?.map(x=>x.name)};})())`,
    )
    const data = JSON.parse(result.value)
    if (/验证码|访问频繁|安全验证/.test(data.message || ''))
      throw new Error('Access challenge: stop')
    await writeFile(file, JSON.stringify({ ...card, ...data }) + '\n')
    added++
    console.log(JSON.stringify({ id: card.id, status: data.status, title: card.title }))
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }
  idle = added ? 0 : idle + 1
  await new Promise((resolve) => setTimeout(resolve, 5000))
}
