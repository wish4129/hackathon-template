import { auth, signIn } from "@/lib/auth"
import { redirect } from "next/navigation"
import Image from "next/image"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"

const AUTH_ENABLED = process.env.AUTH_ENABLED === "true"

export default async function HomePage() {
  const session = await auth()

  if (session?.user) {
    redirect("/topics")
  }

  return (
    <PageLayout user={null}>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex w-full max-w-md flex-col items-center gap-10 rounded-2xl bg-zinc-950 px-10 py-14 shadow-2xl">
          <Image
            src="/logo.png"
            alt="T1nder"
            width={320}
            height={96}
            priority
            className="h-auto w-auto max-w-[260px]"
          />
          <form
            action={async () => {
              "use server"
              if (AUTH_ENABLED) {
                await signIn("oidc", { redirectTo: "/topics" })
              } else {
                await signIn()
              }
            }}
            className="w-full"
          >
            <Button
              type="submit"
              size="lg"
              variant="secondary"
              className="w-full rounded-full text-base font-semibold"
            >
              Sign in with Okta
            </Button>
          </form>
        </div>
      </div>
    </PageLayout>
  )
}
