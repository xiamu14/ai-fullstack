import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const target = process.argv[2]
assert.match(target || '', /^[A-F0-9]+$/)
const out = new URL('../../sources/', import.meta.url)
await mkdir(out, { recursive: true })
async function call(path, body) {
  const r = await fetch(
    `http://localhost:3456/${path}`,
    body === undefined ? {} : { method: 'POST', body },
  )
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`)
  const data = await r.json()
  if (data.error) throw new Error(JSON.stringify(data.error))
  return data
}
const seen = new Map()
for (const file of (await readdir(out)).filter((x) => /^index-.*jsonl$/.test(x))) {
  for (const line of (await readFile(new URL(file, out), 'utf8'))
    .trim()
    .split('\n')
    .filter(Boolean)) {
    const card = JSON.parse(line)
    seen.set(card.id, card)
  }
}
let unchanged = 0
for (let round = 0; round < 800; round++) {
  const result = await call(
    `eval?target=${target}`,
    `JSON.stringify({cards:[...document.querySelectorAll('section.note-item')].map(e=>({id:e.dataset.noteId,title:e.querySelector('.title')?.innerText||'',author:e.querySelector('.name')?.innerText||'',url:e.querySelector('a.cover')?.href||''})),tail:document.body.innerText.slice(-300)})`,
  )
  const data = JSON.parse(result.value)
  if (/验证码|访问频繁|安全验证/.test(data.tail)) throw new Error('Access challenge: stop')
  const before = seen.size
  for (const card of data.cards) {
    assert.match(card.id, /^[a-f0-9]{24}$/)
    seen.set(card.id, card)
  }
  const cards = [...seen.values()]
  for (let i = 0; i < cards.length; i += 200) {
    await writeFile(
      new URL(`index-${String(i / 200 + 1).padStart(3, '0')}.jsonl`, out),
      cards
        .slice(i, i + 200)
        .map((x) => JSON.stringify(x))
        .join('\n') + '\n',
    )
  }
  unchanged = before === seen.size ? unchanged + 1 : 0
  console.log(JSON.stringify({ round, count: seen.size, unchanged, tail: data.tail.slice(-60) }))
  if (unchanged >= 4 || seen.size >= 4407) break
  await call(`scroll?target=${target}&direction=bottom`)
  try {
    await call(`screenshot?target=${target}&file=/tmp/xhs-collect.png`)
  } catch (error) {
    if (!String(error).includes('超时')) throw error
    console.log('截图超时，已保存索引，继续检查页面')
  }
  await new Promise((resolve) => setTimeout(resolve, 1800))
}
