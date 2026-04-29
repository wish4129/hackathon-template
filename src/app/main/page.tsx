import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { SwipeDeck } from "@/components/swipe-deck"

export default async function MainPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/")
  }

  return (
    <PageLayout user={session.user}>
      <div className="flex flex-col items-center gap-6 py-6">
        <h1 className="text-3xl font-bold tracking-tight">
          t<span className="text-yellow-400">1</span>nder
        </h1>
        <SwipeDeck />
      </div>
    </PageLayout>
  )
}
