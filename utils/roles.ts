import {  clerkClient } from "@clerk/nextjs/server";

export async function checkUserRole(
  userid: string,
  role: string,
): Promise<boolean> {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userid);
  if (user && user.publicMetadata.role) {
    return user.publicMetadata.role === role;
  }
  else{
    return false;
  }
}

export async function getUserRole(userid:string): Promise<string | undefined> {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userid);
  if (user && user.publicMetadata.role) {
    return String(user.publicMetadata.role);
  }
  throw new Error("failed to getuser role")
}
