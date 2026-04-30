import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { QuestionFeed } from "@/components/question-feed"

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ topicId: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const { topicId } = await params

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: { orderBy: { order: "asc" } },
        },
      },
    },
  })

  if (!topic) notFound()

  const userVotes = await prisma.vote.findMany({
    where: {
      userId: session.user.id,
      option: { question: { topicId } },
    },
    select: { optionId: true },
  })
  const votedSet = new Set(userVotes.map((v) => v.optionId))

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id, question: { topicId } },
    select: { questionId: true },
  })
  const favoritedSet = new Set(favorites.map((f) => f.questionId))

  const questions = topic.questions.map((q) => ({
    id: q.id,
    title: q.title,
    options: q.options.map((o) => ({ id: o.id, text: o.text })),
    votedIds: q.options.filter((o) => votedSet.has(o.id)).map((o) => o.id),
    favorited: favoritedSet.has(q.id),
  }))

  return (
    <QuestionFeed
      questions={questions}
      topicName={topic.name}
      topicEmoji={topic.emoji}
    />
  )
}
