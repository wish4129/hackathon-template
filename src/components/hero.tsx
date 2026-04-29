export function Hero() {
  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col items-center justify-center text-center">
      <img src="/file.svg" alt="T1nder" className="h-64 w-auto md:h-80" />
      <p className="mt-4 max-w-lg text-lg text-muted-foreground">
        Build something great.
      </p>
    </div>
  )
}
