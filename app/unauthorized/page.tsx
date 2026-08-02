import React from 'react'
import { currentUser } from "@clerk/nextjs/server";

const user = await currentUser();

console.log(user?.publicMetadata);
async function page() {
  return (
    <div className="flex justify-center items-center flex-col min-h-screen w-full">Unauthorized Attempt detected !!! <h1 className="text-xl font-bold text-red-500">You are not authorized to access this page.</h1></div>
  )
}

export default page