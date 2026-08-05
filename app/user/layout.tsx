import React from "react";
import { auth } from "@clerk/nextjs/server";

async function layout({ children }: { children: React.ReactNode }) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();
  return <div>{children}</div>;
}

export default layout;
