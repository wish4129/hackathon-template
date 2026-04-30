import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { id: questionId } = await params
  const body = (await req.json()) as { text?: string }
  const text = body.text?.trim()

  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 })
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true },
  })
  if (!question) {
    return NextResponse.json({ error: "question not found" }, { status: 404 })
  }

  const last = await prisma.option.findFirst({
    where: { questionId },
    orderBy: { order: "desc" },
    select: { order: true },
  })

  const option = await prisma.option.create({
    data: {
      questionId,
      text,
      order: (last?.order ?? 0) + 1,
    },
    select: { id: true, text: true },
  })

  await prisma.vote.create({
    data: { userId: session.user.id, optionId: option.id, value: true },
  })

  return NextResponse.json({ option })
}
