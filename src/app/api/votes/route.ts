import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const body = (await req.json()) as { optionId?: string; value?: boolean }
  const { optionId, value } = body

  if (typeof optionId !== "string" || typeof value !== "boolean") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 })
  }

  const vote = await prisma.vote.upsert({
    where: { userId_optionId: { userId: session.user.id, optionId } },
    create: { userId: session.user.id, optionId, value },
    update: { value },
  })

  return NextResponse.json({ ok: true, id: vote.id })
}
