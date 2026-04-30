import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PageLayout } from "@/components/page-layout"
import { TopicCard } from "@/components/topic-card"

export default async function TopicsPage() {
  const session = await auth()
  if (!session?.user) redirect("/")

  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { questions: true } } },
  })

  return (
    <PageLayout user={session.user}>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Topics</h1>
          <p className="text-sm text-muted-foreground">
            Pick a topic and swipe through the questions.
          </p>
        </div>

        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
          {topics.map((topic, i) => (
            <TopicCard
              key={topic.id}
              id={topic.id}
              name={topic.name}
              emoji={topic.emoji}
              questionCount={topic._count.questions}
              index={i}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
