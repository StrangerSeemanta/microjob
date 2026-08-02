

import Link from "next/link";
import { Show, SignInButton } from "@clerk/nextjs";
import UserDashboard from "./UserDashboard";

function CreateAccountBtn() {
  return (
    <>
      <Show when="signed-out">
        <SignInButton>
          <Link
            href="/account"
            className="bg-red-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Create Account
          </Link>
        </SignInButton>
      </Show>
      <Show when="signed-in">
       <UserDashboard />
      </Show>
    </>
  );
}

export default CreateAccountBtn;
