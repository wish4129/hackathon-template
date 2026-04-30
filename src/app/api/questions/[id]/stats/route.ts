import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const options = await prisma.option.findMany({
    where: { questionId: id },
    orderBy: { order: "asc" },
    select: { id: true, text: true },
  })

  if (options.length === 0) {
    return NextResponse.json({ options: [] })
  }

  const grouped = await prisma.vote.groupBy({
    by: ["optionId"],
    where: { optionId: { in: options.map((o) => o.id) }, value: true },
    _count: { _all: true },
  })

  const yesByOption = new Map<string, number>()
  for (const o of options) yesByOption.set(o.id, 0)
  for (const row of grouped) {
    yesByOption.set(row.optionId, row._count._all)
  }

  const totalYes = Array.from(yesByOption.values()).reduce((a, b) => a + b, 0)

  // Largest-remainder rounding, but tied vote counts always get the same percent
  // (so 1/1/1 renders as 33/33/33, not 33/33/34).
  const raw = options.map((o) => {
    const yes = yesByOption.get(o.id) ?? 0
    const pct = totalYes === 0 ? 0 : (yes / totalYes) * 100
    return { o, yes, floor: Math.floor(pct), remainder: pct - Math.floor(pct) }
  })
  let deficit = totalYes === 0 ? 0 : 100 - raw.reduce((a, r) => a + r.floor, 0)
  const bonus = new Set<number>()

  // Group indices by equal yes count, descending by remainder.
  const groups = new Map<number, number[]>()
  for (let i = 0; i < raw.length; i++) {
    const arr = groups.get(raw[i].yes) ?? []
    arr.push(i)
    groups.set(raw[i].yes, arr)
  }
  const orderedGroups = Array.from(groups.values()).sort(
    (a, b) => raw[b[0]].remainder - raw[a[0]].remainder,
  )
  for (const group of orderedGroups) {
    // Never round up a group whose exact percentage has no fractional part
    // (e.g. options with 0 yes votes — they should stay at 0%).
    if (raw[group[0]].remainder === 0) continue
    if (deficit >= group.length) {
      for (const i of group) bonus.add(i)
      deficit -= group.length
    }
  }

  const result = raw.map((r, i) => ({
    optionId: r.o.id,
    text: r.o.text,
    yes: r.yes,
    total: totalYes,
    percent: r.floor + (bonus.has(i) ? 1 : 0),
  }))

  return NextResponse.json({ options: result })
}
