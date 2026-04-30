"use client"

import Image from "next/image"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ReactNode } from "react"

export interface NavbarUser {
  name: string | null
  email: string | null
  image: string | null
}

interface NavbarProps {
  user: NavbarUser | null
  authEnabled: boolean
  left?: ReactNode
  center?: ReactNode
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function Navbar({ user, authEnabled, left, center }: NavbarProps) {
  return (
    <nav className="border-b border-black/50 bg-black">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {left ?? (
          <Link href="/" className="flex items-center hover:opacity-80">
            <Image
              src="/logo.png"
              alt="T1nder"
              width={200}
              height={56}
              priority
              className="h-8 w-auto"
            />
          </Link>
        )}

        {center && (
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2">
            <div className="pointer-events-auto">{center}</div>
          </div>
        )}

        {user ? (
          authEnabled ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted outline-none">
                <Avatar size="sm">
                  {user.image && <AvatarImage src={user.image} alt={user.name ?? "User"} />}
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <span>{user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>{user.email}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <Link href="/api/auth/dev-signout" className={buttonVariants({ size: "sm" })}>
                Sign out
              </Link>
            </div>
          )
        ) : null}
      </div>
    </nav>
  )
}
