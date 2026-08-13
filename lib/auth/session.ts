import { redirect } from "next/navigation"

import { auth } from "./server"
import { syncUser } from "./sync-user"

export async function requireUser() {
  const { data: session } = await auth.getSession()
  const sessionUser = session?.user

  if (!sessionUser?.id || !sessionUser.email) {
    redirect("/auth/sign-in")
  }

  return syncUser({
    id: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.name,
    image: sessionUser.image,
  })
}
