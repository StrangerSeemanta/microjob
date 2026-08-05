import React from "react";
import {UserProfile} from "@clerk/nextjs"

function page() {
  return (
    <div className="userDetailsHolder w-full h-fit flex justify-center items-center">
        <UserProfile />
      </div>
  );
}

export default page;
